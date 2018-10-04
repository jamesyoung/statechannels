'use strict';

function Web3DAO() {}

Web3DAO.findById = function(id, filter, options, cb) {
  var Model = this;
  cb(null, new Model({address: id}));
};

module.exports = Web3DAO;
