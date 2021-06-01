import ethoFS from '../../src/index';

document.addEventListener('click', (evt) => {
    switch (evt.target) {
        // Initialization
        case document.querySelector('#mmInit'):
            ethoFS.init()
                .then((initialized) => {
                    console.log(`SDK Initialized: ${initialized}`);
                })
                .catch(console.error);
            break;
        case document.querySelector('#pkInit'):
            const pk = document.querySelector('#pk').value.trim();

            if (pk !== '') {
                ethoFS.init(pk)
                .then((initialized) => {
                    console.log(`SDK Initialized: ${initialized}`);
                })
                .catch(console.error);
            } else console.error('Please enter a valid Private Key');
            break;

        // Auth and Basic
        case document.querySelector('#testAuthentication'):
            ethoFS.testAuthentication()
                .then(console.log)
                .catch(console.log);
            break;
        case document.querySelector('#getBalance'):
            ethoFS.getBalance()
                    .then(console.log)
                    .catch(console.log);
                break;
        case document.querySelector('#getWalletAddress'):
            console.log(ethoFS.getWalletAddress());
            break;

        // Pin List
        case document.querySelector('#pinList'):
            ethoFS.pinList()
                .then(console.log)
                .catch(console.log);
            break;

        // Network
        case document.querySelector('#networkStats'):
            ethoFS.networkStats()
                .then(console.log)
                .catch(console.log);
            break;
        case document.querySelector('#nodeLocations'):
            ethoFS.nodeLocations()
                .then(console.log)
                .catch(console.log);
            break;

        // User
        case document.querySelector('#accountExists'):
            ethoFS.accountExists()
                .then(console.log)
                .catch(console.log);
            break;
        case document.querySelector('#addUser'):
            const addUser = document.querySelector('#userName').value.trim();

            if (addUser !== '') {
                ethoFS.addUser(addUser)
                    .then(console.log)
                    .catch(console.log);
            } else console.error('Please enter a valid user name');
            break;
        case document.querySelector('#updateUser'):
            const updateUser = document.querySelector('#userName').value.trim();

            if (updateUser !== '') {
                ethoFS.updateUser(updateUser)
                    .then(console.log)
                    .catch(console.log);
            } else console.error('Please enter a valid user name');
            break;
        case document.querySelector('#removeUser'):
            ethoFS.removeUser()
                .then(console.log)
                .catch(console.log);
            break;

        // Pinning
        case document.querySelector('#calculateCost'):
            ethoFS.calculateCost({
                ethofsOptions: {
                    hostingContractDuration: 100000,
                    hostingContractSize: 20000000
                }
            })
                .then(console.log)
                .catch(console.log);
            break;
        case document.querySelector('#pinFileToIPFS'):
            const fileInput = document.querySelector('#file');

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const stream = file.stream();

                ethoFS.pinFileToIPFS(stream,
                    {
                        ethofsData: {
                            name: 'Test Contract',
                            keyvalues: {
                                customKey: 'customValue',
                                customKey2: 'customValue2'
                            }
                        },
                        ethofsOptions: {
                            hostingContractDuration: 100000
                        }
                    }
                )
                    .then(console.log)
                    .catch(console.log);
            } else {
                console.error('Please select a file to Pin');
            }
            break;
        case document.querySelector('#unpin'):
            let pinAddress = document.querySelector('#pinAddress').value.trim();

            pinAddress = pinAddress.replace(/"/g, '');

            if (pinAddress !== '') {
                ethoFS.unpin(pinAddress)
                    .then(console.log)
                    .catch(console.log);
            } else {
                console.error('Please enter a valid pinned file hosting address');
            }
            break;
        case document.querySelector('#extend'):
            let extendAddress = document.querySelector('#pinAddress').value.trim();

            extendAddress = extendAddress.replace(/"/g, '');

            if (extendAddress !== '') {
                ethoFS.extendPin(extendAddress, {
                    ethofsOptions: {
                        hostingContractDuration: 100000
                    }
                })
                    .then(console.log)
                    .catch(console.log);
            } else {
                console.error('Please enter a valid pinned file hosting address');
            }
            break;

        default:
            break;
    }
});
