const Channel = artifacts.require('Demo3a')
const moment = require('moment')
const BN = require('bn.js')
const {soliditySha3: sha3} = require('web3-utils')
const util = require('ethereumjs-util')
const Reverter = require('./utils/reverter')

const big = (n) => new BN(n.toString(10))
const tenPow18 = big(10).pow(big(18))
const oneEth = big(1).mul(tenPow18).toString(10)

contract('StateChannel', (accounts) => {
  const reverter = new Reverter(web3);
  const hub = accounts[0]
  const alice = accounts[1] // advertiser
  const bob = accounts[2] // publisher
  const hubFee = 2
  const gasPrice = big(25000000000)
  let instance

  before('setup', async () => {
    instance = await Channel.new(hub, hubFee)

    await reverter.snapshot()
  })

  context('Channel', () => {
    describe('[init]', () => {
      it('should crash if hub address is invalid', async () => {
        try {
          await Channel.new(0x0, 0);
          assert.isTrue(false);
        } catch (e) {

        }
      })

      after(async () => {
        await reverter.revert()
      })
    })
    describe('state channel', () => {
      it('alice should deposit into state channel', async () => {
        const timeout = moment().add(1, 'day').unix()
        const result = await instance.deposit(timeout, bob, {
          from: alice,
          to: instance.address,
          value: oneEth
        })

        assert.equal(result.receipt.status, '0x01')

        const bal = await web3.eth.getBalance(instance.address)
        assert.equal(bal.toString(), oneEth.toString())
      })
      it('alice should sign message and withdraw', async () => {
        const prevBobBal = web3.eth.getBalance(bob)

        const total = oneEth
        let hash = sha3(
          {type: 'address', value: instance.address},
          {type: 'uint256', value: total.toString()}
        )
        let sig = (await web3.eth.sign(alice, hash)).slice(2)
        const r = '0x' + sig.slice(0, 64);
        const s = '0x' + sig.slice(64, 128);
        let v = web3.toDecimal(sig.slice(128, 130)) + 27

        hash = Buffer.from(hash.slice(2), 'hex')
        const prefix = new Buffer('\x19Ethereum Signed Message:\n')
        const msg = '0x' + util.keccak256(
          Buffer.concat([prefix, new Buffer(String(hash.length)), hash])
        ).toString('hex')

        const result = await instance.withdraw(msg, r, s, v, total.toString(), alice, {
          from: alice,
        })
        assert.equal(result.receipt.status, '0x01')
        console.log(result)

        const aliceBal = web3.eth.getBalance(alice)
        console.log(aliceBal.toString())

        const bobBal = web3.eth.getBalance(bob)
        console.log(prevBobBal.toString())
        console.log(bobBal.toString())

        const contractBal = web3.eth.getBalance(instance.address)
        console.log(contractBal.toString())
      })
    })
  })
})
