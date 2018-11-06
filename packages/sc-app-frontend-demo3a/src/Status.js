import React, { Component } from 'react';
import styled from 'styled-components'
import {
  getModels,
  getBalance,
  toEth,
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
      payer: '0xc776e37126bc5fa0e12e775416bb59e4884f8b2f'
    }
  }

  async getStatus() {
    this.clearOutput()

    try {
      const { payer } = this.state
      const resp = await getModels().Channel.status(payer)

      const payerBal = await getBalance(resp.payer)

      resp.payerAccountBalance = toEth(payerBal.toString())
      if (resp.payee) {
        const payeeBal = await getBalance(resp.payee)
        resp.payeeAccountBalance = toEth(payeeBal.toString())
      }

      this.setState({
        output: resp,
        error: null
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

    const { payer, error } = this.state

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output && <UI.Output>
          {output}
        </UI.Output>}
        <UI.Header>
          Get Channel Status
        </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.getStatus()
        }}>
          <UI.Field>
            <UI.Label>Payer (advertiser. test default: alice)</UI.Label>
            <UI.Input value={payer} onChange={event => this.setState({payer: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit">
              Get Status
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

export default App;
