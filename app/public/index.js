/*
 * index.js
 * Author: Michael Friedman
 *
 * Scripts for the index (login) page.
 */

// document.addEventListener("DOMContentLoaded", function(event) {
//   document.getElementById('signin-button').addEventListener('click', function(event) {
//     event.preventDefault()
//     blockstack.redirectToSignIn()
//   })
//   document.getElementById('signout-button').addEventListener('click', function(event) {
//     event.preventDefault()
//     blockstack.signUserOut(window.location.href)
//   })

//   function showProfile(profile) {
//     var person = new blockstack.Person(profile)
//     document.getElementById('heading-name').innerHTML = person.name() ? person.name() : "Nameless Person"
//     if(person.avatarUrl()) {
//       document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
//     }
//     document.getElementById('section-1').style.display = 'none'
//     document.getElementById('section-2').style.display = 'block'
//   }

//   if (blockstack.isUserSignedIn()) {
//     var profile = blockstack.loadUserData().profile
//       showProfile(profile)
//   } else if (blockstack.isSignInPending()) {
//     blockstack.handlePendingSignIn().then(function(userData) {
//       window.location = window.location.origin
//     })
//   }
// })


/******************************************************************************/

$(document).ready(function() {

/******************************************************************************/

// Constants

const baseUrl = window.location.protocol + '//' + window.location.host;
const directoryBaseUrl = 'http://localhost:4000';
const privateKeyFile = 'privateKey.json';

// Keys into sessionStorage for private key and user-server IP address
const sessionStoragePrivateKey = 'privateKey';
const sessionStorageIp = 'userServerIp';


/******************************************************************************/

// Sign user in when they click the sign-in button
$('#signin-button').click(function() {
    blockstack.redirectToSignIn();
});


// Once signed in...
if (blockstack.isUserSignedIn()) {

    console.log('User is signed in. Checking if they have a user-server...');

    // Check if this user has been setup with a user-server yet by checking
    // directory
    // TODO: Get bsid from blockstack.js somehow
    var bsid = 'alice.id';
    $.get(directoryBaseUrl + '/api/get/' + bsid, (data, status) => {
        var json = data;

        if (json.success) { // user has been set up
            console.log('User has a user-server. Redirecting to feed...');

            // Save IP in sessionStorage
            sessionStorage.setItem(sessionStorageIp, json.ip);

            // Get private key from storage, save in sessionStorage
            blockstack.getFile(privateKeyFile, false).then(contents => {
                var json = JSON.parse(contents);
                sessionStorage.setItem(sessionStoragePrivateKey, privateKey);

                // Redirect to feed
                window.location.href = baseUrl + '/feed';
            });
        }

        else { // user has not been set up yet
            console.log('User does not have a user-server yet. Redirecting '
              + 'to initialization page...');

            // Redirect to initialization page
            window.location.href = baseUrl + '/initialization';
        }

    });
} else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn().then(userData => {
        window.location = window.location.origin;
    });
}


/******************************************************************************/

});
