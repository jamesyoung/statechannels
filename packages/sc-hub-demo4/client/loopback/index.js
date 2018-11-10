const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();

boot(app, __dirname, function(error) {
  if (error) {
    console.log(error);
  }
});

module.exports = app;
