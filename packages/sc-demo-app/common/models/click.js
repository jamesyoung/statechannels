'use strict';

module.exports = function(Click) {
  Click.click = (address, cb) => {
    new Click.app.models.GlobalClick({address}).click(cb);
  };

  Click.remoteMethod('click', {
    isStatic: true,
    accepts: [
      {
        arg: 'address',
        description: 'Address of the deployed contract',
        type: 'string',
        http: {source: 'query'},
        required: true,
      },
    ],
    http: {
      verb: 'post',
      path: '/',
    },
  });
};
