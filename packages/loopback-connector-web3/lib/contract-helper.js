'use strict';

const debug = require('debug')('loopback:connector:web3');
/**
 * Factory to create a contract constructor function
 * @param {*} connector
 * @param {*} contractClass
 * @param {string} from
 * @param {number} gas
 */
function contractConstructorFactory(connector, contractClass, from, gas) {
  return async function(...args) {
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    debug('Creating contract %j', params);
    try {
      const contractInstance = await contractClass
        .deploy({
          arguments: params,
        })
        .send({
          from: from || connector.defaultAccount,
          gas: gas || connector.defaultGas,
        });

      const opts = contractInstance.options;
      if (opts.address != null) {
        debug(
          'Contract mined. address: ' +
            opts.address +
            ' transactionHash: ' +
            opts.transactionHash,
        );
        connector.contracts[opts.address] = contractInstance;
        return opts.address;
      }
    } catch (e) {
      debug('Failed to create contract', e);
      throw e;
    }
  };
}

/**
 * Factory to create a contract function
 * @param {*} connector
 * @param {*} functionSpec
 * @param {string} from
 * @param {number} gas
 */
function contractFunctionFactory(connector, functionSpec, from, gas) {
  return function(...args) {
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    const address = this.id.toString(16);
    debug('Invoking contract method %s: %j', functionSpec.name, params);
    const contractInstance = connector.contracts[address];
    if (contractInstance == null) {
      const err = Error(`Address ${address} not found`);
      err.statusCode = 404;
      throw err;
    }
    const method = contractInstance.methods[functionSpec.name];
    const invokeArgs = [
      {
        from: from || connector.defaultAccount,
        gas: gas || connector.defaultGas,
      },
      (err, transactionHash) => {
        if (err) debug(err);
        else debug('Result: %s', transactionHash);
        cb && cb(err, {account: account, transactionHash});
      },
    ];
    if (functionSpec.constant) {
      method(...params).call(...invokeArgs);
    } else {
      method(...params).send(...invokeArgs);
    }
  };
}

module.exports = {
  contractConstructorFactory,
  contractFunctionFactory,
};
