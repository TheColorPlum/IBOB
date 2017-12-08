/* server.js
 * Author: Michael Friedman
 *
 * Dummy Blockstack Core server.
 */

const express = require('express');
const app = express();
const port = 6000;

const alice = {
    id: "alice.id",
    profile: {
        address: "13o4bCPvsNTueMnGR4acqr29C4utYtr1ig",
        blockchain: "bitcoin",
        expire_block: 598717,
        last_txid: "40c1c0e1b5d0168ef0977784ef3d1fa037ca297a53b437e68ea842be7c990236",
        status: "registered",
        zonefile: "$ORIGIN alice.id\n$TTL 3600\n_http._tcp URI 10 1 \"http://localhost:" + port + "/zonefile/alice.id\"\n",
        zonefile_hash: "9659d60d5d5cb0a94bbf669561c3c4d96adc4361"
    },
    zonefile: [{
        decodedToken: {
            payload: {
                subject: {
                    publicKey: "029685310123113b1394c4fc72d6a704e66eb9e6b8afa4e22bc3c02758fc657542"
                }
            }
        }
    }]
};

const bob = {
    id: "bob.id",
    profile: {
        address: "13o4bCPvsNTueMnGR4acqr29C4utYtr1ig",
        blockchain: "bitcoin",
        expire_block: 598717,
        last_txid: "40c1c0e1b5d0168ef0977784ef3d1fa037ca297a53b437e68ea842be7c990236",
        status: "registered",
        zonefile: "$ORIGIN bob.id\n$TTL 3600\n_http._tcp URI 10 1 \"http://localhost:" + port + "/zonefile/bob.id\"\n",
        zonefile_hash: "9659d60d5d5cb0a94bbf669561c3c4d96adc4361"
    },
    zonefile: [{
        decodedToken: {
            payload: {
                subject: {
                    publicKey: "03af4bf1e595a8156b96762f4a739292d10d153f41bbf2701045ef24b2d396f27e"
                }
            }
        }
    }]
};

const mallory = {
    id: "mallory.id",
    profile: {
        address: "13o4bCPvsNTueMnGR4acqr29C4utYtr1ig",
        blockchain: "bitcoin",
        expire_block: 598717,
        last_txid: "40c1c0e1b5d0168ef0977784ef3d1fa037ca297a53b437e68ea842be7c990236",
        status: "registered",
        zonefile: "$ORIGIN mallory.id\n$TTL 3600\n_http._tcp URI 10 1 \"http://localhost:" + port + "/zonefile/mallory.id\"\n",
        zonefile_hash: "9659d60d5d5cb0a94bbf669561c3c4d96adc4361"
    },
    zonefile: [{
        decodedToken: {
            payload: {
                subject: {
                    publicKey: "0343e0a3b2df8c67f5e9ee15fc6f627918dcf1616ed7828dce8416d24404d9694f"
                }
            }
        }
    }]
};

//------------------------------------------------------------------------------

// GET /v1/names/<blockstack-id>
app.get('/v1/names/:id', function(req, res) {
    var id = req.params.id;
    if (id === alice.id) {
        res.send(JSON.stringify(alice.profile));
    } else if (id === bob.id) {
        res.send(JSON.stringify(bob.profile));
    } else if (id === mallory.id) {
        res.send(JSON.stringify(mallory.profile));
    } else {
        res.send("Error: invalid name");
    }
});


// GET /zonefile/<blockstack-id>
app.get('/zonefile/:id', function(req, res) {
    var id = req.params.id;
    if (id === alice.id) {
        res.send(JSON.stringify(alice.zonefile));
    } else if (id === bob.id) {
        res.send(JSON.stringify(bob.zonefile));
    } else if (id === mallory.id) {
        res.send(JSON.stringify(mallory.zonefile));
    } else {
        res.send("Error: invalid name");
    }
});


//------------------------------------------------------------------------

app.listen(port, function() {
    console.log("Server is running on port " + port);
})
