'use strict';

class AbiModelBuilder {
  constructor(contractSpec) {
    this.contractSpec = contractSpec;
  }

  toModel() {
  }

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
          type: arg.type
        })),
        returns: f.outputs.map(arg => ({
          arg: arg.name,
          type: arg.type
        }))
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