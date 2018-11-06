# payment channel demo

1. install dependencies

```bash
npm i && lerna bootstrap
```

2. start ganache

```bash
make start/testrpc
```

optionally test contracts (in another terminal)

```bash
make test/contracts
```

3. deploy contracts

```bash
make deploy/contracts
```

4. build loopback client sdk

```bash
build/client/loopback
```

5. start server (in another terminal)

```bash
make start/server
```

6. start client (in another terminal)

```bash
make start/client
```

7. visit http://localhost:8080/channel and open state channel (Alice the Advertiser opens channel with Bob the Publisher)

<img width="862" alt="" src="https://user-images.githubusercontent.com/168240/47494218-ffa15780-d805-11e8-96c8-2ac4d1079fb9.png">

<img width="862" alt="" src="https://user-images.githubusercontent.com/168240/47494224-029c4800-d806-11e8-9d3a-c9839c1cd513.png">

8. Visit http://localhost:8080/ and press the load impression button a couple times (to register ad impressions)

<img width="860" alt="" src="https://user-images.githubusercontent.com/168240/47494153-dc76a800-d805-11e8-88d5-2cc8568b317c.png">

<img width="863" alt="" src="https://user-images.githubusercontent.com/168240/47494170-e698a680-d805-11e8-886d-8ceeea3e8e84.png">

9. Close channel by clicking on close channel button (Bob the publisher closes channel with Alice the Advertiser by sending the last signed transaction by Alice)

<img width="859" alt="" src="https://user-images.githubusercontent.com/168240/47494111-ca950500-d805-11e8-8703-bc43d3c08c90.png">

10. Amount is deducted from Alice the Advertiser and transferred to Bob the Publisher.
