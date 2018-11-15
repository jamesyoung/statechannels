import React, { Component } from 'react';
import styled from 'styled-components'
import {
  getBalance,
  toEth,
  getChannelBalance,
  getTestAddresses
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
  `,
  TableContainer: styled.div`

  `,
  Table: styled.table`
    display: table;
    width: 100%;
  `,
  TR: styled.tr`

  `,
  TD: styled.td`

  `,
  TBody: styled.tbody`

  `
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      error: null,
      output: null,
      table: []
    }

    this.loadData()
  }

  async loadData() {
    const testAccounts = getTestAddresses()
    let data = []

    for (let k in testAccounts) {
      const addr = testAccounts[k]
      const bal = await getBalance(addr)
      const contractBal = await getChannelBalance(addr)

      console.log(k, toEth(bal.toString()))
      console.log(k, toEth(contractBal.toString()))
      data.push({[k]: toEth(bal.toString())})
    }

    this.setState({
      table: data
    })
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

    let { table, error } = this.state

    table = (<UI.Table><UI.TBody>{table.map((x, i) => {
      return (<UI.TR key={i}>
        <UI.TD>{Object.keys(x)[0]}</UI.TD>
        <UI.TD>{Object.values(x)[0]}</UI.TD>
      </UI.TR>)
    })}</UI.TBody></UI.Table>)

    return (
      <UI.Container>
        {error && <UI.Error>
          {error}
        </UI.Error>}
        {output && <UI.Output>
          {output}
        </UI.Output>}
        <UI.Header>
          Status
        </UI.Header>
        <UI.TableContainer>
          {table}
        </UI.TableContainer>
      </UI.Container>
    );
  }
}

export default App;
