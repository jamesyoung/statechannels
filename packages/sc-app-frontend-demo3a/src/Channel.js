import React, { Component } from 'react';
import styled from 'styled-components'
import moment from 'moment'
import {
  getModels,
  toWei,
  getContractAddress,
  openChannel,
  getConnectedAccount,
  isMetamaskConnected,
  getConnectedNetwork
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
      timeout: moment().add(1, 'day').unix(),
      payee: '0xac59d9c3f5d94becf12afa90b8c1dd3257039334'
    }
  }

  async componentDidMount() {
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

  async openChannel() {
    this.clearOutput()

    try {
      const { payee, amount, timeout } = this.state

      const network = await getConnectedNetwork()
      if (network.type !== 'unknown') {
        return this.setState({
          error: 'please connect MetaMask to localhost:8545 network'
        })
      }

      const value = toWei(amount)
      const account = getConnectedAccount()
      const contractAddress = getContractAddress()

      const result = await openChannel({payee, value, timeout, account})
      const txHash = result.transactionHash

      const resp = await getModels().Channel.openChannel({
        txHash,
        amount: toWei(amount),
        payee,
        timeout,
        contract: contractAddress,
      })

      console.log(resp)

      this.setState({
        output: {
          txHash,
          amount,
          payer: resp.payer,
          total: resp.total,
          payee,
          account,
          contract: contractAddress,
        },
        amount: '',
        payee: '',
        timeout: '',
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

    const { payee, amount, timeout, error } = this.state

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output && <UI.Output>
          {output}
        </UI.Output>}
        <UI.Header>
        Advertiser open channel with Publisher
      </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.openChannel()
        }}>
          <UI.Field>
            <UI.Label>Payee (publisher. test default: bob)</UI.Label>
            <UI.Input value={payee} onChange={event => this.setState({payee: event.target.value})} />
          </UI.Field>
          <UI.Field>
            <UI.Label>Amount (ETH amount to lock up  in contract)</UI.Label>
            <UI.Input value={amount} onChange={event => this.setState({amount: event.target.value})} />
          </UI.Field>
          <UI.Field>
            <UI.Label>Timeout (unix timestamp of date to expire channel. test default: 1 day)</UI.Label>
            <UI.Input value={timeout} onChange={event => this.setState({timeout: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit">
              Open Channel
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

export default App;
