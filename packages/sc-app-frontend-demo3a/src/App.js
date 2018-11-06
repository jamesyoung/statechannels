import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from 'styled-components'
import Home from './Home'
import Channel from './Channel'
import Status from './Status'

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
    a {
      margin-left: 2em;
      color: #3489b5;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
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
                <Link to="/channel">Open Channel</Link>
                <Link to="/status">Channel Status</Link>
              </UI.Nav>
            </UI.HeaderInner>
          </UI.Header>
          <Route path="/" exact component={Home} />
          <Route path="/channel" exact component={Channel} />
          <Route path="/status" exact component={Status} />
        </UI.Container>
      </Router>
    );
  }
}

export default App;
