import Web3 from 'web3'
import detectNetwork from 'web3-detect-network'
const web3 = new Web3()

const BN = require('bn.js')

const big = (n) => new BN(n.toString(10))

const contractJSON = require('channel-contracts/build/contracts/Demo5.json')
const { abi, networks } = contractJSON
const { address } = networks[Object.keys(networks)[0]]

export function getWeb3() {
  return web3
}

export function toWei(value) {
  return web3.utils.toWei(`${value||0}`, 'ether')
}

export function toEth(value) {
  return web3.utils.fromWei(`${value||0}`, 'ether')
}

export function getModels() {
  return window.loopbackApp.models
}

export function getContractAddress() {
  return address
}

export function getContractAbi() {
  return abi
}

export function getWindowWeb3() {
  return window.web3
}

export function isMetamaskConnected() {
  const web3 = getWindowWeb3()
  if (!web3) return false
  return web3.currentProvider && web3.currentProvider && web3.currentProvider.isConnected()
}

export function getProvider() {
  const defaultProvider = web3.providers.HttpProvider('http://localhost:8545')
  const w3 = getWindowWeb3()
  if (!w3) return defaultProvider
  return w3.currentProvider
}

export function getConnectedAccount() {
  return isMetamaskConnected() && getWindowWeb3().eth.defaultAccount
}

export async function getConnectedNetwork() {
  return detectNetwork(getProvider())
}

export async function getBalance(account) {
  return new Promise((resolve, reject) => {
    getWindowWeb3().eth.getBalance(account, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export async function openChannel(opts) {
  const { value, hub, timeout, account } = opts
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.deposit(hub, timeout).send({
    from: account,
    value
  })

  return result
}

export async function getChannelBalance(payer) {
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.payers(payer).call()

  return big(result.amount)
}

export function getTestAddresses() {
  const addresses = {
    alice: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    bob: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334',
    chad: '0xb829eea8382c9e3d8b0f07b879bd885d8c9778fc',
    dan: '0x17e9fd828204a374c739a4b8e5c8d8dba2396056'
  }

  return addresses
}

export function getTestAddress(user) {
  return getTestAddresses()[user]
}
