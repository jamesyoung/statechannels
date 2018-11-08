import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from 'styled-components'
import Home from './Home'
import Channel from './Channel'
import CloseChannel from './CloseChannel'
import Status from './Status'
import Signup from './Signup'

const UI = {
  Container: styled.div`
    width: 100%;
  `,
  Header: styled.div`
    width: 100%;
    margin: 0 auto 3em auto;
    background: #f5f5f5;
  `,
  HeaderInner: styled.div`
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 1em;
  `,
  Nav: styled.nav`
    display: flex;
    vertical-align: middle;
    justify-content: center;
    a {
      margin-left: 1em;
      color: #3489b5;
      text-decoration: none;
      border: 1px solid #e0dede;
      padding: 0.2em 0.5em;
      border-radius: 1em;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      &:hover {
        text-decoration: none;
        border: 1px solid #cccbcb;
      }
    }
  `,
  Title: styled.div`
    margin-right: 1em;
    font-size: 1.2em;
  `,
}

class App extends Component {
  render() {
    return (
      <Router>
        <UI.Container>
          <UI.Header>
            <UI.HeaderInner>
              <UI.Title>Payment Channel Demo</UI.Title>
              <UI.Nav>
                <Link to="/">Home</Link>
                <Link to="/channel">Deposit to hub</Link>
                <Link to="/closechannel">Close channel</Link>
                <Link to="/status">Channel Status</Link>
                <Link to="/signup">Signup</Link>
              </UI.Nav>
            </UI.HeaderInner>
          </UI.Header>
          <Route path="/" exact component={Home} />
          <Route path="/channel" exact component={Channel} />
          <Route path="/closechannel" exact component={CloseChannel} />
          <Route path="/status" exact component={Status} />
          <Route path="/signup" exact component={Signup} />
        </UI.Container>
      </Router>
    );
  }
}

export default App;
