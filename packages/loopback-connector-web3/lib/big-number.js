'use strict';

const BigNumber = require('bn.js');

try {
  BigNumber.prototype.toObject = BigNumber.prototype.toJSON;
  const typeRegistry = require('loopback-datasource-juggler').ModelBuilder;

  typeRegistry.registerType(BigNumber, ['BigNumber', 'bignumer']);
} catch (e) {
  // Ignore error
}

module.exports = BigNumber;
