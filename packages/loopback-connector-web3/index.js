'use strict';

var Web3Connector = require('./lib/web3');

exports.initialize = function(dataSource, cb) {
  var settings = dataSource.settings;
  var connector = new Web3Connector(settings);
  connector.dataSource = dataSource;
  dataSource.connector = connector;
  if (cb) {
    if (dataSource.settings.lazyConnect) {
      process.nextTick(function() {
        cb();
      });
    } else {
      dataSource.connector.connect(cb);
    }
  }
};
