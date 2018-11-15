'use strict';

const assert = require('assert')
const moment = require('moment')
const _ = require('lodash')
const request = require('request-promise')
const {
  sha3,
  sign,
  getAccount,
  getWeb3,
  toWei,
  toEth,
  toBig,
  fromEth
} = require('../../lib/helpers')
const contract = require('../../lib/contract')

module.exports = function(Message) {
  Message.message = (payload, cb) => {
    ;(async () => {
      try {
        const web3 = getWeb3(Message)
        const hub = await getAccount(web3, 0)

        const payer = payload.payer.toLowerCase()
        const payee = payload.from.toLowerCase()

        const fromUser = await getUser(Message, {publicAddress: payee})

        assert.ok(fromUser, `user with public address ${payee} is not registered`)

        const payerUser = await getUser(Message, {publicAddress: payer})

        assert.ok(payerUser, `user with public address ${payer} is not registered`)

        let totalStaked = toBig((await contract.getBalance(hub, payee, web3)).toString(10))

        assert.ok(totalStaked.toString() != '0', `user ${payer} doesn't have a channel open`)

        const last = await getLastMessage(Message, {
          from: payer,
          to: payee,
        })

        let total = last ? toBig(last.value) : toBig(0)

        let used = await getUsedAmount(Message, {
          from: payer
        })


        const pay = toBig(fromEth(0.1).toString(10))

        // clamp total so it doesn't go over the locked eth amount
        if (used.add(pay).cmp(totalStaked) <= 0) {
          total = total.add(pay)
        }

        const url = 'http://localhost:9999/webhook'

        const appResp = await request.post(url, {
          body: {
            action: 'sign',
            data: {
              value: total.toString(),
              payee,
              contractAddress: contract.address,
            }
          },
          json: true
        })

        const { state } = appResp

        // store in db
        await createMessage(Message, {
          from: payer,
          to: payee,
          value: total.toString(),
          createdAt: moment().toDate(),
          state
        })

        cb(null, {
          state
        })

      } catch(err) {
        cb(err.message, null)
      }
    })();
  }

  Message.remoteMethod('message', {
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
      path: '/message',
    },
  });
};

function getUser(Message, where) {
  return new Promise((resolve, reject) => {
    Message.app.models.User.findOne({where}, (err, result) => err ? reject(err) : resolve(result))
  })
}

function createMessage(Message, data) {
  return new Promise((resolve, reject) => {
    Message.create(data, (err, result) => err ? reject(err) : resolve(result))
  })
}

function getLastMessage(Message, where) {
  return new Promise((resolve, reject) => {
    Message.findOne({where, order: 'createdAt DESC'}, (err, result) => err ? reject(err) : resolve(result))
  })
}

function getUsedAmount(Impression, where) {
  return new Promise((resolve, reject) => {
    Impression.find({where}, (err, result) => {
      if (err) {
        return reject(err)
      }

      const total = Object.values(
        _.groupBy(result||[], x => x.to))
      .reduce((acc, group) => {
        return acc.add(
          _.orderBy(group, ['createdAt'], ['desc']).slice(0,1)
            .reduce((acc, x) => {
              return acc.add(toBig(x.value))
          }, toBig(0))
        )
      }, toBig(0))

      resolve(total)
    })
  })
}
