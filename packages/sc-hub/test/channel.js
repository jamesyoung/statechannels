describe('/channel', function () {
  var server = require('../server/server')
  var request = require('supertest')(server)
  var expect = require('expect.js')
  var moment = require('moment')

  var Channel
  var User

  before(function() {
    Channel = server.models.Channel
    User = server.models.User
  })

  beforeEach(async function () {
    await Channel.upsert({
      id: 1,
      contractAddress: '0x123',
      account: '0x111',
      staked: '1',
      timeout: moment().toDate(),
      applicationId: 1,
      status: null,
      createdAt: moment().toDate(),
      closedAt: moment().toDate(),
      closed: false,
    }),

    await User.upsert({
      email: 'alice@example',
      publicAddress: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f',
    })

    await User.upsert({
      email: 'bob@example',
      publicAddress: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334',
    })

    await User.upsert({
      email: 'chad@example',
      publicAddress: '0xb829eea8382c9e3d8b0f07b879bd885d8c9778fc',
    })
  })

  it('Post a new channel', function (done) {
    ;(async () => {
      request.post('/api/channels/open').send({
        signedTransaction: await genTx(),
        timeout: moment().unix(),
      }).expect(200, done)
    })()
  })
})

async function genTx() {
  const Web3 = require('web3')
  const assert = require('assert')
  const BN = require('bn.js')
  const moment = require('moment')

  const big = (n) => new BN(n.toString(10))
  const tenPow18 = big(10).pow(big(18))
  const oneEth = big(1).mul(tenPow18)
  const tenEth = big(10).mul(tenPow18)

  const contract = require('../../channel-contracts/build/contracts/Demo3b.json')
  const abi = contract.abi
  const contractAddress = contract.networks[Object.keys(contract.networks)[0]].address

  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3 = new Web3(provider)

  const demo = new web3.eth.Contract(abi, contractAddress)

  const accounts = await web3.eth.getAccounts()

  const hub = accounts[0]
  const alice = accounts[1] // advertiser
  const bob = accounts[2] // publisher

  const prevBal = big(await web3.eth.getBalance(contractAddress))

  const timeout = moment().add(1, 'hour').unix()
  const value = oneEth

  const gas = 4500000
  const gasPrice = 10000000000

  const nonce =  await web3.eth.getTransactionCount(alice)
  const data = await demo.methods.deposit(timeout).encodeABI()

  const tx = {
    to: contractAddress,
    from: alice,
    value: value.toString(),
    gas,
    gasPrice,
    nonce,
    data
  }

  const privateKey = '0x2f4709008b961d1908082e5009d13a5a556aa92ab4b30e4a1db2b0ffb3f2bda5'
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

  console.log(signedTx.rawTransaction)

  return signedTx.rawTransaction
}
