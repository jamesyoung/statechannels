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
    this.web3 = new Web3(url);
    this.DataAccessObject = Web3DAO;
  }

  connect(cb) {
    this.web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return cb(err);
      }

      this.defaultAccount = accounts[0];
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
    const contractClass = new web3.eth.Contract(abi);
    contractClass.options.data = bytecode;
    contractClass.options.from = this.defaultAccount;

    const gas = etherumConfig.gas;
    contractClass.options.gas = gas;

    this.abiContractBuilder = new AbiModelBuilder({
      contractName,
      abi,
      bytecode,
    });

    const ctor = this.abiContractBuilder.getConstructor();

    model.create = contractConstructorFactory(
      this,
      contractClass,
      this.defaultAccount,
      gas,
    );

    setRemoting(
      model.create,
      Object.assign(ctor, {
        http: {verb: 'post', path: '/'},
      }),
    );

    this.defineMethods(model, gas);
  }

  defineMethods(model, gas) {
    const methods = this.abiContractBuilder.getMethods();

    methods.map(method => {
      model.prototype[method.name] = contractFunctionFactory(
        this,
        method.functionSpec,
        this.defaultAccount,
        gas,
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
