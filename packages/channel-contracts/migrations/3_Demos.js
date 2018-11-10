/* global artifacts */

const Demo1 = artifacts.require('./Demo1.sol');
const Demo2 = artifacts.require('./Demo2.sol');
const Demo3 = artifacts.require('./Demo3.sol');
const Demo3a = artifacts.require('./Demo3a.sol');
const Demo4 = artifacts.require('./Demo4.sol');
const Demo5 = artifacts.require('./Demo5.sol');

const config = require('./config.json');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(Demo1, config.hub, config.fee);
    await deployer.deploy(Demo2, config.hub, config.fee);
    await deployer.deploy(Demo3, config.hub, config.fee);
    await deployer.deploy(Demo3a, config.hub, config.fee);
    await deployer.deploy(Demo4, config.hub, config.fee);
    await deployer.deploy(Demo5, config.hub, config.fee);
  });
};
