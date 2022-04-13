const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: 3000000 })

    await factory.methods.createCampaign(
        '100',
        'Out-of-the-box QMK/VIA | Wireless & Wired | Hot-Swappable | Connect Up to 3 Devices | For Mac & Windows | Upgraded Typing Resonance',
        'Keychron K8 Pro - QMK/VIA Wireless Mechanical Keyboard'
    ).send({
        from: accounts[0],
        gas: 3000000
    });
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('allow people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: 111
        });
        const isContributer = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributer);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: 99
            });
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods.createRequest('Payment request', 100, accounts[2]).send({
            from: accounts[0],
            gas: 1000000,
        });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Payment request', request.description);
    });

    it('processes requests', async () => {
        const beforeBalance = await web3.eth.getBalance(accounts[1]);
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether'),
        });
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('1', 'ether'), accounts[1]).send({
            from: accounts[0],
            gas: 1000000,
        });
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: 1000000,
        });
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: 1000000,
        });

        const afterBalance = await web3.eth.getBalance(accounts[1]);

        assert.equal(afterBalance - beforeBalance, web3.utils.toWei('1', 'ether'));
    });

    it('try to finalize by less then 50%', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.contribute().send({
            from: accounts[2],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.contribute().send({
            from: accounts[3],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('1', 'ether'), accounts[1]).send({
            from: accounts[0],
            gas: 1000000,
        });
        await campaign.methods.approveRequest(0).send({
            from: accounts[1],
            gas: 1000000,
        });

        try {
            await campaign.methods.finalizeRequest(0).send({
                from: accounts[0],
                gas: 1000000,
            });
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it('tries to finalize by more then 50%', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.contribute().send({
            from: accounts[2],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.contribute().send({
            from: accounts[3],
            value: web3.utils.toWei('1', 'ether'),
        });
        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('1', 'ether'), accounts[5]).send({
            from: accounts[0],
            gas: 1000000,
        });
        await campaign.methods.approveRequest(0).send({
            from: accounts[1],
            gas: 1000000,
        });
        await campaign.methods.approveRequest(0).send({
            from: accounts[2],
            gas: 1000000,
        });
        const beforeBalance = await web3.eth.getBalance(accounts[5]);
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: 1000000,
        });
        const afterBalance = await web3.eth.getBalance(accounts[5]);
        assert.equal(afterBalance - beforeBalance, web3.utils.toWei('1', 'ether'));
    });
});