/* global artifacts */

const Channel = artifacts.require('./Channel.sol');
const config = require('./config.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(Channel, config.hub, config.fee);
  });
};
