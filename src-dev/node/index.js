const inquirer = require('inquirer');
const chalk = require('chalk');

const ethoFS = require('../../src/index');

const methods = Object.keys(ethoFS);

console.log(chalk.white.bgGray('Welcome to the SDK NodeJS development CLI.'));
console.log(chalk.green('Please select a function and then pass parameters with "--". For sequence of parameters in each function, please see "READMe.md".'));
console.log(chalk.white.bgRed('To quit the CLI, press CTRL + C twice.'));

const prompt = function () {
    console.log('\n');

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'sdk',
                message: 'What do you want to do?',
                choices: methods
            }
        ])
        .then(({ sdk }) => {
            const func = ethoFS[sdk];

            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'params',
                        message: '[Optional] Please pass parameters to this function. Eg to call init(privateKey), pass "--000000000000000000000000000000000000000000000000000000000000000" as answer'
                    }
                ])
                .then(async ({ params }) => {
                    const paramsArray = params.split('--').map((i) => i.trim());

                    paramsArray.splice(0, 1);

                    console.log('');
                    console.log(chalk.gray('Parameters passed: '));
                    console.log(paramsArray);
                    console.log('');
                    console.log(chalk.green('Waiting for Result...'));
                    console.log('');
                    console.log(await func.apply(null, paramsArray));
                    prompt();
                })
                .catch((error) => {
                    if (error.isTtyError) {
                        console.log(chalk.red('\nError: Your command line does not support this CLI. Please upgrade to a more newer version.'));
                    } else {
                        console.log(chalk.red(error));
                        prompt();
                    }
                });
        })
        .catch((error) => {
            if (error.isTtyError) {
                console.log(chalk.red('\nError: Your command line does not support this CLI. Please upgrade to a more newer version.'));
            } else {
                console.log(chalk.red(`\nError: ${error}.`));
                prompt();
            }
        });
};

prompt();

// const fs = require('fs');
// const path = require('path');
// const ethoFS = require('../../lib/ethofs-sdk');

// const SDK = ethoFS(''); // Add PrivateKey

// console.log(SDK);

// const func = async () => {
//     const readableStreamForFile = await fs.createReadStream(path.resolve(__dirname, '../copy.png'));
//     const options = {
//         ethofsData: {
//             name: 'MyCustomUploadName',
//             keyvalues: {
//                 customKey: 'customValue',
//                 customKey2: 'customValue2'
//             }
//         },
//         ethofsOptions: {
//             hostingContractDuration: 100000
//         }
//     };

//     console.log('Getting Pin List');
//     console.log(await JSON.stringify(SDK.pinList()));
//     console.log(await SDK.pinFileToIPFS(readableStreamForFile, options));
// };

// func();
