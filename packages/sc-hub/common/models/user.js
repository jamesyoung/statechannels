'use strict';

const moment = require('moment')
const assert = require('assert')

const {
  prefixMsg,
  getAccount,
  getWeb3,
  toWei,
  toEth,
  fromEth,
} = require('../../lib/helpers')
const contract = require('../../lib/contract')

function getChannel(User, where) {
  return new Promise((resolve, reject) => {
    User.app.models.Channel.findOne({where}, (err, result) =>
      err ? reject(err) : resolve(result && result[0])
    )
  })
}

function getUser(User, where) {
  return new Promise((resolve, reject) => {
    User.findOne({where}, (err, result) =>
      err ? reject(err) : resolve(result)
    )
  })
}

module.exports = function(User) {
  User.settings.caseSensitiveEmail = false
  User.settings.caseSensitivePublicAddress = false

  User.validatesUniquenessOf('email')
  User.validatesUniquenessOf('publicAddress')

  User.observe('after save', async (ctx, next) => {
    const web3 = getWeb3(User)
    if (!ctx.isNewInstance) {
      return next()
    }

    const alice = await getAccount(web3, 1)

    if (alice.toLowerCase() === ctx.instance.publicAddress.toLowerCase()) {
      return next()
    }

    const payee = ctx.instance.publicAddress
    const hub = await getAccount(web3, 0)
    // TODO: read alice value locked-up
    const value = fromEth(1).toString()
    const timeout = moment().add(1, 'day').unix()
    // collaterize channel
    const result = await contract.open(payee, value, timeout, hub, web3)

    console.log('user joined hub', result.transactionHash)

    next()
  })
}
