'use strict';

module.exports = function(Channel) {
  Channel.settings.ethereum.contract = require('channel-contracts').contracts.Channel;
};
