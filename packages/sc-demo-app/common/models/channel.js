'use strict';

const CHANNEL_CONTRACT = require('channel-contracts').contracts.Channel;
module.exports = function(Channel) {
  Channel.settings.ethereum.contract = CHANNEL_CONTRACT;
};
