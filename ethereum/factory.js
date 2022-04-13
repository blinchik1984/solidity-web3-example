import web3 from "./web3";
import CampaignFactory from './build/CampaignFactory.json';
import Constants from '../config/constants.json';

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    Constants.CONTRACT_ADDRESS
);

export default instance;