/*
 * initialization.js
 * Author: Michael Friedman
 *
 * Scripts for initialization page.
 */

$(document).ready(function() {

/******************************************************************************/

// Some constants

const baseUrl = window.location.protocol + '//' + window.location.hostname;
const privateKeyFile = 'privateKey.json';

/******************************************************************************/

// Process info when "Go" button is pressed

$('#go-button').click(function() {
    var processingMessage = 'Creating your cloud storage. Please wait (this '
      + 'may take a little while)...';
    var notSignedInMessage = 'You must sign in first! Redirecting to the '
      + 'login page...';
    var noPrivateKeyMessage = 'Please enter your private key.';
    var failedMessage = 'Oops! Something went wrong. Try again.';
    var successMessage = 'All done! Going to your feed now...';


    // Make sure user is signed in. They should already be signed in, since
    // they are only directed to this page after signing in. But just double
    // check in case they got here by accident.
    if (!blockstack.isUserSignedIn()) {
        $('#message').text(notSignedInMessage);
        //window.location.replace(baseUrl);
        return;
    }

    // Make sure private key was actually typed in
    var privateKey = $('#private-key').val();
    if (privateKey === '') {
        $('#message').text(noPrivateKeyMessage);
        return;
    }

    // Display a message while we wait
    $('#message').text(processingMessage);


    // Make request to create a user-server for this user
    // TODO: Get bsid from blockstack.js somehow
    var bsid = 'alice.id';
    var reqBody = {privateKey: privateKey};
    $.post('/create-user-server?requester=' + bsid, reqBody, (data, status) => {
        var json = JSON.parse(data);

        if (!json.success) {
            // Request failed. Display failure message to user
            $('#message').text(failedMessage);
            console.log('/create-user-server request failed. Error message: '
              + json.errorMsg);
            return;
        }


        // Success! Store IP address and private key in browser for reference
        // from other pages
        sessionStorage.setItem('userServerIp', json.ip);
        sessionStorage.setItem('privateKey', privateKey);


        // Store private key in Blockstack storage
        var content = JSON.stringify({
            privateKey: privateKey
        });
        blockstack.putFile(privateKeyFile, content, false)
        .then(() => {

            // Now we're done. Redirect to feed page
            window.location.replace(baseUrl + '/feed');


        }).catch(() => {
            $('message').text(failedMessage);
            console.log('Failed to put private key in Blockstack storage.');
        });

    });
});



/******************************************************************************/

});
