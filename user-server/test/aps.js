/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the authentication/permission system.
 */

import { TokenSigner } from 'jsontokens';

var assert = require("assert");
var aps = require("../routes/aps");

// Tests here

describe("Authenticating and granting permission to users", function() {

    var alice   = "alice.id";
    var bob     = "bob.id";
    var mallory = "mallory.id";

    // TODO: Get private keys from Blockstack browser
    var alicePrivateKey   = "";
    var bobPrivateKey     = "";
    var malloryPrivateKey = "";

    var data = {id: 0, content: "This is some sample text"};
    var encAlg = "ES256k";
    var aliceEncData   = new TokenSigner(encAlg, alicePrivateKey).sign(data);
    var bobEncData     = new TokenSigner(encAlg, bobPrivateKey).sign(data);
    var malloryEncData = new TokenSigner(encAlg, malloryPrivateKey).sign(data);

    // TODO: Before tests, set up database with Alice as owner.


    // Test normal use
    it("Verifies owner requesting owner-level permissions", function() {
        verification = aps.verifyRequest(aliceEncData, alice, aps.permissions.owner);

        assert.true(verification.ok);
        assert.equal(verification.decodedData, JSON.stringify(data));
        assert.equal(verification.errorMsg, "");
    });

    it("Verifies owner requesting regular permissions", function() {
        verification = aps.verifyRequest(aliceEncData, alice, aps.permissions.regular);

        assert.true(verification.ok);
        assert.equal(verification.decodedData, JSON.stringify(data));
        assert.equal(verification.errorMsg, "");
    });

    it("Verifies regular user requesting regular permissions", function() {
        verification = aps.verifyRequest(bobEncData, bob, aps.permissions.regular);

        assert.true(verification.ok);
        assert.equal(verification.decodedData, JSON.stringify(data));
        assert.equal(verification.errorMsg, "");
    });


    // Test user pretending to be someone else
    it("Denies a user with an invalid signature", function() {
        // Mallory pretending to be Alice
        verification = aps.verifyRequest(malloryEncData, alice, aps.permissions.regular);

        assert.false(verification.ok);
        assert.equal(verification.decodedData, "");
        assert.notEqual(verification.errorMsg, "");
    });

    // Test non-owner trying to access owner permissions
    it("Denies a regular user requesting owner-level permissions", function() {
        // Mallory tries to get owner-level permissions
        verification = aps.verifyRequest(malloryEncData, mallory, aps.permissions.owner);

        assert.false(verification.ok);
        assert.equal(verification.decodedData, "");
        assert.notEqual(verification.errorMsg, "");
    });
});
