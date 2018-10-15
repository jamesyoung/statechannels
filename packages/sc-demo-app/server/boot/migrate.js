'use strict';

module.exports = function(app, cb) {
  process.nextTick(cb);
  // To be implemented
  /*
  const ds = app.dataSources.web3;
  ds.on('connected', () => ds.automigrate(cb));
  */
};
