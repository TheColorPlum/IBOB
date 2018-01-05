/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the authentication/permission system.
 */

var assert = require("assert");
var aps = require("../lib/aps");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var jsontokens = require("jsontokens");

/******************************************************************************/

var alice   = "alice.id";
var bob     = "bob.id";
var mallory = "mallory.id";
var admin   = "admin.id";

// Private keys from dummy blockstack core
var alicePrivateKey   = "86fc2fd6b25e089ed7e277224d810a186e52305d105f95f23fd0e10c1f15854501";
var bobPrivateKey     = "3548b2141ac92ada2aa7bc8391f15b8d70881956f7c0094fdde72313d06393b601";
var malloryPrivateKey = "af8d0f959ab8bed4399d60b7d5c568d9ec7eecf0da10bedeec3247eb5fcca1be01";
var adminPrivateKey   = "989891b175321d7042a97da0cafdce73fe18a8c1d2bafe158c119ca46545e2fc01";


/******************************************************************************/

// Tests here

describe("Authenticating and granting permission to users", function() {

    // Test normal use
    it("Verifies admin asking for permission to write to a user Alice", function(done) {
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var adminEncData = new jsontokens.TokenSigner(aps.encAlg, adminPrivateKey).sign(data);

        aps.verifyRequest(adminEncData, admin, aps.permissions.write).then(verification => {
            try {
                assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
                assert.strictEqual(verification.decodedData, JSON.stringify(data), "Decoded data did not match original data");
                assert.strictEqual(verification.errorMsg, "", "Error message was not empty");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it("Verifies Alice asking for permission to read from herself", function(done) {
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, alice, aps.permissions.read).then(verification => {
            try {
                assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
                assert.strictEqual(verification.decodedData, JSON.stringify(data), "Decoded data did not match original data");
                assert.strictEqual(verification.errorMsg, "", "Error message was not empty");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    it("Verifies some other user requesting to read from Alice", function(done) {
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var bobEncData = new jsontokens.TokenSigner(aps.encAlg, bobPrivateKey).sign(data);
        aps.verifyRequest(bobEncData, bob, aps.permissions.read).then(verification => {
            try {
                assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
                assert.strictEqual(verification.decodedData, JSON.stringify(data), "Decoded data did not match original data");
                assert.strictEqual(verification.errorMsg, "");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    // Test user pretending to be someone else (with their signature)
    it("Denies a user with an invalid signature", function(done) {
        // Mallory pretending to be Alice
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, malloryPrivateKey).sign(data);

        aps.verifyRequest(malloryEncData, alice, aps.permissions.write).then(verification => {
            try {
                assert.strictEqual(verification.ok, false, "ok came back true");
                assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
                assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
                assert(verification.errorMsg.match("[S,s]ignature"), 'Failed for the wrong reason. Error message: "' + verification.errorMsg + '"');
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    // Test someone trying to write to their own entry
    it("Denies a non-admin requesting to write to their own entry", function(done) {
        // Alice tries to write to herself
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, alice, aps.permissions.write).then(verification => {
            try {
                assert.strictEqual(verification.ok, false, "ok came back true");
                assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
                assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
                assert(verification.errorMsg.match("[P,p]ermission"), 'Failed for the wrong reason. Error message: "' + verification.errorMsg + '"');
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    // Test someone trying to write to someone else
    it("Denies a non-admin requesting to write to someone else's entry", function(done) {
        // Mallory tries to write to Alice (as herself)
        var data = {bsid: alice, timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, malloryPrivateKey).sign(data);

        aps.verifyRequest(malloryEncData, mallory, aps.permissions.write).then(verification => {
            try {
                assert.strictEqual(verification.ok, false, "ok came back true");
                assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
                assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
                assert(verification.errorMsg.match("[P,p]ermission"), 'Failed for the wrong reason. Error message: "' + verification.errorMsg + '"');
                done();
            } catch (err) {
                done(err);
            }
        });
    });


    // Test that an expired request (timestamp is too early) gets rejected
    it("Denies an expired timestamp", function(done) {
        var now = new Date();
        var past = new Date(now.getTime() - 10000);
        var data = {bsid: alice, timestamp: past};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, alice, aps.permissions.read).then(verification => {
            try {
                assert.strictEqual(verification.ok, false, "ok came back true");
                assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
                assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
                assert(verification.errorMsg.match("[E,e]xpire"), 'Failed for the wrong reason. Error message "' + verification.errorMsg + '"');
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
