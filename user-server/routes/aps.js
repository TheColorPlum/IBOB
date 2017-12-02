/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's authentication/permissions system (APS)
 * (see documentation for details).
 */

// Permission levels
permissions = {
    owner: 0,
    regular: 1
};


/*
 * Authenticates the requester (requester, their Blockstack ID) as the one who
 * actually sent the request (encData, a JWT) and has the permission level
 * specified (reqPermission, one of the above permissions).
 *
 * See documentation for more details.
 */
function verifyRequest(encData, requester, reqPermission) {
    // TODO: Implement verifyRequest()
    return {
        ok: false,
        decodedData: "",
        errorMsg: "Request denied: authentication failed."
    }
}
