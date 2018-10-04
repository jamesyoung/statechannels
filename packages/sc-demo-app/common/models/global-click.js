'use strict';

module.exports = function(GlobalClick) {
  const CONTRACT = require('channel-contracts').contracts.Demo1;
  GlobalClick.settings.ethereum.contract = CONTRACT;
};
