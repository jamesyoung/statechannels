'use strict';

const assert = require('assert')
const moment = require('moment')
const {
  prefixMsg,
  getAccount,
  getWeb3,
  toEth,
} = require('../../lib/helpers')
const contract = require('../../lib/contract')

function createChannel(Channel, data) {
  return new Promise((resolve, reject) => {
    Channel.upsert(data, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

function getUser(Channel, where) {
  return new Promise((resolve, reject) => {
    Channel.app.models.User.findOne({where}, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

module.exports = function(Channel) {
  Channel.openChannel = (payload, cb) => {
    ;(async () => {
      try {
        const web3 = getWeb3(Channel)

        const result = await web3.eth.sendSignedTransaction(payload.signedTransaction)
        assert.equal(result.status, true)
        const txHash = result.transactionHash

        const tx = await web3.eth.getTransaction(txHash)

        const value = tx.value
        const account = tx.from.toLowerCase()

        const user = await getUser(Channel, {publicAddress: account})

        assert.ok(user, `user with address ${account} does not exist`)

        // TODO: add listener for when tx is complete
        setTimeout(async () => {
          try {
            const staked = toEth(value)

            // store in db
            await createChannel(Channel, {
              contractAddress: tx.to.toLowerCase(),
              account,
              amount: value,
              createdAt: moment().toDate(),
              staked,
              closed: false,
            })

            cb(null, {
              txHash: txHash,
              staked,
              closed: false
            })
          } catch(err) {
            cb(err.message, null)
          }
        }, 1e3)
      } catch(err) {
        cb(err.message, null)
      }
    })();
  }

  Channel.remoteMethod('openChannel', {
    isStatic: true,
    accepts: [
      {
        arg: 'data',
        description: 'JSON payload',
        type: 'object',
        http: {source: 'body'},
        required: true,
      },
    ],
    returns: [
      {
        arg: 'data',
        type: 'object',
        root: true,
      },
    ],
    http: {
      verb: 'post',
      path: '/open',
    },
  });

  // close state channel
  Channel.closeChannel = (payload, cb) => {
    ;(async () => {
        const web3 = getWeb3(Channel)
        const { r, s, v, sig, hash, to:receiver, from:payer, value:total } = payload.state
        const signer = await getAccount(web3, 0)
        const msg = prefixMsg(hash)

        // TODO: hub close channel with alice (via webhook endpoint)

        const result = await contract.close({msg, r, s, v, total, payer, receiver}, signer, web3)

        assert.equal(result.status, true, 'did not receive successful status')

      try {
        cb(null, {
          closed: true,
          txHash: result.transactionHash
        })
      } catch(err) {
        cb(err.message, null)
      }
    })();
  }

  Channel.remoteMethod('closeChannel', {
    isStatic: true,
    accepts: [
      {
        arg: 'data',
        description: 'JSON payload',
        type: 'object',
        http: {source: 'body'},
        required: true,
      },
    ],
    returns: [
      {
        arg: 'data',
        type: 'object',
        root: true,
      },
    ],
    http: {
      verb: 'post',
      path: '/close',
    },
  });
};
