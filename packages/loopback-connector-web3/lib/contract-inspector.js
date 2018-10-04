'use strict';

require('./big-number');

/**
 * Web3 to JSON type mapping
 */
function getTypeMapping() {
  const mapping = {
    address: 'string',
    bool: 'boolean',
    bytes: 'string',
    dynamicbytes: 'string',
    string: 'string',

    int: 'number',
    real: 'number',
    uint: 'number',
    ureal: 'number',
  };

  function registerTypes(base, type) {
    for (let i = 8; i <= 256; i += 8) {
      /** TODO: mapping to string/bignumber */
      /*
      if (type === 'number' && i >= 53) {
        type = 'string';
      }
      */
      mapping[`${base}${i}`] = type;
    }
  }

  registerTypes('bytes', 'string');
  registerTypes('int', 'number');
  registerTypes('uint', 'number');
  registerTypes('real', 'number');
  registerTypes('ureal', 'number');

  return mapping;
}

const TYPE_MAPPING = getTypeMapping();

/**
 * Map a solidity type to JSON type
 * @param {*} solidityType
 */
function getType(solidityType) {
  return TYPE_MAPPING[solidityType] || solidityType;
}

/**
 * Contract inspector from JSON ABI
 */
class ContractInspector {
  constructor(contractSpec) {
    this.contractSpec = contractSpec;
  }

  getMethods() {
    const functions = this.contractSpec.abi.filter(f => {
      if (f.type !== 'function' && f.type != null) return false;
      // mapping
      if (f.inputs && f.inputs[0] && f.inputs[0].name === '') return false;
      return true;
    });
    return functions.map(f => this.getMethod(f));
  }

  getMethod(functionSpec, description) {
    const inputs = functionSpec.inputs || [];
    const outputs = functionSpec.outputs || [];
    return {
      functionSpec,
      name: functionSpec.name || 'constructor',
      description:
        description ||
        `Invoke ${this.contractSpec.contractName}.${functionSpec.name}`,
      accepts: inputs.map(arg => ({
        arg: arg.name,
        type: getType(arg.type),
        solidityType: arg.type,
        http: {source: 'form'},
      })),
      returns: outputs.map(arg => ({
        arg: arg.name || 'data',
        type: getType(arg.type),
        solidityType: arg.type,
        root: true,
      })),
    };
  }

  /**
   * Get the constructor
   */
  getConstructor() {
    const ctor = this.contractSpec.abi.find(f => f.type === 'constructor');
    if (ctor) {
      const create = this.getMethod(
        ctor,
        `Create an instance of ${this.contractSpec.contractName}`,
      );
      create.returns = [{arg: 'contractAddress', type: 'string', root: true}];
      return create;
    } else return undefined;
  }
}

exports.ContractInspector = ContractInspector;
