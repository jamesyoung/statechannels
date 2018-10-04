'use strict';

const debug = require('debug')('loopback:connector:web3');
/**
 * Factory to create a contract constructor function
 * @param {*} connector
 * @param {*} contractMetadata
 * @param {string} from
 * @param {number} gas
 */
function contractConstructorFactory(connector, contractMetadata, from, gas) {
  return async function(...args) {
    const params = args.slice(0, args.length - 1);
    const cb = args[args.length - 1];
    debug('Creating contract %j', params);
    try {
      const options = {
        from: from || contractMetadata.options.from || connector.defaultAccount,
        gas: gas || contractMetadata.options.gas || connector.defaultGas,
      };
      const deployedContract = await contractMetadata
        .deploy({
          arguments: params,
        })
        .send(options);

      const resolvedOptions = deployedContract.options;
      if (resolvedOptions.address != null) {
        debug(
          'Contract mined. address: ' +
            resolvedOptions.address +
            ' transactionHash: ' +
            resolvedOptions.transactionHash,
        );
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
 * @param {*} contractMetadata
 * @param {*} functionSpec
 * @param {string} from
 * @param {number} gas
 */
function contractFunctionFactory(
  connector,
  contractMetadata,
  functionSpec,
  from,
  gas,
) {
  return function(...args) {
    const options = {
      from: from || contractMetadata.options.from || connector.defaultAccount,
      gas: gas || contractMetadata.options.gas || connector.defaultGas,
    };
    const params = args.slice(1, args.length - 1);
    const cb = args[args.length - 1];
    const address = args[0];
    debug('Invoking contract method %s: %j', functionSpec.name, params);
    const contract = new connector.web3.eth.Contract(
      contractMetadata.options.abi,
      address,
      options,
    );

    const method = contract.methods[functionSpec.name];
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
