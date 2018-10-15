'use strict';

const Web3Connector = require('./lib/web3');

exports.initialize = function(dataSource, cb) {
  const connector = new Web3Connector(dataSource);
  connector.dataSource = dataSource;
  dataSource.connector = connector;
  if (cb) {
    if (dataSource.settings.lazyConnect) {
      process.nextTick(function() {
        cb();
      });
    } else {
      connector.connect(cb);
    }
  }
};
