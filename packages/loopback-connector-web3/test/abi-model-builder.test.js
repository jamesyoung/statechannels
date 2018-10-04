const AbiModelBuilder = require('../lib/contract-inspector').ContractInspector;
const expect = require('should/as-function');
expect.use((should, assertion) => {
  assertion.addChain('to');
});

describe('Contract model builder', () => {
  const builder = new AbiModelBuilder(givenContract());

  it('builds a loopback model from abi json', () => {
    const methods = builder.getMethods();
    expect(methods).to.containDeep([
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

  it('builds a constructor from abi json', () => {
    const ctor = builder.getConstructor();
    expect(ctor).to.containDeep({
      functionSpec: {
        inputs: [
          {name: '_hub', type: 'address'},
          {name: '_percentageFee', type: 'uint256'},
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      name: 'constructor',
      description: 'Create an instance of Channel',
      accepts: [
        {arg: '_hub', type: 'string', solidityType: 'address'},
        {arg: '_percentageFee', type: 'number', solidityType: 'uint256'},
      ],
      returns: [{arg: 'contractAddress', type: 'string'}],
    });
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
