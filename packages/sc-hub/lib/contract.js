const Web3 = require('web3')
const BN = require('bn.js')

const {
  sha3
} = require('./helpers')

const big = (n) => new BN(n.toString(10))

const contractJSON = require('channel-contracts/build/contracts/Demo5.json')
const { abi, networks } = contractJSON
const { address } = networks[Object.keys(networks)[0]]

// get payment channel info
async function info(account, web3) {
  const instance = new web3.eth.Contract(abi, address)
  let {amount, timeout, complete, payer, payee} = await instance.methods.payers(account).call()
  amount = big(amount)
  return { amount, timeout, complete, payer, payee }
}

// close payment channel
async function close(data, signer, web3) {
  const {msg, r, s, v, total, payer, receiver} = data
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.withdraw(msg, r, s, v, total, payer, receiver).send({
    from: signer
  })

  return result
}

// open payment channel
async function open(payee, value, timeout, account, web3) {
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.deposit( payee, timeout).send({
    from: account,
    value: value
  })

  return result
}

// get user state channel balance
async function getBalance(payer, payee, web3) {
  const instance = new web3.eth.Contract(abi, address)

  const hash = sha3(
    {type: 'address', value: payer},
    {type: 'address', value: payee}
  )
  const result = await instance.methods.payers(hash.toString('hex')).call()

  return result.amount
}

module.exports = {
  address,
  info,
  close,
  open,
  getBalance
}
