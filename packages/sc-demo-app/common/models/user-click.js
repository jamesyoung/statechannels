'use strict';

module.exports = function(UserClick) {
  const CONTRACT = require('channel-contracts').contracts.Demo2;
  UserClick.settings.ethereum.contract = CONTRACT;
};
