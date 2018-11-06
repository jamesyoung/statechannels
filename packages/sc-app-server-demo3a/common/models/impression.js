'use strict';

const assert = require('assert')
const moment = require('moment')
const BN = require('bn.js')
const { sha3, sign, toEth } = require('../../lib/helpers')
const contract = require('../../lib/contract')
const { getWeb3, getAccount } = require('../../lib/helpers')

const big = (n) => new BN(n.toString(10))

function createImp(Impression, data) {
  return new Promise((resolve, reject) => {
    Impression.create(data, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

function getLast(Impression, where) {
  return new Promise((resolve, reject) => {
    Impression.findOne({where, order: 'date DESC',}, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}


function getChannel(Impression, where) {
  return new Promise((resolve, reject) => {
    Impression.app.models.channel.findOne({where}, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

module.exports = function(Impression) {
  // record impression and sign payment channel message
  Impression.recordImpression = (address, cb) => {
    ;(async () => {
      try {
        const web3 = getWeb3(Impression)
        address = address.toLowerCase()
        const signer = await getAccount(web3)

        // retrieve locked eth amount in payment channel
        const { amount, payee } = await contract.info(signer, web3)

        assert.ok(parseInt(amount, 10) > 0, 'channel is not open')

        const channel = await getChannel(Impression, {
          address: contract.address.toLowerCase(),
          payee: payee.toLowerCase(),
          payer: signer.toLowerCase(),
        })

        assert.ok(channel, 'channel is not open')
        assert.ok(!channel.closed, 'channel is not open')

        const last = await getLast(Impression, {
          contract: contract.address.toLowerCase(),
          payee: payee.toLowerCase(),
          account: signer.toLowerCase(),
        })

        let total = last ? last.amount : 0
        total = big(total)

        // clamp total so it doesn't go over the locked eth amount
        const pay = big(1).mul(big(10).pow(big(17))) // 0.1 eth
        if (total.add(pay).cmp(amount) <= 0) {
          total = total.add(pay)
        }

        total = total.toString()

        const hash = sha3(
          {type: 'address', value: address},
          {type: 'uint256', value: total}
        )

        const {r, s, v, sig, msg} = await sign(hash, signer, web3)
        const resp = { contract: contract.address, sig, r, s, v, signer, hash, total }

        // store in db
        await createImp(Impression, {
          contract: resp.contract.toLowerCase(),
          account: resp.signer.toLowerCase(),
          payee: payee.toLowerCase(),
          sig: resp.sig,
          amount: total,
          date: moment().toDate(),
        })

        cb(null, {
          ...resp,
          total: toEth(resp.total)
        })
      } catch (err) {
        cb(err.message, null)
      }
    })();
  };

  Impression.remoteMethod('recordImpression', {
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
    returns: [
      {
        arg: 'data',
        type: 'object',
        root: true,
      },
    ],
    http: {
      verb: 'get',
      path: '/record',
    },
  });
};
