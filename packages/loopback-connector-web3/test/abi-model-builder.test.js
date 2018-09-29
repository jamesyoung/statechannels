const AbiModelBuilder = require('../lib/abi-model-builder').AbiModelBuilder;
const expect = require('chai').expect;

describe('Contract model builder', () => {
  it('builds a loopback model from abi json', () => {
    const builder = new AbiModelBuilder(givenContract());
    const methods = builder.getMethods();
    expect(methods).to.eql([
      {
        name: 'deposit',
        accepts: [
          {arg: '_timeout', type: 'number', solidityType: 'uint256'},
          {arg: '_payee', type: 'string', solidityType: 'address'},
        ],
        returns: [],
      },
      {
        name: 'withdraw',
        accepts: [
          {arg: 'h', type: 'string', solidityType: 'bytes32'},
          {arg: 'v', type: 'number', solidityType: 'uint8'},
          {arg: 'r', type: 'string', solidityType: 'bytes32'},
          {arg: 's', type: 'string', solidityType: 'bytes32'},
          {arg: 'value', type: 'number', solidityType: 'uint256'},
          {arg: 'payer', type: 'string', solidityType: 'address'},
        ],
        returns: [],
      },
    ]);
  });
});

function givenContract() {
  return {
    contractName: 'Channel',
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: '',
            type: 'address',
          },
        ],
        name: 'payers',
        outputs: [
          {
            name: 'amount',
            type: 'uint256',
          },
          {
            name: 'timeout',
            type: 'uint256',
          },
          {
            name: 'complete',
            type: 'bool',
          },
          {
            name: 'payee',
            type: 'address',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            name: '_hub',
            type: 'address',
          },
          {
            name: '_percentageFee',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        constant: false,
        inputs: [
          {
            name: '_timeout',
            type: 'uint256',
          },
          {
            name: '_payee',
            type: 'address',
          },
        ],
        name: 'deposit',
        outputs: [],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
      },
      {
        constant: false,
        inputs: [
          {
            name: 'h',
            type: 'bytes32',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'payer',
            type: 'address',
          },
        ],
        name: 'withdraw',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  };
}
