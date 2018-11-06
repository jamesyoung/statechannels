import Web3 from 'web3'
import detectNetwork from 'web3-detect-network'
const web3 = new Web3()

const contractJSON = require('channel-contracts/build/contracts/Channel.json')
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
  const { payee, value, timeout, account } = opts
  const web3 = new Web3(getProvider())
  const instance = new web3.eth.Contract(abi, address)
  const result = await instance.methods.deposit(timeout, payee).send({
    from: account,
    value
  })

  return result
}
