import React, { Component } from 'react';
import styled from 'styled-components'
import moment from 'moment'
import {
  toWei,
  openChannel,
  getConnectedAccount,
  isMetamaskConnected,
  getConnectedNetwork,
} from './utils';

const UI = {
  Header: styled.div`
    font-size: 1.1em;
    margin-bottom: 2em;
    font-weight: bold;
  `,
  Container: styled.div`
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  `,
  Form: styled.form`
    display: block;
  `,
  Field: styled.div`
    display: block;
    margin-bottom: 1em;
  `,
  Input: styled.input`
    display: block;
    width: 100%;
    padding: 0.2em;
    font-size: 1em;
  `,
  Label: styled.div`
    display: block;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    font-weight: bold;
    margin-bottom: 0.2em;
  `,
  Output: styled.output`
    font-size: 1em;
    display: block;
    margin: 0 auto;
    background: #f9f8f6;
    padding: 1em;
    margin-bottom: 1em;
    white-space: pre;
    overflow: auto;
  `,
  Error: styled.div`
    width: 100%;
    color: red;
    text-align: center;
    padding: 1em;
  `,
  Actions: styled.div`
    text-align: center;
  `,
  Button: styled.button`
    cursor: pointer;
  `
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      error: null,
      output: null,
      amount: 1,
    }
  }

  componentDidMount() {
    this.onLoad()
  }

  async onLoad() {
    if (!isMetamaskConnected()) {
      return this.setState({
        error: 'please connect MetaMask to localhost'
      })
    }

    const network = await getConnectedNetwork()
    if (network.type !== 'unknown') {
      this.setState({
        error: 'please connect MetaMask to localhost:8545 network'
      })
    }

    const account = getConnectedAccount()
    if (!account) {
      this.setState({
        error: 'No account found. Is MetaMask unlocked?'
      })
    }
  }

  async deposit() {
    this.clearOutput()

    try {
      const { amount } = this.state

      const network = await getConnectedNetwork()
      if (network.type !== 'unknown') {
        return this.setState({
          error: 'please connect MetaMask to localhost:8545 network'
        })
      }

      const value = toWei(amount)
      const account = getConnectedAccount()
      const timeout = moment().add(1, 'day').unix()
      const hub = '0xb2b0f76ece233b8e4bb318e9d663bead67060ca8'

      const result = await openChannel({value, timeout, account, hub})

      this.setState({
        output: {
          ...result
        },
        amount: '',
      })
    } catch(err) {
      this.handleError(err)
    }
  }

  clearOutput() {
    this.setState({
      error: null,
      output: null,
    })
  }

  handleError(err) {
    console.error(err.message)
    this.setState({
      error: err.message
    })
  }

  render() {
    let output = null
    if (this.state.output) {
      output = JSON.stringify(this.state.output, null, 2)
    }

    const { amount, error } = this.state

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output && <UI.Output>
          {output}
        </UI.Output>}
        <UI.Header>
        Deposit
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.deposit()
        }}>
          <UI.Field>
            <UI.Label>Amount (ETH amount to lock up in contract)</UI.Label>
            <UI.Input value={amount} onChange={event => this.setState({amount: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit">
              Deposit
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

export default App;
