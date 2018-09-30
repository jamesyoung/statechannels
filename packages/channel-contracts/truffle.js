/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
  },
};

/*
Available Accounts
==================
(0) 0xb2b0f76ece233b8e4bb318e9d663bead67060ca8 (~100 ETH)
(1) 0xc776e37126bc5fa0e12e775416bb59e4884f8b2f (~100 ETH)
(2) 0xac59d9c3f5d94becf12afa90b8c1dd3257039334 (~100 ETH)
(3) 0xb829eea8382c9e3d8b0f07b879bd885d8c9778fc (~100 ETH)
(4) 0x17e9fd828204a374c739a4b8e5c8d8dba2396056 (~100 ETH)
(5) 0x6ffc892eb903bcfe8dcd0b0fa7e1db8291bcacc7 (~100 ETH)
(6) 0x3de03ac897c5cf4562fa9a0b5827f8ca04fdb637 (~100 ETH)
(7) 0xe0acd239e4fd3abbcd1c26f212f3e30df307ebe6 (~100 ETH)
(8) 0x9880e0bc955877f35ebdf37f6709c3d11ae74306 (~100 ETH)
(9) 0x781439a9912b8d6fec3c7b579bd1b74ca6a9cabf (~100 ETH)

Private Keys
==================
(0) 0x26fbfa8ae30002295dac9708f74613de5f4eb02d3980077d0499826d27f7730a
(1) 0x2f4709008b961d1908082e5009d13a5a556aa92ab4b30e4a1db2b0ffb3f2bda5
(2) 0x192e0d55bf3fb9f171040f7b8871a51dcff8a51a3cb2cfb4cb77d7fd12526c47
(3) 0x3596f12589adc30821c447d5d32f22d80f5262bd83c8c6b48400759819df4877
(4) 0xfdfe1855f66471fa2d648fe7d9bc0af914e5eaa664ad8d84a1efc335023c52c0
(5) 0x45c14507c891cb810b65092a27f1e83ff6b10af105e5ad9a48dfb405493fc194
(6) 0xdc182f4aba3515732b253dd378d735733e1e26b261d8728df340d8b5ebefc96a
(7) 0x89c4414b08dce516a29800a3720f0ebdeb33941e58cdc92f088da51cd9f5195e
(8) 0x86b693fdea690fd69c2e999a2e1798b3b1520a96b9821392986316de0ecbf80a
(9) 0xf54108a84137a53825426dc5c850d6a9ea3fa23f3cddf81ef9b549fbd97729d2

HD Wallet
==================
Mnemonic:      purse alien once arrive fitness deposit visa token sun brick intact slam
Base HD Path:  m/44'/60'/0'/0/{account_index}
*/
