# Bucket Protocol TypeScript SDK

Bucket Protocol aims to be a DeFi Engine on Sui network. It allow users to draw 0% interest loans against $SUI $BTC $ETH and LST used as collateral.

Loans are paid out in $BUCK - a USD pegged stablecoin backed by multiple types of crypto, and need to maintain a minimum collateral ratio of 110%.

In addition to the collateral, the loans are secured by TANK containing $BUCK and by fellow borrowers collectively acting as guarantors of last resort. 

## Install Bucket Protocol

Install Bucket Protocol using npm : `npm i bucket-protocol-sdk`

Install Bucket Protocol using npm and git : `npm install https://github.com/andreidev1/bucket-protocol-sdk.git`

## Quick start

Choose a package ID based `mainnet` or `testnet` by replacing `packageType` value. By default package ID is set to `mainnet`. 

```ts
import { BucketClient } from "bucket-protocol-sdk";

// Instantiate BucketClient
const buck = new BucketClient();

// Or create with rpc url
const buck = new BucketClient("https://sui-mainnet-endpoint.blockvision.org/");
```


## Become a stable swap and start earning rebates by integrating psmIn

```ts

// Build psmIn transaction
let tx = new TransactionBlock();

const coinOut = await buck.psmSwapIn(
  tx,
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",  // e.g USDC coin type
  usdcInput,        // usdc coin object
  "0xdummy...",     // referrer address
);

```

## Query Bucket Protocol

```ts

// Return overall information
await buck.getProtocol()

// Return all available bottles
await buck.getAllBottes()

// Return all destroyed bottles
await buck.getDestroyedBottles()

// Return all tanks
await buck.getAllTanks()

// Return all psms
await buck.getAllPsms()

// Return all fountains
await buck.getAllFountains()

// Return all strap fountains
await buck.getAllStrapFountains()

```

## Query User state

```ts

// Return user tanks with address
await buck.getUserTanks(`0xdummy.....`)

// Return user bottles with address
await buck.getUserBottles(`0xdummy.....`)

// Return user positions with address
await buck.getUserLpProofs(`0xdummy.....`)

```


## Get borrow transaction

```ts
let tx = new TransactionBlock();

tx = await buck.getBorrowTx(
  tx,
  `0x2::sui::SUI`,      // collateral coin type
  1_000_000_000,        // collateral amount in raw
  1_000_000_000,        // borrow amount in raw
  `0xdummy...`,         // recipient address
  true,                 // isUpdateOracle       
  `0xdummy...`,         // you can fetch with findInsertionPlace function
  strapId,              // bottle's strapId
);

```