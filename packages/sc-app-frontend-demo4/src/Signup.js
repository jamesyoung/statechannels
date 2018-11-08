import React, { Component } from 'react';
import styled from 'styled-components'
import {
  getModels,
  getTestAddress
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
      email: '',
      publicAddress: '',
    }
  }

  componentDidMount() {
    this.createTestAccounts()
  }

  createTestAccounts() {
    const users = ['alice', 'bob', 'chad']
    users.forEach(async user => {
      try {
        await getModels().User.create({
          email: `${user}@example.com`,
          publicAddress: getTestAddress(user)
        })
      } catch(err) {

      }
    })
  }

  async signup() {
    this.clearOutput()

    try {
      const { email, publicAddress } = this.state
      const resp = await getModels().User.create({
        email,
        publicAddress
      })

      this.setState({
        output: {
          id: resp.id,
          email: resp.email,
          publicAddress: resp.publicAddress,
        },
        email: '',
        publicAddress: '',
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

    const { email, publicAddress, error } = this.state

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output && <UI.Output>
          {output}
        </UI.Output>}
        <UI.Header>
          Sign up
      </UI.Header>
        <UI.Form onSubmit={event => {
          event.preventDefault()
          this.signup()
        }}>
          <UI.Field>
            <UI.Label>Email</UI.Label>
            <UI.Input value={email} onChange={event => this.setState({email: event.target.value})} />
          </UI.Field>
          <UI.Field>
            <UI.Label>Public address</UI.Label>
            <UI.Input value={publicAddress} onChange={event => this.setState({publicAddress: event.target.value})} />
          </UI.Field>
          <UI.Actions>
            <UI.Button type="submit">
              Sign up
            </UI.Button>
          </UI.Actions>
        </UI.Form>
      </UI.Container>
    );
  }
}

export default App;
