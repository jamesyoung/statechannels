# state-channels-poc

This repository is a monorepo managed by [lerna](https://github.com/lerna/lerna).

It contains the following packages:

- sol: Solidity contracts for the state channel
- loopback-connector-web3: Web3 Connector for LoopBack 3.x
- sc-demo-app: A demo application

# Getting started

## Check out the project and install dependencies

```sh
git clone git@github.com:LunchBadger/statechannels.git
cd statechannels
npm i
```

## Compile and migrate solidity contracts

### Compile contracts
```sh
cd packages/sol
npm run truffle:compile
```

### Start a local ganache
To start a local ganache in a different terminal window/tab:

```sh
npm run ganache
```

### Run migration
```sh
cd packages/sol
npm run truffle:migrate
```

## Start the demo application

```
cd packages/sc-demo-app
npm start
``

Open http://localhost:3000/explorer and play!
