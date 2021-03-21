[![Netlify Status](https://api.netlify.com/api/v1/badges/2da38309-7dbe-43bb-bb2a-ba3186bc3556/deploy-status)](https://app.netlify.com/sites/conditional/deploys)

# Omen

## Building

The app code lives in the `app` folder. Use `yarn` to install dependencies.

```bash
cd app/
yarn
```

Create a `.env` file. See `.env.example` for environment variables which may be set.

For Omen builds, use `yarn build`.

The `build` directory in the `app` directory will now contain the build to be served.


# Contracts

## Ethereum Network

| Contract | Address |
| -------- | -------- |
| [ConditionalTokens](https://github.com/gnosis/conditional-tokens-contracts) | [0xC59b0e4De5F1248C1140964E0fF287B192407E0C](https://etherscan.io/address/0xC59b0e4De5F1248C1140964E0fF287B192407E0C#code)     |
| [FPMMDeterministicFactory](https://github.com/gnosis/conditional-tokens-market-makers) | [0x89023DEb1d9a9a62fF3A5ca8F23Be8d87A576220](https://etherscan.io/address/0x89023DEb1d9a9a62fF3A5ca8F23Be8d87A576220#code) |
| [Reality.eth](https://github.com/realitio/realitio-contracts) | [0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47](https://etherscan.io/address/0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47#code) |
| Reality.eth Oracle Adapters | [0x0e414d014A77971f4EAA22AB58E6d84D16Ea838E](https://etherscan.io/address/0x0e414d014A77971f4EAA22AB58E6d84D16Ea838E#code) |
| Reality.eth Oracle Adapters (Scalar) | [0xaa548EfBb0972e0c4b9551dcCfb6B787A1B90082](https://etherscan.io/address/0xaa548EfBb0972e0c4b9551dcCfb6B787A1B90082#code) |
| DXTokenRegistry | [0x93DB90445B76329e9ed96ECd74e76D8fbf2590d8](https://etherscan.io/address/0x93db90445b76329e9ed96ecd74e76d8fbf2590d8#code) |
| GeneralizedTCR | [0xb72103eE8819F2480c25d306eEAb7c3382fBA612](https://etherscan.io/address/0xb72103eE8819F2480c25d306eEAb7c3382fBA612#code) |
| CPKFactory | [0x0fB4340432e56c014fa96286de17222822a9281b](https://etherscan.io/address/0x0fB4340432e56c014fa96286de17222822a9281b#code) |
| Uniswap V2 Factory | [0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f](https://etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f#code) |
| WETH9 | [0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2#code) |
| GelatoCore | [0x025030BdAa159f281cAe63873E68313a703725A5](https://etherscan.io/address/0x025030BdAa159f281cAe63873E68313a703725A5#code) |


## Rinkeby Network

| Contract | Address |
| -------- | -------- |
| [ConditionalTokens](https://github.com/gnosis/conditional-tokens-contracts) | [0x36bede640D19981A82090519bC1626249984c908](https://rinkeby.etherscan.io/address/0x36bede640D19981A82090519bC1626249984c908#code)     |
| [FPMMDeterministicFactory](https://github.com/gnosis/conditional-tokens-market-makers) | [0x0fB4340432e56c014fa96286de17222822a9281b](https://rinkeby.etherscan.io/address/0x0fB4340432e56c014fa96286de17222822a9281b#code) |
| [Reality.eth](https://github.com/realitio/realitio-contracts) | [0x3D00D77ee771405628a4bA4913175EcC095538da](https://rinkeby.etherscan.io/address/0x3D00D77ee771405628a4bA4913175EcC095538da#code) |
| Reality.eth Oracle Adapters | [0x17174dC1b62add32a1DE477A357e75b0dcDEed6E](https://rinkeby.etherscan.io/address/0x17174dc1b62add32a1de477a357e75b0dcdeed6e#code) |
| Reality.eth Oracle Adapters (Scalar) | [0x0e8Db8caD541C0Bf5b611636e81fEc0828bc7902](https://rinkeby.etherscan.io/address/0x0e8Db8caD541C0Bf5b611636e81fEc0828bc7902#code) |
| DXTokenRegistry | [0x03165df66d9448e45c2f5137486af3e7e752a352](https://rinkeby.etherscan.io/address/0x03165df66d9448e45c2f5137486af3e7e752a352#code) |
| GeneralizedTCR | [0x3b29096b7ab49428923d902cEC3dFEaa49993234](https://rinkeby.etherscan.io/address/0x3b29096b7ab49428923d902cec3dfeaa49993234#code) |
| CPKFactory | [0x336c19296d3989e9e0c2561ef21c964068657c38](https://rinkeby.etherscan.io/address/0x336c19296d3989e9e0c2561ef21c964068657c38#code) |
| Uniswap V2 Factory | [0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f](https://rinkeby.etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f#code) |
| WETH9 | [0xc778417E063141139Fce010982780140Aa0cD5Ab](https://rinkeby.etherscan.io/address/0xc778417E063141139Fce010982780140Aa0cD5Ab#code) |
| GelatoCore | [0x733aDEf4f8346FD96107d8d6605eA9ab5645d632](https://rinkeby.etherscan.io/address/0x733aDEf4f8346FD96107d8d6605eA9ab5645d632#code) |


## xDai Network

| Contract | Address |
| -------- | -------- |
| [ConditionalTokens](https://github.com/gnosis/conditional-tokens-contracts) | [0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce](https://blockscout.com/poa/xdai/address/0xCeAfDD6bc0bEF976fdCd1112955828E00543c0Ce/read-contract)     |
| [FPMMDeterministicFactory](https://github.com/gnosis/conditional-tokens-market-makers) | [0x9083A2B699c0a4AD06F63580BDE2635d26a3eeF0](https://blockscout.com/poa/xdai/address/0x9083A2B699c0a4AD06F63580BDE2635d26a3eeF0/contracts) |
| [Kleros bridge](https://github.com/kleros/cross-chain-realitio-proxy) | [0xe40DD83a262da3f56976038F1554Fe541Fa75ecd](https://blockscout.com/poa/xdai/address/0xe40DD83a262da3f56976038F1554Fe541Fa75ecd/contracts) |
| [Reality.eth](https://github.com/realitio/realitio-contracts) | [0x79e32aE03fb27B07C89c0c568F80287C01ca2E57](https://blockscout.com/poa/xdai/address/0x79e32aE03fb27B07C89c0c568F80287C01ca2E57/contracts) |
| Reality.eth Oracle Adapters | [0x2bf1BFb0eB6276a4F4B60044068Cb8CdEB89f79B](https://blockscout.com/poa/xdai/address/0x2bf1BFb0eB6276a4F4B60044068Cb8CdEB89f79B/contracts) |
| Reality.eth Oracle Adapters (Scalar) | [0xb97FCb6adf4c4aF9981932a004e6CC47173d0Bfc](https://blockscout.com/poa/xdai/address/0xb97FCb6adf4c4aF9981932a004e6CC47173d0Bfc/contracts) |
| CPKFactory | [0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7](https://blockscout.com/poa/xdai/address/0xfC7577774887aAE7bAcdf0Fc8ce041DA0b3200f7/contracts) |
| Uniswap V2 Router | [0x1C232F01118CB8B424793ae03F870aa7D0ac7f77](https://blockscout.com/poa/xdai/address/0x1C232F01118CB8B424793ae03F870aa7D0ac7f77/contracts) |
| Uniswap V2 Factory | [0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7](https://blockscout.com/poa/xdai/address/0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7/contracts) |
| Wrapped1155Factory | [0xDE6943f3717738038159a406FF157d4eb3238c1B](https://blockscout.com/poa/xdai/address/0xDE6943f3717738038159a406FF157d4eb3238c1B/contracts) |
| [DXdaoArbitrator](https://github.com/nicoelzer/omen-arbitrator) | [0xFe14059344b74043Af518d12931600C0f52dF7c5](https://blockscout.com/poa/xdai/address/0xFe14059344b74043Af518d12931600C0f52dF7c5/contracts) |


## Sokol Network

| Contract | Address |
| -------- | -------- |
| [ConditionalTokens](https://github.com/gnosis/conditional-tokens-contracts) | [0x0Db8C35045a830DC7F2A4dd87ef90e7A9Cd0534f](https://blockscout.com/poa/sokol/address/0x0Db8C35045a830DC7F2A4dd87ef90e7A9Cd0534f/contracts)     |
| [FPMMDeterministicFactory](https://github.com/gnosis/conditional-tokens-market-makers) | [0x2fb8cc057946DCFA32D8eA8115A1Dd630f6efea5](https://blockscout.com/poa/sokol/address/0x2fb8cc057946DCFA32D8eA8115A1Dd630f6efea5/contracts) |
| [Kleros bridge](https://github.com/kleros/cross-chain-realitio-proxy) | [0x37Fcdb26F12f3FC76F2424EC6B94D434a959A0f7](https://blockscout.com/poa/sokol/address/0x37Fcdb26F12f3FC76F2424EC6B94D434a959A0f7/contracts) |
| [Reality.eth](https://github.com/realitio/realitio-contracts) | [0x90a617ed516ab7fAaBA56CcEDA0C5D952f294d03](https://blockscout.com/poa/sokol/address/0x90a617ed516ab7fAaBA56CcEDA0C5D952f294d03/contracts) |
| Reality.eth Oracle Adapters | [0xa57EBD93faa73b3491aAe396557D6ceC24fC6984](https://blockscout.com/poa/sokol/address/0xa57EBD93faa73b3491aAe396557D6ceC24fC6984/contracts) |
| Reality.eth Oracle Adapters (Scalar) | [0x1D369EEC97cF2E62c8DBB804b3998Bf15bcb67dB](https://blockscout.com/poa/sokol/address/0x1D369EEC97cF2E62c8DBB804b3998Bf15bcb67dB/contracts) |
| CPKFactory | [0xaaF0CCef0C0C355Ee764B3d36bcCF257C527269B](https://blockscout.com/poa/sokol/address/0xaaF0CCef0C0C355Ee764B3d36bcCF257C527269B/contracts) |
| Uniswap V2 Router | [0x5948f454fceF54e81757e96f7ebb2b91A064771c](https://blockscout.com/poa/sokol/address/0x5948f454fceF54e81757e96f7ebb2b91A064771c/contracts) |
| Uniswap V2 Factory | [0x985B5011c850C27ee1cE0a0982B8E9c230596960](https://blockscout.com/poa/sokol/address/0x985B5011c850C27ee1cE0a0982B8E9c230596960/contracts) |
| Wrapped1155Factory | [0xDE6943f3717738038159a406FF157d4eb3238c1B](https://blockscout.com/poa/sokol/address/0xDE6943f3717738038159a406FF157d4eb3238c1B/transactions) |


## Subgraphs

| Subgraphs | xDai | Sokol | Arbitrum |
| -------- | -------- | -------- | -------- |
| Omen | [Omen-xDai](https://thegraph.com/explorer/subgraph/protofire/omen-xdai) | [Omen-Sokol](https://thegraph.com/explorer/subgraph/protofire/omen-sokol) | - |
| Conditional Tokens Subgraph | [Conditional-Tokens-xDai](https://thegraph.com/explorer/subgraph/davidalbela/conditional-tokens-xdai) | [Conditional-Tokens-Sokol](https://thegraph.com/explorer/subgraph/davidalbela/conditional-tokens-sokol) | - |
