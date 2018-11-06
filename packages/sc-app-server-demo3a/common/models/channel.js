'use strict';

const assert = require('assert')
const moment = require('moment')
const {
  sha3,
  sign,
  prefixMsg,
  getAccount,
  getWeb3,
  toWei,
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

function closeChannel(Channel, data) {
  return new Promise((resolve, reject) => {
    Channel.upsert(data, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

function getChannel(Channel, where) {
  return new Promise((resolve, reject) => {
    Channel.findOne({where}, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

function getLastImp(Channel, where) {
  return new Promise((resolve, reject) => {
    Channel.app.models.Impression.findOne({where, order: 'date DESC',}, (err, result) => {
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
        let { payee, amount, timeout, txHash } = payload
        payee = payee.toLowerCase()
        const account = await getAccount(web3)

        // TODO: add listener for when tx is complete
        setTimeout(async () => {
          try {
            // check if channel already exists
            const info = await contract.info(account, web3)
            assert.equal(info.payee.toLowerCase(), payee, 'channel is not open with this payee')

            const channel = await getChannel(Channel, {
              address: payload.contract.toLowerCase(),
              payee: payee.toLowerCase(),
              payer: account.toLowerCase(),
            })

            if (channel) {
              assert.equal(channel.closed, true, 'cannot open channel while current channel is open')
            }

            // store in db
            await createChannel(Channel, {
              id: `${account.toLowerCase()}${payee.toLowerCase()}`,
              address: payload.contract.toLowerCase(),
              payer: account.toLowerCase(),
              payee: payee.toLowerCase(),
              amount,
              timeout,
              total: 0,
              createdAt: moment().toDate(),
              closed: false,
            })

            cb(null, {
              contract: payload.contract,
              payer: account,
              payee,
              amount: toEth(amount),
              total: 0,
              txHash,
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
      try {
        const web3 = getWeb3(Channel)
        const account = await getAccount(web3)
        const { hash, sig, r, s, v, total, signer} = payload
        const totalWei = toWei(total)
        const msg = prefixMsg(hash)
        const result = await contract.close({msg, r, s, v, total: totalWei, signer}, account, web3)

        const info = await contract.info(signer, web3)

        assert.equal(result.status, true, 'did not receive successful status')

        // store in db
        await closeChannel(Channel, {
          id: `${info.payer.toLowerCase()}${info.payee.toLowerCase()}`,
          address: payload.contract.toLowerCase(),
          payer: info.payer.toLowerCase(),
          payee: info.payee.toLowerCase(),
          closedAt: moment().toDate(),
          closed: true,
          amount: info.amount.toString(),
          total,
          timeout: moment.unix(info.timeout).toDate()
        })

        cb(null, {
          txHash: result.transactionHash,
          amount: toEth(info.amount),
          total: total,
          payer: info.payer,
          payee: info.payee,
          contract: contract.address,
          timeout: info.timeout,
          closed: true
        })
      } catch (err) {
        console.error(err)
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

  // read channel status
  Channel.status = (payer, cb) => {
    ;(async () => {
      try {
        const web3 = getWeb3(Channel)
        let { amount, payee } = await contract.info(payer, web3)

        const channel = await getChannel(Channel, {
          address: contract.address.toLowerCase(),
          payee: payee.toLowerCase(),
          payer: payer.toLowerCase(),
        })

        let total = channel ? channel.total : 0
        const closed = channel ? channel.closed : true

        if (channel && !channel.closed) {
          const lastImp = await getLastImp(Channel, {
            contract: contract.address.toLowerCase(),
            payee: payee.toLowerCase(),
            account: payer.toLowerCase(),
          })

          total = toEth(lastImp ? lastImp.amount: 0)
        }

        if (parseInt(payee, 16) === 0) {
          payee = null
        }

        cb(null, {
          contract: contract.address,
          payer,
          payee,
          amount: toEth(amount.toString()),
          total: total,
          closed: closed
        })
      } catch(err) {
        console.error(err)
        cb(err.message, null)
      }
    })();
  }

  Channel.remoteMethod('status', {
    isStatic: true,
    accepts: [
      {
        arg: 'payer',
        description: 'State channel account',
        type: 'string',
        http: {source: 'query'},
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
      verb: 'get',
      path: '/status',
    },
  });

};
