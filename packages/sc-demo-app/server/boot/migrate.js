'use strict';

module.exports = function(app, cb) {
  const ds = app.dataSources.web3;
  ds.on('connected', () => ds.automigrate(cb));
  
};
