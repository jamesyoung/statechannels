#!/usr/bin/env node

const Web3 = require('web3')
const assert = require('assert')
const BN = require('bn.js')
const moment = require('moment')

const big = (n) => new BN(n.toString(10))
const tenPow18 = big(10).pow(big(18))
const oneEth = big(1).mul(tenPow18)
const tenEth = big(10).mul(tenPow18)

const contract = require('../../channel-contracts/build/contracts/Demo3a.json')
const abi = contract.abi
const contractAddress = contract.networks[Object.keys(contract.networks)[0]].address

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)

const demo = new web3.eth.Contract(abi, contractAddress)

async function main() {
  const accounts = await web3.eth.getAccounts()

  const hub = accounts[0]
  const alice = accounts[1] // advertiser
  const bob = accounts[2] // publisher

  const prevBal = big(await web3.eth.getBalance(contractAddress))

  const timeout = moment().add(1, 'hour').unix()
  const value = tenEth
  const data = await demo.methods.deposit(timeout, bob).encodeABI()

  const gas = 4500000
  const gasPrice = 10000000000

  const tx = {
    to: contractAddress,
    from: alice,
    value: value.toString(),
    gas,
    gasPrice,
    data
  }

  const privateKey = '0x2f4709008b961d1908082e5009d13a5a556aa92ab4b30e4a1db2b0ffb3f2bda5'
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

  const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

  console.log(signedTx.rawTransaction)

  assert.equal(result.status, true)

  const bal = big(await web3.eth.getBalance(contractAddress))
  assert.equal(bal.sub(prevBal).toString(), value.toString())
  console.log('channel opened')
}

main()
