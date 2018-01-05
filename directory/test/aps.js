/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the authentication/permission system.
 */

var assert = require("assert");
var aps = require("../lib/aps");
var constants = require("../lib/constants");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var jsontokens = require("jsontokens");

/******************************************************************************/

// Tests here

describe("Authenticating and granting permission to users", function() {

    // Test normal use
    it("Verifies admin asking for permission to write to a user Alice", function(done) {
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var adminEncData = new jsontokens.TokenSigner(aps.encAlg, constants.adminPrivateKey).sign(data);

        aps.verifyRequest(adminEncData, constants.adminBsid, aps.permissions.write).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, constants.alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, constants.aliceBsid, aps.permissions.read).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var bobEncData = new jsontokens.TokenSigner(aps.encAlg, constants.bobPrivateKey).sign(data);
        aps.verifyRequest(bobEncData, constants.bobBsid, aps.permissions.read).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, constants.malloryPrivateKey).sign(data);

        aps.verifyRequest(malloryEncData, constants.aliceBsid, aps.permissions.write).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, constants.alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, constants.aliceBsid, aps.permissions.write).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, constants.malloryPrivateKey).sign(data);

        aps.verifyRequest(malloryEncData, constants.malloryBsid, aps.permissions.write).then(verification => {
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
        var data = {bsid: constants.aliceBsid, timestamp: past};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, constants.alicePrivateKey).sign(data);

        aps.verifyRequest(aliceEncData, constants.aliceBsid, aps.permissions.read).then(verification => {
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
