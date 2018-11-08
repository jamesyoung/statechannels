const Web3 = require('web3')
const BN = require('bn.js')

const big = (n) => new BN(n.toString(10))

const contractJSON = require('channel-contracts/build/contracts/Demo4.json')
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
  const result = await instance.methods.deposit(timeout, payee).send({
    from: account,
    value: value
  })

  return result
}

// get user state channel balance
async function getBalance(payer, web3) {
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.payers(payer).call()

  return big(result.amount)
}

module.exports = {
  address,
  info,
  close,
  open,
  getBalance
}
