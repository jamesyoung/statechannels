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
    const connector = UserClick.dataSource.connector;
    const msg = connector.web3.utils.sha3('CLICK');
    connector.sign(msg, account, (err, sig) => {
      if (err) return cb && cb(err);
      console.log('Signature: %s', sig);
      sig = sig.substr(2); //remove 0x
      const r = '0x' + sig.slice(0, 64);
      const s = '0x' + sig.slice(64, 128);
      const v = '0x' + sig.slice(128, 130);
      UserClick.click(address, msg, v, r, s, cb);
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
