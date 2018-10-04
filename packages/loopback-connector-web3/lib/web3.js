'use strict';

const Web3 = require('web3');
const Web3DAO = require('./dao');
const {loadContract} = require('./solidity-helper');
const {
  contractConstructorFactory,
  contractFunctionFactory,
} = require('./contract-function-factory');
const {ContractInspector} = require('./contract-inspector');

class Web3Connector {
  constructor(settings) {
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
    const modelClass = modelData.model;

    /**
     * Add contract address as the ID
     */
    modelClass.defineProperty('address', {type: String, id: true});

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
    const contractMetadata = new web3.eth.Contract(abi);
    contractMetadata.options.abi = abi;
    contractMetadata.options.jsonInterface = abi;
    contractMetadata.options.data = bytecode;
    contractMetadata.options.from = this.defaultAccount;

    const gas = etherumConfig.gas;
    contractMetadata.options.gas = gas;

    this.contractInspector = new ContractInspector({
      contractName,
      abi,
      bytecode,
    });

    const ctor = this.contractInspector.getConstructor();

    if (ctor != null) {
      modelClass.create = contractConstructorFactory(
        this,
        contractMetadata,
        this.defaultAccount,
        gas,
      );

      setRemoting(
        modelClass.create,
        Object.assign(ctor, {
          http: {verb: 'post', path: '/'},
        }),
      );
    }

    this.defineMethods(contractMetadata, modelClass, gas);
  }

  defineMethods(contractMetadata, model, gas) {
    const methods = this.contractInspector.getMethods();

    methods.map(method => {
      model.prototype[method.name] = contractFunctionFactory(
        this,
        contractMetadata,
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
