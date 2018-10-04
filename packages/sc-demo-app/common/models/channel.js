'use strict';

module.exports = function(Channel) {
  const CONTRACT = require('channel-contracts').contracts.Channel;
  Channel.settings.ethereum.contract = CONTRACT;
};
