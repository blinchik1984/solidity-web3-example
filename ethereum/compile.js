const path = require('path');
const solc = require('solc');
const fsExtra = require('fs-extra');
const fs = require('fs');

const buildPath = path.resolve(__dirname, 'build');
fsExtra.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');
const input = {
    language: 'Solidity',
    sources: {
        'Campaign.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Campaign.sol'];
fsExtra.ensureDirSync(buildPath);

for (let contract in output) {
    fsExtra.outputJsonSync(
        path.resolve(buildPath, contract + '.json'),
        output[contract]
    );
}

