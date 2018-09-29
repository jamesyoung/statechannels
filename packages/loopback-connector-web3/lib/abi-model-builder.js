'use strict';

const coder = require('web3/lib/solidity/coder');

/**
 * Load web3 types
 */
function getWeb3Types() {
  const web3TypeNames = [
    'address',
    'bool',
    'bytes',
    'dynamicbytes',
    'int',
    'real',
    'string',
    'uint',
    'ureal',
  ];

  const web3Types = {};
  web3TypeNames.forEach(t => {
    const typeClass = require(`web3/lib/solidity/${t}`);
    web3Types[t] = new typeClass();
  });
  return web3Types;
}

/**
 * Web3 to JSON type mapping
 */
function getTypeMapping() {
  const mapping = {
    address: 'string',
    bool: 'boolean',
    bytes: 'string',
    dynamicbytes: 'string',

    int: 'number',

    real: 'number',

    string: 'string',

    uint: 'number',

    ureal: 'number',
  };

  function registerTypes(base, type) {
    for (let i = 8; i <= 256; i += 8) {
      mapping[`${base}${i}`] = type;
    }
  }

  registerTypes('int', 'number');
  registerTypes('uint', 'number');
  registerTypes('real', 'number');
  registerTypes('ureal', 'number');

  return mapping;
}

const WEB3_TYPES = getWeb3Types();
const TYPE_MAPPING = getTypeMapping();

/**
 * Map a solidity type to JSON type
 * @param {*} solidityType 
 */
function getType(solidityType) {
  const [name, type] = Object.entries(WEB3_TYPES).find(
    ([name, type]) => type.isType(solidityType),
  );
  return TYPE_MAPPING[name || solidityType] || solidityType;
}

/**
 * Model builder from JSON ABI
 */
class AbiModelBuilder {
  constructor(contractSpec) {
    this.contractSpec = contractSpec;
  }

  toModel() {}

  getMethods() {
    const functions = this.contractSpec.abi.filter(f => {
      if (f.type !== 'function' && f.type != null) return false;
      // mapping
      if (f.inputs && f.inputs[0] && f.inputs[0].name === '') return false;
      return true;
    });
    return functions.map(f => {
      return {
        name: f.name,
        accepts: f.inputs.map(arg => ({
          arg: arg.name,
          type: getType(arg.type),
          solidityType: arg.type,
        })),
        returns: f.outputs.map(arg => ({
          arg: arg.name,
          type: getType(arg.type),
          solidityType: arg.type,
        })),
      };
    });
  }

  /**
   * Get the constructor
   *
   * @param {object} contractSpec
   */
  getConstructor() {
    return this.contractSpec.abi.find(f => f.type === 'constructor');
  }
}

exports.AbiModelBuilder = AbiModelBuilder;

/*
{
  "contractName": "Channel",
  "abi": [
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "name": "payers",
      "outputs": [
        {
          "name": "amount",
          "type": "uint256"
        },
        {
          "name": "timeout",
          "type": "uint256"
        },
        {
          "name": "complete",
          "type": "bool"
        },
        {
          "name": "payee",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "_hub",
          "type": "address"
        },
        {
          "name": "_percentageFee",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_timeout",
          "type": "uint256"
        },
        {
          "name": "_payee",
          "type": "address"
        }
      ],
      "name": "deposit",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "h",
          "type": "bytes32"
        },
        {
          "name": "v",
          "type": "uint8"
        },
        {
          "name": "r",
          "type": "bytes32"
        },
        {
          "name": "s",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "uint256"
        },
        {
          "name": "payer",
          "type": "address"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
}
*/
