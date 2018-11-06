#!/usr/bin/env node

const Web3 = require('web3')
const assert = require('assert')
const BN = require('bn.js')

const big = (n) => new BN(n.toString(10))
const tenPow18 = big(10).pow(big(18))
const oneEth = big(1).mul(tenPow18)
const tenEth = big(10).mul(tenPow18)

const contract = require('../../channel-contracts/build/contracts/Channel.json')
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

  const timeout = (60 * 60) // 1 hour
  const value = tenEth
  const result = await demo.methods.deposit(timeout, bob).send({
    from: alice,
    value: value.toString()
  })
  assert.equal(result.status, true)

  const bal = big(await web3.eth.getBalance(contractAddress))
  assert.equal(bal.sub(prevBal).toString(), value.toString())
  console.log('channel opened')
}

main()
