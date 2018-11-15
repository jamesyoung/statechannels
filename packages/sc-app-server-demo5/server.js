const assert = require('assert')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

const {
  getAccount,
  sign,
  sha3,
  prefixMsg,
  closeChannel,
  contractAddress
} = require('./helpers')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/webhook', async (req, res) => {
  try {
    const {action, data}= req.body

    if (action === 'sign') {
      const { value, payee, contractAddress } = data
      const payer = await getAccount()

      const hash = sha3(
        {type: 'address', value: contractAddress},
        {type: 'address', value: payee},
        {type: 'uint256', value: value}
      )

      const {r, s, v, sig, msg} = await sign(hash, payer)

      const state = {
          r,
          s,
          v,
          sig,
          hash,
          from: payer,
          to: payee,
          value
      }

      res.json({
        state
      })
    } else if (action === 'close') {
      const payee = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'

      const hash = sha3(
        {type: 'address', value: contractAddress},
        {type: 'address', value: payee},
        {type: 'uint256', value: '0'}
      )

      const signer = await getAccount()

      const {r, s, v} = await sign(hash, signer)

      const msg = prefixMsg(hash)

      const closeData = {
        msg, r, s, v, total: 0, payer: signer, receiver: payee
      }

      const result = await closeChannel(closeData, signer)

      assert.equal(result.status, true, 'did not receive successful status')

      res.json({
        txHash: result.transactionHash,
        closed: true
      })
    } else {
      res.json({
        error: 'unknown action'
      })
    }
  } catch(err) {
    res.json({
      error: err.message
    })
  }
})

app.listen(port, () => console.log(`Server listening on port ${port}`))
