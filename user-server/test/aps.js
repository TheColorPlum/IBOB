/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the authentication/permission system.
 */

var assert = require("assert");
var aps = require("../routes/aps");
var jsontokens = require("jsontokens");

// Tests here

describe("Authenticating and granting permission to users", function() {

    var alice   = "alice.id";
    var bob     = "bob.id";
    var mallory = "mallory.id";

    // TODO: Get actual private keys from Blockstack browser. These are just fillers.
    var alicePrivateKey   = "86fc2fd6b25e089ed7e277224d810a186e52305d105f95f23fd0e10c1f15854501";
    var bobPrivateKey     = "3548b2141ac92ada2aa7bc8391f15b8d70881956f7c0094fdde72313d06393b601";
    var malloryPrivateKey = "af8d0f959ab8bed4399d60b7d5c568d9ec7eecf0da10bedeec3247eb5fcca1be01";

    // TODO: Before tests, set up database with Alice as owner.


    // Test normal use
    it("Verifies owner requesting owner-level permissions", function() {
        var data = {id: 0, content: "This is some sample text", timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        return aps.verifyRequest(aliceEncData, alice, aps.permissions.owner).then(verification => {
            assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
            assert.strictEqual(verification.decodedData, JSON.stringify(data), "Decoded data did not match original data");
            assert.strictEqual(verification.errorMsg, "", "Error message was not empty");
        });
    });

    it("Verifies owner requesting regular permissions", function() {
        var data = {id: 0, content: "This is some sample text", timestamp: (new Date()).toJSON()};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        return aps.verifyRequest(aliceEncData, alice, aps.permissions.regular).then(verification => {
            assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
            assert.strictEqual(verification.decodedData, JSON.stringify(data), "Decoded data did not match original data");
            assert.strictEqual(verification.errorMsg, "", "Error message was not empty");
        });
    });

    it("Verifies regular user requesting regular permissions", function() {
        var data = {id: 0, content: "This is some sample text", timestamp: (new Date()).toJSON()};
        var bobEncData = new jsontokens.TokenSigner(aps.encAlg, bobPrivateKey).sign(data);
        return aps.verifyRequest(bobEncData, bob, aps.permissions.regular).then(verification => {
            assert.strictEqual(verification.ok, true, 'ok came back false. Error message: "' + verification.errorMsg + '"');
            assert.strictEqual(verification.decodedData, JSON.stringify(data));
            assert.strictEqual(verification.errorMsg, "");
        });
    });


    // Test user pretending to be someone else
    it("Denies a user with an invalid signature", function() {
        // Mallory pretending to be Alice
        var data = {id: 0, content: "This is some sample text", timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, malloryPrivateKey).sign(data);

        return aps.verifyRequest(malloryEncData, alice, aps.permissions.regular).then(verification => {
            assert.strictEqual(verification.ok, false, "ok came back true");
            assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
            assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
            assert(verification.errorMsg.match("[S,s]ignature"), 'Failed for the wrong reason. Error message: "' + verification.errorMsg + '"');
        });
    });

    // Test non-owner trying to access owner permissions
    it("Denies a regular user requesting owner-level permissions", function() {
        // Mallory tries to get owner-level permissions
        var data = {id: 0, content: "This is some sample text", timestamp: (new Date()).toJSON()};
        var malloryEncData = new jsontokens.TokenSigner(aps.encAlg, malloryPrivateKey).sign(data);

        return aps.verifyRequest(malloryEncData, mallory, aps.permissions.owner).then(verification => {
            assert.strictEqual(verification.ok, false, "ok came back true");
            assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
            assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
            assert(verification.errorMsg.match("[P,p]ermission"), 'Failed for the wrong reason. Error message: "' + verification.errorMsg + '"');
        });
    });

    // Test that an expired request (timestamp is too early) gets rejected
    it("Denies an expired timestamp", function() {
        var now = new Date();
        var past = new Date(now.getTime() - 10000);
        var data = {id: 0, content: "This is some sample text", timestamp: past};
        var aliceEncData = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);

        return aps.verifyRequest(aliceEncData, alice, aps.permissions.owner).then(verification => {
            assert.strictEqual(verification.ok, false, "ok came back true");
            assert.strictEqual(verification.decodedData, "", "Decoded data came back non-empty");
            assert.notStrictEqual(verification.errorMsg, "", "There was no error message");
            assert(verification.errorMsg.match("[E,e]xpire"), 'Failed for the wrong reason. Error message "' + verification.errorMsg + '"');
        });
    });
});
