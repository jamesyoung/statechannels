'use strict';

const debug = require('debug')('loopback:connector:web3');
const Web3 = require('web3');
const Web3DAO = require('./dao');
const {loadContract} = require('./solidity-helper');

const contracts = {};

class Web3Connector {
  constructor(settings) {
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
    const {abi, bytecode} = contractSettings;
    if (!abi) {
      etherumConfig.compliedContract = loadContract(
        contractSettings.sol,
        contractSettings.name,
      );
      abi = etherumConfig.compliedContract.abi;
      bytecode = etherumConfig.compliedContract.bytecode;
    }
    const Contract = web3.eth.contract(abi);
    const gas = etherumConfig.gas;

    if (contractSettings.params !== undefined) {
      contractSettings.params.map(param => {
        switch (param.type) {
          case 'string':
            model.defineProperty('params', {type: String, id: false});
            break;
          case 'integer':
            model.defineProperty('params', {type: Number, id: false});
            break;
          case 'boolean':
            model.defineProperty('params', {type: Boolean, id: false});
            break;
        }
      });
    }

    model.construct = function(data, cb) {
      const params = data['params'] || null;
      Contract.new(
        params,
        {
          from: web3.eth.defaultAccount,
          data: bytecode.toString(),
          gas: gas,
        },
        function(e, contractInstance) {
          if (e !== null) {
            cb && cb(null, {error: e.toString()});
          } else {
            if (contractInstance.address === undefined) {
              debug(
                'Contract mined! address: ' +
                  contractInstance.address +
                  ' transactionHash: ' +
                  contractInstance.transactionHash,
              );
              contracts[contractInstance.address] = contractInstance;
              cb && cb(null, {id: contractInstance.address});
            }
          }
        },
      );
    };

    this.defineMethods(model, abi);

    setRemoting(model.construct, {
      description: 'Create a new contract instance',
      accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
      returns: {arg: 'results', type: 'object', root: true},
      http: {verb: 'post', path: '/'},
    });
  }

  defineMethods(model, abi) {
    const web3 = this.web3;

    abi.map(function(obj) {
      if (obj.constant === false && obj.type === 'function') {
        model.prototype[obj.name] = function(data, cb) {
          const address = this.id.toString(16);
          const params = obj.inputs.map(function(input) {
            return data[input.name];
          });
          const contractInstance = contracts[address];
          const method = contractInstance[obj.name];
          const args = [
            ...params,
            function(err, result) {
              cb &&
                cb(null, {account: web3.eth.defaultAccount, txhash: result});
            },
          ];
          const result = method.apply(contractInstance, args);
        };
        model.remoteMethod(obj.name, {
          description: 'Call the ' + obj.name + ' contract method',
          accepts: {arg: 'data', type: Number, http: {source: 'body'}},
          returns: {args: 'results', type: 'object', root: true},
          http: {verb: 'post', path: '/' + obj.name},
          isStatic: false,
        });
      }
    });
  }
}

function setRemoting(fn, options) {
  options = options || {};
  for (const opt in options) {
    if (options.hasOwnProperty(opt)) {
      fn[opt] = options[opt];
    }
  }
  fn.shared = true;
}

module.exports = Web3Connector;
