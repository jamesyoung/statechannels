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
      const options = {
        from: from || contractClass.options.from || connector.defaultAccount,
        gas: gas || contractClass.options.gas || connector.defaultGas,
      };
      const contractInstance = await contractClass
        .deploy({
          arguments: params,
        })
        .send(options);

      const resolvedOptions = contractInstance.options;
      if (resolvedOptions.address != null) {
        debug(
          'Contract mined. address: ' +
            resolvedOptions.address +
            ' transactionHash: ' +
            resolvedOptions.transactionHash,
        );
        connector.contracts[resolvedOptions.address] = contractInstance;
        return resolvedOptions.address;
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
 * @param {*} contractClass
 * @param {*} functionSpec
 * @param {string} from
 * @param {number} gas
 */
function contractFunctionFactory(
  connector,
  contractClass,
  functionSpec,
  from,
  gas,
) {
  return function(...args) {
    const options = {
      from: from || contractClass.options.from || connector.defaultAccount,
      gas: gas || contractClass.options.gas || connector.defaultGas,
    };
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    const address = this.id.toString(16);
    debug('Invoking contract method %s: %j', functionSpec.name, params);
    let contractInstance = connector.contracts[address];
    if (contractInstance == null) {
      contractInstance = new connector.web3.eth.Contract(
        contractClass.options.abi,
        address,
        options,
      );
    }
    const method = contractInstance.methods[functionSpec.name];
    if (functionSpec.constant) {
      const invokeArgs = [
        options,
        (err, result) => {
          if (err) debug(err);
          else debug('Result: %s', result);
          cb && cb(err, {data: result});
        },
      ];
      method(...params).call(...invokeArgs);
    } else {
      const invokeArgs = [
        options,
        (err, transactionHash) => {
          if (err) debug(err);
          else debug('Transaction hash: %s', transactionHash);
          cb && cb(err, {account: options.from, transactionHash});
        },
      ];
      method(...params).send(...invokeArgs);
    }
  };
}

module.exports = {
  contractConstructorFactory,
  contractFunctionFactory,
};
