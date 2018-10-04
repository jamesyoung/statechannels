'use strict';

module.exports = function(Payment) {
  const CONTRACT = require('channel-contracts').contracts.Demo3;
  Payment.settings.ethereum.contract = CONTRACT;
};
