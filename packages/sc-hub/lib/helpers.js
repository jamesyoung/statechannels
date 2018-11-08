const Web3 = require('web3')
const {soliditySha3: sha3} = require('web3-utils')
const util = require('ethereumjs-util')
const BN = require('bn.js')

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

function extractRSV(sig) {
  sig = sig.substr(2); // strip prefix
  const r = '0x' + sig.slice(0, 64);
  const s = '0x' + sig.slice(64, 128);
  const v = web3.utils.toDecimal(sig.slice(128, 130)) + 27

  return {
    r,
    s,
    v,
  }
}

async function sign(msg, account, _web3) {
  let w3 = _web3 || web3

  let sig = await w3.eth.sign(msg, account)
  const {r, s, v} = extractRSV(sig)

  return {
    sig,
    r,
    s,
    v,
  }
}

function prefixMsg(hash) {
  hash = Buffer.from(hash.slice(2), 'hex')
  const prefix = new Buffer('\x19Ethereum Signed Message:\n')
  const msg = '0x' + util.keccak256(
    Buffer.concat([prefix, new Buffer(String(hash.length)), hash])
  ).toString('hex')
  return msg
}

function getConnector(Model) {
  return Model.app.models.Channel.dataSource.connector
}

function getWeb3(Model) {
  return getConnector(Model).web3
}

async function getAccount(web3) {
  // account 0 for testing
  return (await web3.eth.getAccounts())[0]
}

async function getBalance(account) {
  return new Promise((resolve, reject) => {
    getWindowWeb3().eth.getBalance(account, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function toWei(value) {
  return web3.utils.toWei(`${value||0}`, 'ether')
}

function toEth(value) {
  return web3.utils.fromWei(`${value||0}`, 'ether')
}

const toBig = (n) => new BN(n.toString(10))

module.exports = {
  getConnector,
  getWeb3,
  web3,
  sign,
  prefixMsg,
  sha3,
  getAccount,
  getBalance,
  toWei,
  toEth,
  toBig
}
