import React, { Component } from 'react';
import styled from 'styled-components'
import {
  getModels,
  getContractAddress,
  getTestAddress
} from './utils';

const UI = {
  Header: styled.div`
    font-size: 1em;
    font-weight: bold;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 2em;
  `,
  Container: styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  `,
  Label: styled.div`
    display: block;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    font-weight: bold;
    margin: 0 auto;
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
    }

    console.log(getContractAddress())
  }

  async sendImpression(sender) {
    this.setState({
      error: null
    })

    try {
      const resp = await getModels().Message.message({
        from: getTestAddress(sender),
        payer: getTestAddress('alice')
      })

      this.storeData(resp)
      this.setState({
        output: resp
      })
    } catch(err) {
      this.handleError(err)
    }
  }

  readData() {
    let data = []
    try {
      let parsed = JSON.parse(localStorage.getItem('data'))
      if (parsed != null) {
        data = parsed
      }
    } catch (e) {
    }
    return data
  }

  storeData(data) {
    let prevData = []
    try {
      const parsed = JSON.parse(localStorage.getItem('data'))
      if (Array.isArray(parsed)) {
        prevData = parsed
      }
    } catch (e) {
    }

    prevData.push(data)
    localStorage.setItem('data', JSON.stringify(prevData))
  }

  clearData() {
    localStorage.clear()
  }

  clearOutput() {
    this.setState({
      error: null,
      output: null
    })
  }

  async closeChannel() {
    this.setState({
      error: null
    })

    try {
      let data = this.readData()
      if (!data.length) {
        this.setState({
          error: 'there are no stored signatures'
        })
        return
      }

      data = data[data.length-1]
      const resp = await getModels().Channel.closeChannel(data)
      this.setState({
        output: resp
      })

      if (resp.txHash) {
        this.clearData()
      }
    } catch(err) {
      this.handleError(err)
    }
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

    const { error } = this.state

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output ?
          <div>
            <UI.Label>Response</UI.Label>
            <UI.Output>
              {output}
            </UI.Output>
          </div>
        : ''}
        <UI.Header>
          Perform an action
        </UI.Header>
        <UI.Actions>
          <UI.Button onClick={() => this.sendImpression('bob')}>
            Load Impression (Bob)
          </UI.Button>
          <UI.Button onClick={() => this.sendImpression('chad')}>
            Load Impression (Chad)
          </UI.Button>
          <UI.Button onClick={() => this.sendImpression('dan')}>
            Load Impression (Dan)
          </UI.Button>
        </UI.Actions>
      </UI.Container>
    );
  }
}

export default App;
