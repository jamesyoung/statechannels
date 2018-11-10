const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

const {
  getAccount,
  sign,
  sha3
} = require('./helpers')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/webhook', async (req, res) => {
  try {
    const { value, payee, contractAddress } = req.body
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
  } catch(err) {
    res.json({
      error: err.message
    })
  }
})

app.listen(port, () => console.log(`Server listening on port ${port}`))
