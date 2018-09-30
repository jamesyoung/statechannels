'use strict';

const debug = require('debug')('loopback:connector:web3');
/**
 * Factory to create a contract constructor function
 * @param {*} contracts
 * @param {*} contractClass
 * @param {*} bytecode
 * @param {*} gas
 */
function contractConstructorFactory(
  account,
  contracts,
  contractClass,
  bytecode,
  gas,
) {
  return function(...args) {
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    debug('Creating contract %j', params);
    contractClass.new(
      params,
      {
        from: account,
        data: bytecode.toString(),
        gas: gas,
      },
      function(e, contractInstance) {
        if (e !== null) {
          debug('Failed to create contract', e);
          cb && cb(e);
        } else {
          if (contractInstance.address != null) {
            debug(
              'Contract mined. address: ' +
                contractInstance.address +
                ' transactionHash: ' +
                contractInstance.transactionHash,
            );
            contracts[contractInstance.address] = contractInstance;
            cb && cb(null, contractInstance.address);
          }
        }
      },
    );
  };
}

/**
 * Factory to create a contract function
 * @param {*} contracts
 * @param {*} functionSpec
 */
function contractFunctionFactory(account, contracts, functionSpec) {
  return function(...args) {
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    const address = this.id.toString(16);
    debug('Invoking contract method %s: %j', functionSpec.name, params);
    const contractInstance = contracts[address];
    if (contractInstance == null) {
      const err = Error(`Address ${address} not found`);
      err.statusCode = 404;
      throw err;
    }
    const method = contractInstance[functionSpec.name];
    const fnArgs = [
      ...params,
      function(err, result) {
        debug('Result: %s', result);
        cb && cb(null, {account: account, txhash: result});
      },
    ];
    method.apply(contractInstance, fnArgs);
  };
}

module.exports = {
  contractConstructorFactory,
  contractFunctionFactory,
};
