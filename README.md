# state-channels-poc

This repository is a monorepo managed by
[lerna](https://github.com/lerna/lerna).

It contains the following packages:

- channel-contracts: Solidity contracts for the state channel
- loopback-connector-web3: Web3 Connector for LoopBack 3.x
- sc-demo-app: A demo application (clicks demo)
- sc-hub: The hub
- sc-app-server-demo3: The payment channel impression demo server
- sc-app-frontend-demo3: The payment channel impression demo frontend

# Getting started

## Check out the project and install dependencies

```sh
git clone git@github.com:jamesyoung/statechannels.git
cd statechannels
git submodule init
git submodule update
npm i
```

## Compile and migrate solidity contracts

### Compile contracts

```sh
cd packages/channel-contracts
npm run truffle:compile
```

### Start a local ganache

To start a local ganache in a different terminal window/tab:

```sh
npm run ganache
```

### Run migration

```sh
cd packages/channel-contracts
npm run truffle:migrate
```

## Start the demo application

```
cd packages/sc-demo-app
npm start
``

Open http://localhost:3000/explorer and play!
```

# Demos

A number of scenarios have been created to show the following progression:

- demo 1: an indirect interaciton with a smart contract by someone with no ETH
  value
- demo 2: an etherless relay
- demo 3: state channels
- demo 4: account abstraction

## demo #1

### goal

to demo a baseline scenario where users interacting with a hub as an
intermediary can update a smartcontract if they have value in their account

### players

raymond is the advertiser james is a publisher al is a publisher

### hub

hub is a marketplace that brings advertisers together with publishers hub keeps
track of clicks through the blockchain hub hosts `/clicks` API through LB hub
interacts with the smartcontract that keeps track of global counter of clicks

### initial account balances

hub has account hub.eth with 5 eth

### steps

**step 1**

raymond wants to sign up to advertise with the hub james agrees to publish
raymond's ads and informs the hub on each click al agrees to publish raymond's
ads and informs the hub on each click

**step 2**

james invokes `POST /clicks` API

hub receives the request with signed message from james

hub pays the gas to update the smart contract

hub updates state: increments the `clicks` counter in the smartcontract from 0
to 1

hub ETH goes down to 4.999 ETH

james receives the clicks counter state as a string - `1` from the api call

**step 2**

al invokes `POST /clicks` API

hub recives the request with signed message from al

hub pays the gas to update the smart contract

hub updates the state: increments the `clicks` counter in the smartcontract form
1 to 2

hub ETH goes down to 4.998 ETH

al receives the clicks counter state as a string - `2` from the api call

## demo #2

### goal

to demo a baseline scenario where users interacting with a hub as an
intermediary can update a smartcontract without value in their account

### players

raymond is the advertiser james is the publisher al is a publisher

### hub

hub is a marketplace that brings advertisers together with publishers hub keeps
track of clicks through the blockchain hub hosts `/clicks/<user>` API through LB
hub interacts with the smartcontract that keeps track of global counter of
clicks hub interacts with the smartcontract that keeps track of user counter of
clicks

### initial account balances

hub has account hub.eth with 5 eth james has account james.eth with 0 eth and
just a set of keys al has account al.eth with 0 ETH and just a set of keys

### steps

**step 1**

james invokes `POST /clicks/james` API

hub receives the request with signed message from james

hub updates state:

- increments the global `clicks` counter in the smartcontract from 0 to 1
- increments the james `clicks` counter in the smartcontract from 0 to 1

hub ETH goes down to 4.998 ETH

james receives the clicks counter state as a string - `1` from the api call

**step 2**

al invokes `POST /clicks/al` API

hub recives the request with signed message from al

hub ETH goes down to 4.996 ETH

hub updates state:

- increments the global `clicks` counter in the smartcontract from 1 to 2
- increments the al `clicks` counter in the smartcontract from 0 to 1

al receives the clicks counter state as a string - `1` from the api call

## demo #3

### goal

to demo state channels where sender has ETH and receiver has no ETH

### players

raymond is the advertiser james is the publisher al is a publisher

### hub

hub is a marketplace that brings advertisers together with publishers hub keeps
track of clicks through the blockchain hub hosts `/clicks/<user>` API through LB
hub interacts with the smartcontract that keeps track of global counter of
clicks hub interacts with the smartcontract that keeps track of user counter of
clicks

### initial account balances

hub has account hub.eth with 5 eth james has account james.eth with 5 eth and
just a set of keys al has account al.eth with 0 ETH and just a set of keys

### steps

**step 1**

james desposits 5 eth directly to smart contract

james invokes `POST /clicks/james` API

hub receives the request with signed message from james

hub updates state:

- increments the james `clicks` counter in the smartcontract from 0 to 1

james channel ETH goes down to 4.998 ETH

james receives the clicks counter state as a string - `1` from the api call

al invokes `POST /clicks/james` API

al receives the clicks counter state as a string - `1` and a signed message from
james for 0.002 ETH from the api call

**step 2**

james invokes `POST /clicks/james` API

hub receives the request with signed message from james

hub updates state:

- increments the james `clicks` counter in the smartcontract from 1 to 2

james channel ETH goes down to 4.996 ETH

al channel ETH goes up to 0.004 ETH

james receives the clicks counter state as a string - `2` from the api call

al invokes `POST /clicks/james` API

al receives the clicks counter state as a string - `2` and a signed message from
james for 0.004 ETH from the api call

**step 3**

al invokes `POST /withdraw` API

hub receives al's request with signed message from james

hub closes channel with al

hub sends al 0.004 ETH

## Demo 5

### Instructions

In terminal 1, start testrpc

```bash
make start/testrpc
```

In terminal 2, deploy contracts

```bash
make deploy/contracts
```

In terminal 2, start hub

```bash
make start/hub
```

In terminal 3, start alice server

```bash
make start/server/demo5
```

In terminal 3, start hub frontend

```bash
make start/frontend/demo5
```
