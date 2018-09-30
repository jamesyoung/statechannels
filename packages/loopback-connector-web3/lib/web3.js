'use strict';

const Web3 = require('web3');
const Web3DAO = require('./dao');
const {loadContract} = require('./solidity-helper');
const {
  contractConstructorFactory,
  contractFunctionFactory,
} = require('./contract-helper');
const {AbiModelBuilder} = require('./abi-model-builder');

class Web3Connector {
  constructor(settings) {
    this.contracts = {};
    this.name = settings.name || 'web3';
    this.settings = settings;

    const url = settings.url || 'http://localhost:8545';
    this.web3 = new Web3(new Web3.providers.HttpProvider(url));
    this.DataAccessObject = Web3DAO;
  }

  connect(cb) {
    this.web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return cb(err);
      }

      this.web3.eth.defaultAccount = accounts[0];
      cb();
    });
  }

  define(modelData) {
    const web3 = this.web3;
    const model = modelData.model;

    // all models must have an ID property, and we want this model to have a String ID property
    model.defineProperty('id', {type: String, id: true});

    const etherumConfig = modelData.settings.ethereum || {};

    const contractSettings = etherumConfig.contract;
    const {abi, bytecode, contractName} = contractSettings;
    if (!abi) {
      etherumConfig.compliedContract = loadContract(
        contractSettings.sol,
        contractName,
      );
      abi = etherumConfig.compliedContract.abi;
      bytecode = etherumConfig.compliedContract.bytecode;
    }
    const contractClass = web3.eth.contract(abi);
    const gas = etherumConfig.gas;

    this.abiContractBuilder = new AbiModelBuilder({
      contractName,
      abi,
      bytecode,
    });

    const ctor = this.abiContractBuilder.getConstructor();

    model.create = contractConstructorFactory(
      this.web3.eth.defaultAccount,
      this.contracts,
      contractClass,
      bytecode,
      gas,
    );

    setRemoting(
      model.create,
      Object.assign(ctor, {
        http: {verb: 'post', path: '/'},
      }),
    );

    this.defineMethods(model, abi);
  }

  defineMethods(model) {
    const methods = this.abiContractBuilder.getMethods();

    methods.map(method => {
      model.prototype[method.name] = contractFunctionFactory(
        this.web3.eth.defaultAccount,
        this.contracts,
        method.functionSpec,
      );
      model.remoteMethod(
        method.name,
        Object.assign(method, {
          http: {verb: 'post', path: '/' + method.name},
          isStatic: false,
        }),
      );
    });
  }
}

function setRemoting(fn, options) {
  options = options || {};
  for (const opt in options) {
    if (opt !== 'name' && options.hasOwnProperty(opt)) {
      fn[opt] = options[opt];
    }
  }
  fn.shared = true;
}

module.exports = Web3Connector;
