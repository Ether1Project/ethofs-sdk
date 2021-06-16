// Require Modules
const ethofs = require('../../src/index');
const fs = require('fs');
const path = require('path');

// Examples of methods that do not require authentication
function unauthenticated() {

    // Get Network Stats
    ethofs.networkStats().then((stats) => {
        console.info(stats);
    }).catch((err) => {
        console.error(err);
    });

    // Get Node Locations
    ethofs.nodeLocations().then((locations) => {
        console.info(locations);
    }).catch((err) => {
        console.error(err);
    });

    // Define Options & test calculateCost
    const options = {
        ethofsOptions: {
            hostingContractDuration: 10000000,
            hostingContractSize: 90000000
        }
    };

    ethofs.calculateCost(options).then((cost) => {
        console.info(cost);
    }).catch((err) => {
        console.error(err);
    });
}

function authenticated() {

    // Call init method with our private key
    ethofs.init('38e467178ffab5672c2dcf7784bbde2205abbd73492040dc28c9648c5d426963').then((ready) => {
        console.info(ready);
    }).catch((err) => {
        console.error(err);
    });

    // Test Authentication
    ethofs.testAuthentication().then((result) => {
        console.info(result);
    }).catch((err) => {
        console.error(err);
    });

    // Add ourselves as a user, only required if we have never added a user to this privateKey.
    // To check if we need to call addUser after calling init, call testAuthentication.
    // If testAuthentication returns false or an error, you need to call addUser.
    // Disabled Since this privateKey has had a user added.
    /* ethofs.addUser('Username').then((result) => {
        console.info(result);
    }).catch((err) => {
        console.error(err);
    }); */

    // Fetch Pinlist, No Filter.
    ethofs.pinList().then((pins) => {
        console.info(pins);
    }).catch((err) => {
        console.error(err);
    });

    // Upload and pin single file to ethoFS
    const location = path.join(__dirname, 'examples/testFile.png');
    const stream = fs.createReadStream(location);
    const options = {
        ethofsData: {
            name: 'testFile.png Contract Name'
        },
        ethofsOptions: {
            hostingContractDuration: 100000
        }
    };

    ethofs.pinFileToIPFS(stream, options).then((result) => {
        console.info(result);
    }).catch((err) => {
        console.error(err);
    });
}

unauthenticated();
authenticated();
