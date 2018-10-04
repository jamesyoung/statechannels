'use strict';

module.exports = function(Click) {
  Click.click = (address, cb) => {
    return Click.app.models.GlobalClick.click(address, cb);
  };

  Click.remoteMethod('click', {
    isStatic: true,
    accepts: [
      {
        arg: 'address',
        description: 'Address of the deployed contract',
        type: 'string',
        http: {source: 'path'},
        required: true,
      },
    ],
    http: {
      verb: 'post',
      path: '/:address',
    },
  });

  Click.signAndClick = (address, account, cb) => {
    const UserClick = Click.app.models.UserClick;
    UserClick.dataSource.connector.sign('CLICK', account, (err, sig) => {
      if (err) return cb && cb(err);
      console.log(sig);
      sig = sig.substr(2); //remove 0x
      const r = '0x' + signature.slice(0, 64);
      const s = '0x' + signature.slice(64, 128);
      const v = '0x' + signature.slice(128, 130);
      UserClick.click(address, v, r, s, cb);
    });
  };

  Click.remoteMethod('signAndClick', {
    isStatic: true,
    accepts: [
      {
        arg: 'address',
        description: 'Address of the deployed contract',
        type: 'string',
        http: {source: 'path'},
        required: true,
      },
      {
        arg: 'account',
        description: 'Address of the deployed contract',
        type: 'string',
        http: {source: 'query'},
        required: false,
      },
    ],
    http: {
      verb: 'post',
      path: '/:address/signAndClick',
    },
  });
};
