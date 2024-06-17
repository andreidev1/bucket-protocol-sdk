// Copyright Andrei <andreid.dev@gmail.com>

import { DevInspectResults, DynamicFieldInfo, SuiClient, SuiObjectResponse, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionArgument, TransactionBlock, TransactionResult } from "@mysten/sui.js/transactions";
import { normalizeSuiAddress } from "@mysten/sui.js/utils";
import { BCS, getSuiMoveConfig } from "@mysten/bcs"
import { SharedObjectRef } from "@mysten/sui.js/bcs";

import { COINS_TYPE_LIST, PROTOCOL_ID, SUPRA_PRICE_FEEDS, SUPRA_UPDATE_TARGET, SUPRA_HANDLER_OBJECT, SUPRA_ID, TREASURY_OBJECT, BUCKET_OPERATIONS_PACKAGE_ID, CONTRIBUTOR_TOKEN_ID, CORE_PACKAGE_ID, COIN_DECIMALS, FOUNTAIN_PERIHERY_PACKAGE_ID, AF_OBJS, AF_USDC_BUCK_LP_REGISTRY_ID, BUCKETUS_TREASURY, BUCKETUS_LP_VAULT_05, CETUS_OBJS, KRIYA_SUI_BUCK_LP_REGISTRY_ID, KRIYA_USDC_BUCK_LP_REGISTRY_ID, AF_SUI_BUCK_LP_REGISTRY_ID, CETUS_SUI_BUCK_LP_REGISTRY_ID, FOUNTAIN_PACKAGE_ID, KRIYA_FOUNTAIN_PACKAGE_ID, ORACLE_OBJECT, CLOCK_OBJECT, AF_USDC_BUCK_LP_REGISTRY, PROTOCOL_OBJECT, PSM_POOL_IDS, CETUS_USDC_BUCK_LP_REGISTRY_ID, CETUS_USDC_BUCK_LP_REGISTRY, STRAP_ID, STAKE_PROOF_ID, STRAP_FOUNTAIN_IDS, STRAP_FOUNTAIN_PACKAGE_ID, SBUCK_BUCK_LP_REGISTRY_ID, SBUCK_FOUNTAIN_PACKAGE_ID, SBUCK_FLASK_OBJECT_ID, SWITCHBOARD_UPDATE_TARGET } from "./constants";
import { BucketConstants, PaginatedBottleSummary, BucketResponse, BottleInfoResponse, BucketProtocolResponse, SupraPriceFeedResponse, BucketInfo, TankInfoResponse, TankInfo, UserTankList, ProtocolInfo, TankList, FountainList, UserLpProof, UserLpList, BucketList, FountainInfo, COIN, UserBottleInfo, StrapFountainInfo, StrapFountainList, PsmList, PsmInfo, SBUCKFlaskResponse, PipeResponse } from "./types";
import { U64FromBytes, formatUnits, getCoinSymbol, getObjectNames, lpProofToObject, parseBigInt, proofTypeToCoinType, getInputCoins, coinFromBalance, coinIntoBalance, getMainCoin, objectToFountain, objectToPsm, objectToStrapFountain, getObjectFields } from "./utils";

const DUMMY_ADDRESS = normalizeSuiAddress("0x0");

export class BucketClient {
  /**
   * @description a TS wrapper over Bucket Protocol Move packages.
   * @param network connection to fullnode: 'mainnet' | 'testnet' | 'devnet' | 'localnet' | string
   * @param owner (optional) address of the current user (default: DUMMY_ADDRESS)
   */
  private client: SuiClient;

  constructor(
    public network: string = 'mainnet',
    public owner: string = DUMMY_ADDRESS,
  ) {
    let url = "";

    if (network == 'mainnet'
      || network == 'testnet'
      || network == 'devnet'
      || network == 'localnet') {
      url = getFullnodeUrl(network);
    }
    else {
      url = network as string;
    }

    this.client = new SuiClient({ url });
  }

  depositToTank(
    tx: TransactionBlock,
    assetBuck: string,
    assetType: string,
    tankId: string,
    depositAmount: string,
  ): TransactionResult {
    /**
     * @description Deposit BUCK into tank
     * @param assetBuck Buck asset , e.g "0xc50de8bf1f8f9b7450646ef2d72e80ef243b6e06b22645fceed567219f3a33c4::buck::BUCK"
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param tankId The tank object id to deposit to , e.g "0xcae41b2e728eace479bc0c167c3dfa03875c48c94b3b4e5dc7f33cf5cc0c43f6"
     * @param depositAmount BUCK amount to deposit into tank
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::tank::deposit`,
      typeArguments: [assetBuck, assetType],
      arguments: [tx.object(tankId), tx.pure(depositAmount)],
    });
  }

  withdrawFromTank(
    tx: TransactionBlock,
    assetBuck: string,
    assetType: string,
    tankId: string,
    contributorToken: string,
  ): TransactionResult {
    /**
     * @description Withdraw BUCK and collateral gain from the Tank
     * @param assetBuck Buck asset , e.g "0xc50de8bf1f8f9b7450646ef2d72e80ef243b6e06b22645fceed567219f3a33c4::buck::BUCK"
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param tankId The tank object id , e.g "0xcae41b2e728eace479bc0c167c3dfa03875c48c94b3b4e5dc7f33cf5cc0c43f6"
     * @param contributorToken The contributor token
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::tank::withdraw`,
      typeArguments: [assetBuck, assetType],
      arguments: [tx.object(tankId), tx.pure(contributorToken)],
    });
  }

  claimFromTank(
    tx: TransactionBlock,
    assetBuck: string,
    assetType: string,
    tankId: string,
    contributorToken: string,
  ): TransactionResult {
    /**
     * @description Claim collateral gain and BKT reward from the Tank
     * @param assetBuck Buck asset , e.g "0xc50de8bf1f8f9b7450646ef2d72e80ef243b6e06b22645fceed567219f3a33c4::buck::BUCK"
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param tankId The tank object id , e.g "0xcae41b2e728eace479bc0c167c3dfa03875c48c94b3b4e5dc7f33cf5cc0c43f6"
     * @param contributorToken The contributor token
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::tank::claim`,
      typeArguments: [assetBuck, assetType],
      arguments: [tx.object(tankId), tx.pure(contributorToken)],
    });
  }

  claimBkt(
    tx: TransactionBlock,
    assetBuck: string,
    assetType: string,
    tankId: string,
    contributorToken: string,
  ): TransactionResult {
    /**
     * @description Claim BKT reward earned by a deposit since its last snapshots were taken
     * @param assetBuck Buck asset , e.g "0xc50de8bf1f8f9b7450646ef2d72e80ef243b6e06b22645fceed567219f3a33c4::buck::BUCK"
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param tankId The tank object id , e.g "0xcae41b2e728eace479bc0c167c3dfa03875c48c94b3b4e5dc7f33cf5cc0c43f6"
     * @param contributorToken The contributor token
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::tank::claim_bkt`,
      typeArguments: [assetBuck, assetType],
      arguments: [tx.object(tankId), tx.pure(contributorToken)],
    });
  }

  borrow(
    tx: TransactionBlock,
    collateralType: string,
    collateralInput: TransactionResult,
    buckOutput: number | TransactionArgument,
    insertionPlace?: string,
    strapId?: string | TransactionArgument,
  ): TransactionResult | null {
    /**
     * @description Borrow
     * @param tx
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param collateralInput collateral input
     * @param buckOutput
     * @param insertionPlace optional
     * @returns TransactionResult
     */

    if (strapId) {
      if (strapId === "new") {
        const [strap] = tx.moveCall({
          target: `${CORE_PACKAGE_ID}::strap::new`,
          typeArguments: [collateralType],
        });
        if (strap) {
          const [buckOut] = tx.moveCall({
            target: `${CORE_PACKAGE_ID}::buck::borrow_with_strap`,
            typeArguments: [collateralType],
            arguments: [
              tx.sharedObjectRef(PROTOCOL_OBJECT),
              tx.sharedObjectRef(ORACLE_OBJECT),
              strap,
              tx.sharedObjectRef(CLOCK_OBJECT),
              collateralInput,
              typeof buckOutput === "number" ? tx.pure(buckOutput, "u64") : buckOutput,
              tx.pure(insertionPlace ? [insertionPlace] : []),
            ],
          });
          return [strap, buckOut] as TransactionResult;
        }
      } else {
        // console.log(strapId, insertionPlace);
        return tx.moveCall({
          target: `${CORE_PACKAGE_ID}::buck::borrow_with_strap`,
          typeArguments: [collateralType],
          arguments: [
            tx.sharedObjectRef(PROTOCOL_OBJECT),
            tx.sharedObjectRef(ORACLE_OBJECT),
            typeof strapId === "string" ? tx.object(strapId) : strapId,
            tx.sharedObjectRef(CLOCK_OBJECT),
            collateralInput,
            typeof buckOutput === "number" ? tx.pure(buckOutput, "u64") : buckOutput,
            tx.pure(insertionPlace ? [insertionPlace] : []),
          ],
        });
      }
    } else {
      return tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::borrow`,
        typeArguments: [collateralType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          collateralInput,
          typeof buckOutput === "number" ? tx.pure(buckOutput, "u64") : buckOutput,
          tx.pure(insertionPlace ? [insertionPlace] : []),
        ],
      });
    }

    return null;
  }

  topUp(
    tx: TransactionBlock,
    collateralType: string,
    collateralInput: TransactionResult,
    forAddress: string,
    insertionPlace?: string,
  ) {
    /**
     * @description Top up function
     * @param tx
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param collateralInput collateral input
     * @param forAddress
     * @param insertionPlace optional
     * @returns TransactionResult
     */

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::buck::top_up_coll`,
      typeArguments: [collateralType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        collateralInput,
        tx.pure(forAddress, "address"),
        tx.pure(insertionPlace ? [insertionPlace] : []),
        tx.sharedObjectRef(CLOCK_OBJECT),
      ],
    });
  }

  withdraw(
    tx: TransactionBlock,
    assetType: string,
    collateralAmount: string,
    insertionPlace?: string,
    strapId?: string | TransactionArgument,
  ): TransactionResult {
    /**
     * @description withdraw
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param collateralAmount
     * @param insertionPlace
     * @returns TransactionResult
     */

    if (strapId) {
      return tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::withdraw_with_strap`,
        typeArguments: [assetType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.sharedObjectRef(ORACLE_OBJECT),
          typeof strapId === "string" ? tx.object(strapId) : strapId,
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.pure(collateralAmount, "u64"),
          tx.pure(insertionPlace ? [insertionPlace] : []),
        ],
      });
    } else {
      return tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::withdraw`,
        typeArguments: [assetType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.pure(collateralAmount, "u64"),
          tx.pure(insertionPlace ? [insertionPlace] : []),
        ],
      });
    }
  }

  repay(
    tx: TransactionBlock,
    assetType: string,
    buckInput: TransactionResult,
    strapId?: string | TransactionArgument,
  ): TransactionResult {
    /**
     * @description Repay borrowed amount
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param buckInput Amount to be repaid
     * @returns TransactionResult
     */

    if (strapId) {
      return tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::repay_with_strap`,
        typeArguments: [assetType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          typeof strapId === "string" ? tx.object(strapId) : strapId,
          buckInput,
          tx.sharedObjectRef(CLOCK_OBJECT),
        ],
      });
    } else {
      return tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::repay_debt`,
        typeArguments: [assetType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          buckInput,
          tx.sharedObjectRef(CLOCK_OBJECT),
        ],
      });
    }
  }

  redeem(
    tx: TransactionBlock,
    assetType: string,
    buckInput: TransactionResult,
    insertionPlace?: string,
  ): TransactionResult {
    /**
     * @description redeem
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param buckInput
     * @param insertionPlace
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::buck::redeem`,
      typeArguments: [assetType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        tx.sharedObjectRef(ORACLE_OBJECT),
        tx.sharedObjectRef(CLOCK_OBJECT),
        buckInput,
        tx.pure(insertionPlace ? [insertionPlace] : []),
      ],
    });
  }

  stake(
    tx: TransactionBlock,
    assetType: string,
    well: string,
    bktInput: string,
    lockTime: string,
  ): TransactionResult {
    /**
     * @description stake to well
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param well well object
     * @param bktInput Amount to stake
     * @param lockTime Locked time for staking
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::well::stake`,
      typeArguments: [assetType],
      arguments: [
        tx.object(well),
        tx.pure(bktInput),
        tx.pure(lockTime),
        tx.sharedObjectRef(CLOCK_OBJECT)
      ],
    });
  }


  unstake(
    tx: TransactionBlock,
    assetType: string,
    well: string,
    stakedBkt: string,
  ): TransactionResult {
    /**
     * @description unstake from well
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param well well object
     * @param stakedBkt Amount to stake
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::well::unstake`,
      typeArguments: [assetType],
      arguments: [
        tx.object(well),
        tx.pure(stakedBkt),
        tx.sharedObjectRef(CLOCK_OBJECT)
      ],
    });
  }

  forceUnstake(
    tx: TransactionBlock,
    assetType: string,
    well: string,
    bktTreasury: string,
    stakedBkt: string,
  ): TransactionResult {
    /**
     * @description forced unstake from well
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param well well object
     * @param stakedBkt Amount to stake
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::well::force_unstake`,
      typeArguments: [assetType],
      arguments: [
        tx.object(well),
        tx.object(bktTreasury),
        tx.pure(stakedBkt),
        tx.sharedObjectRef(CLOCK_OBJECT)
      ],
    });
  }

  claimFromWell(
    tx: TransactionBlock,
    assetType: string,
    well: string,
    stakedBkt: string,
  ): TransactionResult {
    /**
     * @description claim from well
     * @param assetType Asset , e.g "0x2::sui::SUI"
     * @param well well object
     * @param stakedBkt Staked BKT
     * @returns TransactionResult
     */

    return tx.moveCall({
      target: `${CORE_PACKAGE_ID}::well::claim`,
      typeArguments: [assetType],
      arguments: [
        tx.object(well),
        tx.pure(stakedBkt),
      ],
    });
  }

  updateSupraOracle(
    tx: TransactionBlock,
    token: string,
  ) {
    /**
     * @description update token price using supra oracle
     * @param assetType Asset , e.g "0x2::sui::SUI"
     */

    tx.moveCall({
      target: SWITCHBOARD_UPDATE_TARGET,
      typeArguments: [COINS_TYPE_LIST.SUI],
      arguments: [
        tx.sharedObjectRef(ORACLE_OBJECT),
        tx.sharedObjectRef(CLOCK_OBJECT),
        tx.object("0xbca474133638352ba83ccf7b5c931d50f764b09550e16612c9f70f1e21f3f594"),
      ],
    });

    if (token === "afSUI" || token === "AF_LP_SUI_SUI") {
      tx.moveCall({
        target: SUPRA_UPDATE_TARGET,
        typeArguments: [COINS_TYPE_LIST['SUI']],
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.sharedObjectRef(SUPRA_HANDLER_OBJECT),
          tx.pure(SUPRA_ID['SUI'] ?? "", "u32"),
        ],
      });
      // update afSUI price
      tx.moveCall({
        target: "0x2480d9a3ff2c821061df22c4365316f894c6fa686fbd03ba828fe7c5bef9ad22::afsui_rule::update_price",
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.object("0x2f8f6d5da7f13ea37daa397724280483ed062769813b6f31e9788e59cc88994d"),
          tx.object("0xeb685899830dd5837b47007809c76d91a098d52aabbf61e8ac467c59e5cc4610"),
          tx.sharedObjectRef(CLOCK_OBJECT),
        ],
      });
      if (token === "AF_LP_SUI_SUI") {
        // update afSUI/SUI LP price using afSUI and SUI price
        tx.moveCall({
          target: "0x928ff0be132d9bad7926008780d2a5adfefa1a24559a567dafbfd267d1b1b294::af_lp_rule::update_price",
          typeArguments: [
            "0x42d0b3476bc10d18732141a471d7ad3aa588a6fb4ba8e1a6608a4a7b78e171bf::af_lp::AF_LP",
            COINS_TYPE_LIST.SUI,
            COINS_TYPE_LIST.afSUI,
          ],
          arguments: [
            tx.sharedObjectRef(ORACLE_OBJECT),
            tx.object("0x97aae7a80abb29c9feabbe7075028550230401ffe7fb745757d3c28a30437408"),
            tx.sharedObjectRef(CLOCK_OBJECT),
          ],
        });
      }
    } else if (token === "vSUI") {
      tx.moveCall({
        target: SUPRA_UPDATE_TARGET,
        typeArguments: [COINS_TYPE_LIST['SUI']],
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.sharedObjectRef(SUPRA_HANDLER_OBJECT),
          tx.pure(SUPRA_ID['SUI'] ?? "", "u32"),
        ],
      });
      // update vSUI price
      tx.moveCall({
        target: "0x1caed1bf0cc4ca7357989b3a08e487078c6e60277512a8799347010e9ea92e8f::vsui_rule::update_price",
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.object("0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf"),
          tx.object("0x680cd26af32b2bde8d3361e804c53ec1d1cfe24c7f039eb7f549e8dfde389a60"),
          tx.sharedObjectRef(CLOCK_OBJECT),
        ],
      });
    } else if (token === "haSUI") {
      tx.moveCall({
        target: SUPRA_UPDATE_TARGET,
        typeArguments: [COINS_TYPE_LIST['SUI']],
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.sharedObjectRef(SUPRA_HANDLER_OBJECT),
          tx.pure(SUPRA_ID['SUI'] ?? "", "u32"),
        ],
      });
      // update haSUI price
      tx.moveCall({
        target: "0x4433ab096a71cbcdf70183f465e613955526f321039d9a76be0bd98c5da75382::hasui_rule::update_price",
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.object("0x47b224762220393057ebf4f70501b6e657c3e56684737568439a04f80849b2ca"),
          tx.sharedObjectRef(CLOCK_OBJECT),
        ],
      });
    } else {
      tx.moveCall({
        target: SUPRA_UPDATE_TARGET,
        typeArguments: [COINS_TYPE_LIST[token as COIN]],
        arguments: [
          tx.sharedObjectRef(ORACLE_OBJECT),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.sharedObjectRef(SUPRA_HANDLER_OBJECT),
          tx.pure(SUPRA_ID[token] ?? "", "u32"),
        ],
      });
    }
  }

  private async encodedBucketConstants(): Promise<DevInspectResults> {
    /**
     * @description Get encoded BCS Bucket values
     * @returns devInspectTransactionBlock
     */
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::fee_precision`,
    });
    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::liquidation_rebate`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::flash_loan_fee`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::buck_decimal`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::max_lock_time`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::min_lock_time`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::min_fee`,
    });

    tx.moveCall({
      target: `${CORE_PACKAGE_ID}::constants::max_fee`,
    });


    return await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: this.owner,
    });
  }

  async getBucketConstants(): Promise<BucketConstants | undefined> {
    /**
   * @description Get bucket constants (decoded BCS values)
   * @returns Promise<DecodedBucketConstants | undefined>
   */

    const results: any = await this.encodedBucketConstants();

    if (!results) {
      return undefined;
    }

    const bcs = new BCS(getSuiMoveConfig());

    const bucketObject = {
      feePrecision: bcs.de("u64", Uint8Array.from(results.results![0].returnValues[0][0])),
      liquidationRebate: bcs.de("u64", Uint8Array.from(results.results![1].returnValues[0][0])),
      flashLoanFee: bcs.de("u64", Uint8Array.from(results.results![2].returnValues[0][0])),
      buckDecimal: bcs.de("u8", Uint8Array.from(results.results![3].returnValues[0][0])),
      maxLockTime: bcs.de("u64", Uint8Array.from(results.results![4].returnValues[0][0])),
      minLockTime: bcs.de("u64", Uint8Array.from(results.results![5].returnValues[0][0])),
      minFee: bcs.de("u64", Uint8Array.from(results.results![6].returnValues[0][0])),
      maxFee: bcs.de("u64", Uint8Array.from(results.results![7].returnValues[0][0])),
    }

    return bucketObject

  }

  async getProtocol(): Promise<ProtocolInfo> {
    /**
     * @description Get protocol information including BUCK supply.
     * @returns Promise<ProtocolInfo>
     */

    const resp = (await this.client.getObject({
      id: PROTOCOL_ID,
      options: {
        showContent: true,
      },
    })) as any;

    const buckSupply = Number(
      resp.data?.content.fields.buck_treasury_cap.fields.total_supply.fields
        .value
    ) / 10 ** 9;

    return {
      buckSupply
    };
  }

  async getAllBottles(): Promise<PaginatedBottleSummary> {
    /**
     * @description Get all bottles by querying `BottleCreated` event.
     * @returns Promise<PaginatedBottleSummary> - otherwise `null` if the upstream data source is pruned.
     */

    const resp = await this.client.queryEvents({
      query: {
        MoveEventType: `${CORE_PACKAGE_ID}::bucket_events::BottleCreated`,
      },
    });
    const bottles = resp.data.map((event) => {
      const rawEvent = event.parsedJson as any;
      return {
        bottleId: rawEvent.bottle_id as string,
      };
    });

    return {
      data: bottles,
      nextCursor: resp.nextCursor,
      hasNextPage: resp.hasNextPage,
    };
  }

  async getDestroyedBottles(): Promise<PaginatedBottleSummary> {
    /**
     * @description Get all destroyed bottles by querying `BottleDestroyed` event.
     * @returns Promise<PaginatedBottleSummary> - otherwise `null` if the upstream data source is pruned.
     */

    const resp = await this.client.queryEvents({
      query: {
        MoveEventType: `${CORE_PACKAGE_ID}::bucket_events::BottleDestroyed`,
      },
    });
    const destroyedBottles = resp.data.map((event) => {
      const rawEvent = event.parsedJson as any;
      return {
        bottleId: rawEvent.bottle_id as string,
      };
    });

    return {
      data: destroyedBottles,
      nextCursor: resp.nextCursor,
      hasNextPage: resp.hasNextPage,
    };
  }

  async getAllBuckets(): Promise<BucketList> {
    /**
   * @description Get all buckets
   */
    let buckets: BucketList = {};

    try {
      const generalInfo = await this.client.getObject({
        id: PROTOCOL_ID,
        options: {
          showContent: true,
        }
      });
      const generalInfoField = generalInfo.data?.content as BucketProtocolResponse;
      const minBottleSize = generalInfoField.fields.min_bottle_size;

      let objectIds: string[] = [];
      let cursor: string | null = null;
      while (true) {
        const protocolFields = await this.client.getDynamicFields({
          parentId: PROTOCOL_ID,
          cursor,
        });

        objectIds = objectIds.concat(protocolFields.data.filter((item) =>
          item.objectType.includes("::bucket::Bucket")
          || item.objectType.includes("::pipe::Pipe")
        ).map(t => t.objectId));

        if (!protocolFields.hasNextPage) {
          break;
        }
        cursor = protocolFields.nextCursor;
      }

      const response: SuiObjectResponse[] = await this.client.multiGetObjects({
        ids: objectIds,
        options: {
          showContent: true,
          showType: true, //Check could we get type from response later
        },
      });

      response
        .filter(t => t.data?.type?.includes("::bucket::Bucket"))
        .map((res) => {
          const typeId = res.data?.type?.split("<").pop()?.replace(">", "") ?? "";
          const token = getCoinSymbol(typeId);
          if (!token) {
            return;
          }

          const fields = getObjectFields(res) as BucketResponse;

          const bucketInfo: BucketInfo = {
            token: token as COIN,
            baseFeeRate: Number(fields.base_fee_rate ?? 5_000),
            bottleTableSize: fields.bottle_table.fields.table.fields.size ?? "",
            bottleTableId: fields.bottle_table.fields.table.fields.id.id ?? "",
            collateralDecimal: fields.collateral_decimal ?? 0,
            collateralVault: fields.collateral_vault ?? "",
            latestRedemptionTime: Number(fields.latest_redemption_time ?? 0),
            minCollateralRatio: fields.min_collateral_ratio ?? "",
            mintedBuckAmount: fields.minted_buck_amount ?? "",
            minBottleSize: minBottleSize,
            maxMintAmount: fields.max_mint_amount ?? "",
            recoveryModeThreshold: fields.recovery_mode_threshold ?? "",
          };

          buckets[token] = bucketInfo;
        });

      // Add pipe ponds
      response
        .filter(t => t.data?.type?.includes("::pipe::Pipe"))
        .map((res) => {
          const typeId = res.data?.type?.split("<").pop()?.replace(">", "").split(", ")[0].trim() ?? "";
          const token = getCoinSymbol(typeId);
          if (!token) {
            return;
          }

          const bucket = buckets[token];
          if (bucket) {
            const fields = getObjectFields(res) as PipeResponse;
            const collateralVault = BigInt(bucket.collateralVault);
            const outputAmount = BigInt(fields.output_volume);
            bucket.collateralVault = (collateralVault + outputAmount).toString();
          }
        });
    } catch (error) {
      console.log(error);
    }

    return buckets;
  };

  async getAllTanks(): Promise<TankList> {
    /**
   * @description Get all tanks objects
   */

    const tankInfoList: TankList = {};

    try {
      let tankList: DynamicFieldInfo[] = [];
      let cursor: string | null = null;
      while (true) {
        const protocolFields = await this.client.getDynamicFields({
          parentId: PROTOCOL_ID,
          cursor,
        });

        tankList = tankList.concat(protocolFields.data.filter((item) =>
          item.objectType.includes("Tank")
        ));

        if (!protocolFields.hasNextPage) {
          break;
        }
        cursor = protocolFields.nextCursor;
      }

      const objectIdList = tankList.map((item) => item.objectId);

      const response: SuiObjectResponse[] = await this.client.multiGetObjects({
        ids: objectIdList,
        options: {
          showContent: true,
          showType: true, //Check could we get type from response later
        },
      });

      response.forEach((res) => {
        const fields = getObjectFields(res) as TankInfoResponse;

        let token = "";
        const objectType = res.data?.type;
        if (objectType) {
          const assetType = objectType.split(",")?.[1]?.trim().split(">")?.[0]?.trim();
          token = getCoinSymbol(assetType ?? "") ?? "";
        }

        const tankInfo: TankInfo = {
          buckReserve: fields?.reserve || "0",
          collateralPool: fields?.collateral_pool || "0",
          currentS: fields?.current_s || "0",
          currentP: fields?.current_p || "1",
        };

        tankInfoList[token as COIN] = tankInfo;
      });
    } catch (error) {
    }

    return tankInfoList;
  };

  async findInsertionPlace(
    bottleTableId: string,
    targetCR: number,
    tolerance: number,
  ): Promise<string> {
    /**
   * @description Find insertaion place in tolerance range
   */
    try {
      let cursor: string | null = null;

      while (true) {
        const bottlesResp = await this.client.getDynamicFields({
          parentId: bottleTableId,
          cursor,
        });

        const bottles = bottlesResp.data;
        const objectIdList = bottles.map((item) => item.objectId);

        const response: SuiObjectResponse[] = await this.client.multiGetObjects({
          ids: objectIdList,
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        for (const res of response) {
          const bottleInfo = getObjectFields(
            res
          ) as BottleInfoResponse;
          const bottleFields = bottleInfo.value.fields.value.fields;
          const cr = bottleFields.collateral_amount / bottleFields.buck_amount;
          if (cr > targetCR * (1 - (tolerance / 100))
            && cr < targetCR * (1 + (tolerance / 100))) {
            return bottleInfo.value.fields.next;
          }
        };

        if (!bottlesResp.hasNextPage) {
          break;
        }
        cursor = bottlesResp.nextCursor;
      }
    } catch (error) {
      console.log(error)
    }

    return "";
  };

  async getAllFountains(): Promise<FountainList> {
    /**
     * @description Get all fountains from KRIYA, CETUS, AFTERMATH, sBUCK
     * @returns Promise<FountainList>
     */

    const objectIds = [
      KRIYA_SUI_BUCK_LP_REGISTRY_ID,
      KRIYA_USDC_BUCK_LP_REGISTRY_ID,
      AF_SUI_BUCK_LP_REGISTRY_ID,
      AF_USDC_BUCK_LP_REGISTRY_ID,
      CETUS_SUI_BUCK_LP_REGISTRY_ID,
      CETUS_USDC_BUCK_LP_REGISTRY_ID,
      SBUCK_BUCK_LP_REGISTRY_ID,
    ];

    const fountainResults = await this.client.multiGetObjects({
      ids: objectIds,
      options: {
        showContent: true,
      }
    });

    const fountains: FountainList = {};
    fountainResults.map((res) => {
      const fountain = objectToFountain(res);
      fountains[fountain.id] = fountain;
    });

    return fountains;
  }

  async getFountain(lpRegistryId: string): Promise<FountainInfo> {
    /**
     * @description Get fountain information from id
     * @param lpRegistryId Fountain lp registry id
     * @returns Promise<FountainInfo>
     */
    const res = await this.client.getObject({
      id: lpRegistryId,
      options: {
        showContent: true,
      }
    });

    return objectToFountain(res);
  }

  async getAllPsms(): Promise<PsmList> {
    /**
   * @description Get all PSM's information
   */
    let psmList: PsmList = {};

    try {
      const objectIdList = Object.values(PSM_POOL_IDS);
      const response: SuiObjectResponse[] = await this.client.multiGetObjects({
        ids: objectIdList,
        options: {
          showContent: true,
          showType: true, //Check could we get type from response later
        },
      });

      response.map((res) => {
        const psm = objectToPsm(res);
        const coin = Object.keys(PSM_POOL_IDS).find(symbol => PSM_POOL_IDS[symbol as COIN] == psm.id);
        if (coin) {
          psmList[coin] = psm;
        }
      });
    } catch (error) {
      console.log(error);
    }

    return psmList;
  };

  async getPsm(coin: COIN): Promise<PsmInfo> {
    /**
     * @description Get psm information from id
     * @param poolId PSM pool id
     * @returns Promise<PsmInfo>
     */
    const poolId = PSM_POOL_IDS[coin];
    if (!poolId) {
      throw Error("Not PSM supported token");
    }

    const response: SuiObjectResponse = await this.client.getObject({
      id: poolId,
      options: {
        showContent: true,
        showType: true, //Check could we get type from response later
      },
    });

    return objectToPsm(response);
  }

  async getAllStrapFountains(): Promise<StrapFountainList> {
    /**
     * @description Get all stake proof list from afSUI, haSUI, vSUI fountains
     * @returns Promise<StrapFountainList>
     */

    const fountainIds = Object.keys(STRAP_FOUNTAIN_IDS);
    const objectIdList = Object.values(STRAP_FOUNTAIN_IDS).map(t => t.objectId);
    const response: SuiObjectResponse[] = await this.client.multiGetObjects({
      ids: objectIdList,
      options: {
        showContent: true,
        showType: true, //Check could we get type from response later
      },
    });

    const fountains: StrapFountainList = {};
    for (let idx = 0; idx < response.length; idx++) {
      const fountain = objectToStrapFountain(response[idx]);
      const coin = fountainIds[idx];
      fountains[coin] = fountain;
    }

    return fountains;
  }

  async getStakeProofFountain(fountainId: string): Promise<StrapFountainInfo> {
    /**
     * @description Get fountain information from id
     * @param lpRegistryId Fountain lp registry id
     * @returns Promise<StrapFountainInfo>
     */
    const res = await this.client.getObject({
      id: fountainId,
      options: {
        showContent: true,
      }
    });

    return objectToStrapFountain(res);
  }

  async getUserBottles(address: string): Promise<UserBottleInfo[]> {
    /**
     * @description Get positions array for input address
     * @address User address that belong to bottle
     * @returns Promise<BottleInfo>
     */
    if (!address) return [];

    try {
      let bucketList: DynamicFieldInfo[] = [];
      let cursor: string | null = null;
      while (true) {
        const protocolFields = await this.client.getDynamicFields({
          parentId: PROTOCOL_ID,
          cursor,
        });

        bucketList = bucketList.concat(protocolFields.data.filter((item) =>
          item.objectType.includes("Bucket")
        ));

        if (!protocolFields.hasNextPage) {
          break;
        }
        cursor = protocolFields.nextCursor;
      }

      const objectTypeList = bucketList.map((item) => item.objectType);
      const objectIdList = bucketList.map((item) => item.objectId);
      const objectNameList = getObjectNames(objectTypeList);

      const response: SuiObjectResponse[] = await this.client.multiGetObjects({
        ids: objectIdList,
        options: {
          showContent: true,
          showType: true, //Check could we get type from response later
        },
      });

      const bottleIdList: {
        name: string;
        id: string;
        surplus_id: string;
      }[] = [];

      response.map((res, index) => {
        //Filter out WBTC, when we launch WBTC we need to remove this exception
        if (objectNameList[index] === "WBTC")
          return;

        const bucketFields = getObjectFields(res) as BucketResponse;

        bottleIdList.push({
          name: objectNameList[index] ?? "",
          id: bucketFields.bottle_table.fields.table.fields.id.id,
          surplus_id: bucketFields.surplus_bottle_table.fields.id.id,
        });
      });

      const userBottles: UserBottleInfo[] = [];

      // Get strapIds for user address
      const { data: strapObjects } = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: STRAP_ID,
        },
        options: {
          showContent: true,
          showType: true,
        }
      });
      let strapIds = strapObjects.map(strapObj => {
        let obj = getObjectFields(strapObj);
        return {
          id: obj?.id.id,
          type: strapObj.data?.type,
          strap_address: obj?.id.id,
        }
      });

      // Get stakeProofIds for user address
      const { data: stakeProofs } = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: STAKE_PROOF_ID,
        },
        options: {
          showContent: true,
          showType: true,
        }
      });
      strapIds = strapIds.concat(stakeProofs.map(strapObj => {
        let obj = getObjectFields(strapObj);
        return {
          id: obj?.id.id,
          type: strapObj.data?.type,
          strap_address: obj?.strap_address,
        }
      }));

      // Loop bottles
      for (const bottle of bottleIdList) {
        const token = bottle.name as COIN;
        const bottleStrapIds = strapIds.filter(t => t.type?.includes(`<${COINS_TYPE_LIST[token]}`));
        const addresses = [address, ...bottleStrapIds.map(t => t.strap_address)];

        let startUnit = 0;
        let debtAmount = 0;

        if (bottleStrapIds.length > 0) {
          if ((token == "afSUI"
            || token == "vSUI"
            || token == "haSUI")
            && STRAP_FOUNTAIN_IDS[token]) {
            try {
              let lstFountain = await this.getStakeProofFountain(STRAP_FOUNTAIN_IDS[token]?.objectId as string);
              const data = await this.client
                .getDynamicFieldObject({
                  parentId: lstFountain.strapId,
                  name: {
                    type: "address",
                    value: bottleStrapIds[0]?.strap_address,
                  },
                });
              const ret = getObjectFields(data);

              debtAmount = Number(ret?.value.fields.debt_amount ?? 0);
              startUnit = Number(ret?.value.fields.start_unit ?? 0);
            }
            catch {

            }
          }
        }

        for (const _address of addresses) {
          await this.client
            .getDynamicFieldObject({
              parentId: bottle.id ?? "",
              name: {
                type: "address",
                value: _address,
              },
            })
            .then(async (bottleInfo) => {
              const bottleInfoFields = getObjectFields(
                bottleInfo
              ) as BottleInfoResponse;

              if (bottleInfoFields) {
                userBottles.push({
                  token,
                  collateralAmount:
                    bottleInfoFields.value.fields.value.fields.collateral_amount,
                  buckAmount:
                    bottleInfoFields.value.fields.value.fields.buck_amount,
                  strapId: bottleStrapIds.find(t => t.strap_address == _address)?.id,
                  startUnit,
                  debtAmount,
                });
              }
              else {
                const surplusBottleInfo = await this.client.getDynamicFieldObject({
                  parentId: bottle.surplus_id,
                  name: {
                    type: "address",
                    value: _address,
                  }
                });

                const surplusBottleFields = getObjectFields(surplusBottleInfo);
                const collateralAmount = surplusBottleFields?.value.fields.collateral_amount ?? 0;
                if (collateralAmount) {
                  userBottles.push({
                    token,
                    collateralAmount,
                    buckAmount: 0,
                    strapId: bottleStrapIds.find(t => t.strap_address == _address)?.id,
                  });
                }
              }
            })
            .catch((error) => {
              console.log("error", error);
            });
        }

        // We can add liquidated positions
        let liquidatedStraps = bottleStrapIds.filter(t => !userBottles.find(u => u.strapId == t.id));
        for (const strap of liquidatedStraps) {
          userBottles.push({
            token,
            collateralAmount: 0,
            buckAmount: 0,
            strapId: strap.id,
          });
        }
      }

      // Sort liquidated positions to last
      userBottles.sort((a, b) => b.collateralAmount - a.collateralAmount);

      return userBottles;
    } catch (error) {
      return [];
    }
  };

  async getUserTanks(address: string): Promise<UserTankList> {
    /**
     * @description Get tanks array for input address
     * @address User address that belong to bottle
     * @returns Promise<TankInfo>
     */
    if (!address) return {};

    let userTanks: UserTankList = {};

    try {
      let tankList: DynamicFieldInfo[] = [];
      let cursor: string | null = null;
      while (true) {
        const protocolFields = await this.client.getDynamicFields({
          parentId: PROTOCOL_ID,
          cursor,
        });

        tankList = tankList.concat(protocolFields.data.filter((item) =>
          item.objectType.includes("Tank")
        ));

        if (!protocolFields.hasNextPage) {
          break;
        }
        cursor = protocolFields.nextCursor;
      }

      // Split coin type from result
      const tankTypes = tankList.map(tank => {
        const tankType = tank.objectType;
        const splitTypeString = tankType.split("<").pop();
        if (!splitTypeString) return;

        const coinType = splitTypeString.replace(">", "").split(",").pop();
        if (!coinType) return;

        return coinType.trim();
      });

      // Build contributor token filter
      const filters = tankTypes.map(tankType => {
        return {
          StructType: `${CONTRIBUTOR_TOKEN_ID}::tank::ContributorToken<${CONTRIBUTOR_TOKEN_ID}::buck::BUCK, ${tankType}>`
        }
      });

      // Get contributor token accounts for user address
      const { data: contributorTokens } = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          MatchAny: filters
        },
        options: {
          showContent: true,
        }
      });

      for (const tankType of tankTypes) {

        if (!tankType) {
          continue;
        }

        const token = getCoinSymbol(tankType);
        if (!token) {
          continue;
        }

        // Filter contributor tokens by selected tank
        const tokens = contributorTokens.filter(x => {
          if (x.data?.content?.dataType == 'moveObject') {
            const typeId = x.data.content.type;
            return typeId.endsWith(tankType + ">");
          }

          return false;
        })

        const totalBUCK = await this.getUserTankBUCK(tankType, tokens);
        const totalEarned = await this.getUserTankEarn(tankType, tokens);
        userTanks[token] = {
          totalBUCK,
          totalEarned,
        };
      }
    } catch (error) {
    }

    return userTanks;
  };

  async getUserTankBUCK(tankType: string, tokens: SuiObjectResponse[]) {
    if (tokens.length == 0) {
      return 0;
    }

    const tx = new TransactionBlock();

    const tank = tx.moveCall({
      target: `${CORE_PACKAGE_ID}::buck::borrow_tank` as `${string}::${string}::${string}`,
      typeArguments: [tankType],
      arguments: [tx.sharedObjectRef(PROTOCOL_OBJECT)],
    });

    const target =
      `${CORE_PACKAGE_ID}::tank::get_token_weight` as `${string}::${string}::${string}`;
    for (const token of tokens) {
      if (!token.data) {
        continue;
      }

      tx.moveCall({
        target: target,
        typeArguments: [COINS_TYPE_LIST.BUCK, tankType],
        arguments: [tank, tx.objectRef({
          objectId: token.data.objectId,
          digest: token.data.digest,
          version: token.data.version,
        })],
      });
    }

    const res = await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: PROTOCOL_ID,
    });

    const resultArray = res?.results?.slice(1);

    if (resultArray?.length === 0) return 0;

    const bytesArray = resultArray?.map((result) => {
      if (result?.returnValues === undefined) return [0];
      if (result?.returnValues[0] === undefined) return [0];
      return result?.returnValues[0][0];
    });

    if (!bytesArray) return 0;

    let total = 0;
    bytesArray.forEach((bytes) => {
      const u64 = U64FromBytes(bytes);
      total += Number(formatUnits(u64, 9)); //BUCK decimals
    });

    return total;
  }

  async getUserTankEarn(tankType: string, tokens: SuiObjectResponse[]) {
    if (tokens.length == 0) {
      return 0;
    }

    const token = getCoinSymbol(tankType);
    if (!token) {
      return 0;
    }

    const tx = new TransactionBlock();

    const tank = tx.moveCall({
      target: `${CORE_PACKAGE_ID}::buck::borrow_tank` as `${string}::${string}::${string}`,
      typeArguments: [tankType],
      arguments: [tx.sharedObjectRef(PROTOCOL_OBJECT)],
    });

    const target =
      `${CORE_PACKAGE_ID}::tank::get_collateral_reward_amount` as `${string}::${string}::${string}`;
    for (const token of tokens) {
      if (!token.data) {
        continue;
      }

      tx.moveCall({
        target: target,
        typeArguments: [COINS_TYPE_LIST.BUCK, tankType],
        arguments: [tank, tx.objectRef({
          objectId: token.data.objectId,
          digest: token.data.digest,
          version: token.data.version,
        })],
      });
    }

    const res = await this.client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: PROTOCOL_ID,
    });

    const resultArray = res?.results?.slice(1);

    if (resultArray?.length === 0) return 0;

    const bytesArray = resultArray?.map((result) => {
      if (result?.returnValues === undefined) return [0];
      if (result?.returnValues[0] === undefined) return [0];
      return result?.returnValues[0][0];
    });

    if (!bytesArray) return 0;

    let total = 0;
    bytesArray.forEach((bytes) => {
      const u64 = U64FromBytes(bytes);
      total += Number(formatUnits(u64, COIN_DECIMALS[token as COIN] ?? 9));
    });

    return total;
  }

  async getUserLpProofs(
    owner: string
  ): Promise<UserLpList> {
    /**
     * @description Get all LP proofs from KRIYA, CETUS, AFTERMATHs
     * @param owner User address
     * @returns Promise<UserLpList>
     */
    const lpRegistryIds = [
      AF_USDC_BUCK_LP_REGISTRY_ID,
      AF_SUI_BUCK_LP_REGISTRY_ID,
      CETUS_USDC_BUCK_LP_REGISTRY_ID,
      CETUS_SUI_BUCK_LP_REGISTRY_ID,
      KRIYA_USDC_BUCK_LP_REGISTRY_ID,
      KRIYA_SUI_BUCK_LP_REGISTRY_ID,
      SBUCK_BUCK_LP_REGISTRY_ID,
    ];

    const res = await this.client.getOwnedObjects({
      owner,
      filter: {
        MatchAny: [
          {
            Package: FOUNTAIN_PACKAGE_ID,
          },
          {
            Package: KRIYA_FOUNTAIN_PACKAGE_ID,
          },
          {
            Package: SBUCK_FOUNTAIN_PACKAGE_ID,
          }
        ]
      },
      options: {
        showContent: true,
        showType: true,
      },
    });
    const proofs: UserLpProof[] = res.data.map((object) => {
      const fields = getObjectFields(object);
      return {
        objectId: object.data?.objectId ?? "",
        version: object.data?.version ?? "",
        digest: object.data?.digest ?? "",
        typeName: object.data?.type ?? "",
        fountainId: fields?.fountain_id ?? "",
        startUnit: Number(fields?.start_uint ?? 0),
        stakeAmount: Number(fields?.stake_amount ?? 0),
        stakeWeight: Number(fields?.stake_weight ?? 0),
        lockUntil: Number(fields?.lock_until ?? 0),
      }
    });

    const userLpList: UserLpList = {};
    for (const lpRegistryId of lpRegistryIds) {
      userLpList[lpRegistryId] = proofs.filter((proof) => lpRegistryId === proof.fountainId);
    }

    return userLpList;
  }

  async getPrices() {
    /**
     * @description Get all prices
    */
    const ids = Object.values(SUPRA_PRICE_FEEDS).concat(SBUCK_FLASK_OBJECT_ID);
    const objectNameList = Object.keys(SUPRA_PRICE_FEEDS);
    const priceObjects: SuiObjectResponse[] = await this.client.multiGetObjects({
      ids,
      options: {
        showContent: true,
        showType: true, //Check could we get type from response later
      },
    });

    const prices: {
      [key: string]: number
    } = {
      WETH: 1,
      SUI: 1,
      vSUI: 1,
      afSUI: 1,
      haSUI: 1,
      USDC: 1,
      USDT: 1,
      USDY: 1,
      BUCK: 1,
      sBUCK: 1,
      BUCKETUS: 1,
      CETABLE: 1,
      STAPEARL: 1,
    };

    priceObjects.map((res, index) => {

      const objectId = res.data?.objectId;
      if (objectId == SBUCK_FLASK_OBJECT_ID) {
        const priceFeed = getObjectFields(res) as SBUCKFlaskResponse;
        const reserves = priceFeed.reserves;
        const sBuckSupply = priceFeed.sbuck_supply.fields.value;
        const price = Number(reserves) / Number(sBuckSupply);
        prices['sBUCK'] = price;
      }
      else {
        const priceFeed = getObjectFields(res) as SupraPriceFeedResponse;
        const priceBn = priceFeed.value.fields.value;
        const decimals = priceFeed.value.fields.decimal;
        const price = parseInt(priceBn) / Math.pow(10, decimals);

        if (objectNameList[index] == 'usdc_usd') {
          prices['USDC'] = price;
        }
        else if (objectNameList[index] == 'usdt_usd') {
          prices['USDT'] = price;
        }
        else if (objectNameList[index] == 'usdy_usd') {
          prices['USDY'] = price;
        }
        else if (objectNameList[index] == 'navx_usd') {
          prices['NAVX'] = price;
        }
        else if (objectNameList[index] == 'cetus_usd') {
          prices['CETUS'] = price;
        }
        else if (objectNameList[index] == 'eth_usdt') {
          prices['WETH'] = (prices['USDT'] ?? 1) * price;
        }
        else if (objectNameList[index] == 'sui_usdt') {
          prices['SUI'] = (prices['USDT'] ?? 1) * price;
        }
        else if (objectNameList[index] == 'vsui_sui') {
          prices['vSUI'] = (prices['SUI'] ?? 1) * price;
        }
        else if (objectNameList[index] == 'hasui_sui') {
          prices['haSUI'] = (prices['SUI'] ?? 1) * price;
        }
        else if (objectNameList[index] == 'afsui_sui') {
          prices['afSUI'] = (prices['SUI'] ?? 1) * price;
        }
      }

    });

    return prices;
  }

  async getBorrowTx(
    tx: TransactionBlock,
    collateralType: string,
    collateralAmount: number,
    borrowAmount: number,
    recipient: string,
    isUpdateOracle: boolean,
    insertionPlace?: string,
    strapId?: string,
  ): Promise<boolean> {
    /**
     * @description Borrow
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param collateralAmount
     * @param borrowAmount
     * @param recipient
     * @param isNewBottle
     * @param isUpdateOracle
     * @param insertionPlace Optional
     * @returns Promise<boolean>
     */

    const token = getCoinSymbol(collateralType);
    if (!token) {
      return false;
    }

    let collateralInput = await getInputCoins(tx, this.client, recipient, collateralType, collateralAmount);

    const collateralBalance = coinIntoBalance(tx, collateralType, collateralInput);

    if (borrowAmount == 0) {
      this.topUp(tx, collateralType, collateralBalance, strapId ? strapId : recipient, insertionPlace ? insertionPlace : recipient);
    } else {
      if (isUpdateOracle) {
        this.updateSupraOracle(tx, token);
      }

      const borrowRet = this.borrow(
        tx,
        collateralType,
        collateralBalance,
        tx.pure(borrowAmount, "u64"),
        insertionPlace ? insertionPlace : (strapId ? (strapId === "new" ? undefined : strapId) : recipient),
        strapId,
      );
      if (borrowRet) {
        if (strapId === 'new') {
          const [strap, buckOut] = borrowRet;
          if (strap && buckOut) {
            const buckCoinBalance = coinFromBalance(tx, COINS_TYPE_LIST.BUCK, buckOut);
            tx.transferObjects([buckCoinBalance], tx.pure(recipient, "address"));
            tx.transferObjects([strap], tx.pure(recipient, "address"));
          }
        }
        else {
          const buckCoinBalance = coinFromBalance(tx, COINS_TYPE_LIST.BUCK, borrowRet);
          tx.transferObjects([buckCoinBalance], tx.pure(recipient, "address"));
        }
      }
    };

    return true;
  }

  async getRepayTx(
    tx: TransactionBlock,
    collateralType: string,
    repayAmount: number,
    withdrawAmount: number,
    walletAddress: string,
    insertionPlace?: string,
    strapId?: string,
  ): Promise<boolean> {
    /**
     * @description Repay
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param repayAmount
     * @param withdrawAmount
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const token = getCoinSymbol(collateralType);
    if (!token) {
      return false;
    }

    let _buckCoinInput;
    if (repayAmount > 0) {
      [_buckCoinInput] = await getInputCoins(tx, this.client, walletAddress, COINS_TYPE_LIST.BUCK, repayAmount);
    }
    else {
      _buckCoinInput = await getMainCoin(tx, this.client, walletAddress, COINS_TYPE_LIST.BUCK);
    }

    const buckCoinInput = _buckCoinInput ?? tx.moveCall({
      target: "0x2::coin::zero",
      typeArguments: [COINS_TYPE_LIST.BUCK],
    });

    this.updateSupraOracle(tx, token);

    // Fully repay
    if (repayAmount == 0 && withdrawAmount == 0) {
      if (strapId) {
        const strap = tx.object(strapId);
        tx.moveCall({
          target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::fully_repay_with_strap`,
          typeArguments: [collateralType],
          arguments: [
            tx.sharedObjectRef(PROTOCOL_OBJECT),
            strap,
            buckCoinInput,
            tx.sharedObjectRef(CLOCK_OBJECT),
          ],
        });
        // tx.moveCall({
        //   target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::destroy_empty_strap`,
        //   typeArguments: [collateralType],
        //   arguments: [
        //     tx.sharedObjectRef(PROTOCOL_OBJECT),
        //     strap,
        //   ]
        // });
      }
      else {
        tx.moveCall({
          target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::fully_repay`,
          typeArguments: [collateralType],
          arguments: [
            tx.sharedObjectRef(PROTOCOL_OBJECT),
            buckCoinInput,
            tx.sharedObjectRef(CLOCK_OBJECT),
          ],
        });
      }
    }
    else {
      if (strapId) {
        tx.moveCall({
          target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::repay_and_withdraw_with_strap`,
          typeArguments: [collateralType],
          arguments: [
            tx.sharedObjectRef(PROTOCOL_OBJECT),
            tx.sharedObjectRef(ORACLE_OBJECT),
            tx.object(strapId),
            tx.sharedObjectRef(CLOCK_OBJECT),
            buckCoinInput,
            tx.pure(withdrawAmount, "u64"),
            tx.pure([insertionPlace ? insertionPlace : strapId]),
          ],
        });
      }
      else {
        tx.moveCall({
          target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::repay_and_withdraw`,
          typeArguments: [collateralType],
          arguments: [
            tx.sharedObjectRef(PROTOCOL_OBJECT),
            tx.sharedObjectRef(ORACLE_OBJECT),
            tx.sharedObjectRef(CLOCK_OBJECT),
            buckCoinInput,
            tx.pure(withdrawAmount, "u64"),
            tx.pure([insertionPlace ? insertionPlace : walletAddress]),
          ],
        });
      }
    }

    return true;
  }
  async getSurplusWithdrawTx(
    tx: TransactionBlock,
    collateralType: string,
    walletAddress: string,
    strapId?: string,
  ): Promise<TransactionBlock> {
    /**
     * @description Withdraw
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param walletAddress
     * @param strapId Optional
     * @returns Promise<TransactionBlock>
     */

    const token = getCoinSymbol(collateralType);
    if (!token) {
      return tx;
    }

    if (strapId) {
      const strap = tx.object(strapId);
      const surplusCollateral = tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::withdraw_surplus_with_strap`,
        typeArguments: [collateralType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          strap,
        ],
      });
      tx.moveCall({
        target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::destroy_empty_strap`,
        typeArguments: [collateralType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          strap,
        ]
      });
      const surplusCoin = coinFromBalance(tx, collateralType, surplusCollateral);
      tx.transferObjects([surplusCoin], tx.pure(walletAddress, "address"));
    } else {
      const surplusCollateral = tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::withdraw_surplus_collateral`,
        typeArguments: [collateralType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
        ],
      });
      const surplusCoin = coinFromBalance(tx, collateralType, surplusCollateral);
      tx.transferObjects([surplusCoin], tx.pure(walletAddress, "address"));
    }

    return tx;
  }

  psmSwapIn(
    tx: TransactionBlock,
    coinType: string,
    coinInput: TransactionArgument,
    referrer?: string,
  ): TransactionResult {
    /**
     * @description Get transaction for PSM
     * @param coinType T e.g USDC coin type
     * @param coinInput Coin<T>
     * @param referrer referrer get 50% rebate
     * @returns Coin<BUCK>
     */
    const balanceInput = coinIntoBalance(tx, coinType, coinInput);
    const balanceOut = tx.moveCall({
      target: `${CORE_PACKAGE_ID}::buck::charge_reservoir`,
      typeArguments: [coinType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        balanceInput
      ],
    });
    const coinOut = coinFromBalance(tx, COINS_TYPE_LIST.BUCK, balanceOut);
    const coinOutValue = tx.moveCall({
      target: "0x2::coin::value",
      typeArguments: [COINS_TYPE_LIST.BUCK],
      arguments: [coinOut],
    });
    const referralRebateAmount = tx.moveCall({
      target: "0x00db9a10bb9536ab367b7d1ffa404c1d6c55f009076df1139dc108dd86608bbe::math::mul_factor",
      arguments: [coinOutValue, tx.pure.u64(5), tx.pure(9995)],
    });
    const referralRebate = tx.splitCoins(coinOut, [referralRebateAmount]);
    tx.transferObjects([referralRebate], tx.pure.address(referrer ?? "0x8fb41c0caf9fa1205a854806edf5f3f16023e7ddbb013c717b50ce7e539dc038"));
    return coinOut;
  }

  async getPsmTx(
    tx: TransactionBlock,
    psmCoin: string,
    psmAmount: number,
    psmSwitch: boolean,
    walletAddress: string,
    referrer?: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for PSM
     * @param psmCoin Asset , e.g "0x2::sui::SUI"
     * @param psmAmount
     * @param psmSwitch BUCK -> stablecoin or not
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const inputCoinType = psmSwitch ? COINS_TYPE_LIST.BUCK : psmCoin;
    const [inputCoin] = await getInputCoins(tx, this.client, walletAddress, inputCoinType, psmAmount);
    const outCoinType = psmSwitch ? psmCoin : COINS_TYPE_LIST.BUCK;

    if (psmSwitch) {
      const inputCoinBalance = coinIntoBalance(tx, inputCoinType, inputCoin);
      const outBalance = tx.moveCall({
        target: `${CORE_PACKAGE_ID}::buck::discharge_reservoir`,
        typeArguments: [outCoinType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          inputCoinBalance
        ],
      });

      const coinOut = coinFromBalance(tx, outCoinType, outBalance);
      tx.transferObjects([coinOut], tx.pure(walletAddress, "address"));
    }
    else {
      if (inputCoin) {
        const coinOut = this.psmSwapIn(tx, inputCoinType, inputCoin, referrer);
        tx.transferObjects([coinOut], tx.pure.address(walletAddress));
      }
      else {
        return false;
      }
    }

    return true;
  }

  async getRedeemTx(
    tx: TransactionBlock,
    collateralType: string,
    redeemAmount: number,
    walletAddress: string,
    insertionPlace?: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for Redeem
     * @param collateralType Asset , e.g "0x2::sui::SUI"
     * @param redeemAmount
     * @param walletAddress
     * @param insertionPlace  Optional
     * @returns Promise<boolean>
     */

    const token = getCoinSymbol(collateralType) ?? "";
    const [buckCoinInput] = await getInputCoins(tx, this.client, walletAddress, COINS_TYPE_LIST.BUCK, redeemAmount);
    if (!buckCoinInput) return false;

    this.updateSupraOracle(tx, token);

    tx.moveCall({
      target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::redeem`,
      typeArguments: [collateralType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        tx.sharedObjectRef(ORACLE_OBJECT),
        tx.sharedObjectRef(CLOCK_OBJECT),
        buckCoinInput,
        tx.pure(insertionPlace ? [insertionPlace] : []),
      ],
    });

    return true;
  }

  async getTankDepositTx(
    tx: TransactionBlock,
    tankType: string,
    depositAmount: number,
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for deposit token to tank
     * @param tankType Asset , e.g "0x2::sui::SUI"
     * @param depositAmount
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const [buckCoinInput] = await getInputCoins(tx, this.client, walletAddress, COINS_TYPE_LIST.BUCK, depositAmount);
    if (!buckCoinInput) return false;

    tx.moveCall({
      target: `${BUCKET_OPERATIONS_PACKAGE_ID}::tank_operations::deposit`,
      typeArguments: [tankType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        buckCoinInput
      ],
    });

    return true;
  }

  async getTankWithdrawTx(
    tx: TransactionBlock,
    tankType: string,
    withdrawAmount: number,
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for withdraw token from tank
     * @param tankType Asset , e.g "0x2::sui::SUI"
     * @param withdrawAmount
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const token = getCoinSymbol(tankType);
    if (!token) {
      return false;
    }

    const { data: contributorTokens } = await this.client.getOwnedObjects({
      owner: walletAddress,
      filter: {
        StructType: `${CONTRIBUTOR_TOKEN_ID}::tank::ContributorToken<${CONTRIBUTOR_TOKEN_ID}::buck::BUCK, ${tankType}>`
      },
      options: {
        showContent: true,
      },
    });
    const tokens = contributorTokens.map((token) =>
      tx.objectRef({
        objectId: token.data?.objectId ?? "",
        digest: token.data?.digest ?? "",
        version: token.data?.version ?? "",
      })
    );
    const tokenObjs = tx.makeMoveVec({
      objects: tokens,
    });

    this.updateSupraOracle(tx, token);

    tx.moveCall({
      target: `${BUCKET_OPERATIONS_PACKAGE_ID}::tank_operations::withdraw`,
      typeArguments: [tankType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        tx.sharedObjectRef(ORACLE_OBJECT),
        tx.sharedObjectRef(CLOCK_OBJECT),
        tx.sharedObjectRef(TREASURY_OBJECT),
        tokenObjs,
        tx.pure(parseBigInt(`${withdrawAmount ?? 0}`, 9), "u64"),
      ],
    });

    return true;
  }

  async getTankClaimTx(
    tx: TransactionBlock,
    tankType: string,
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for claim token from tank
     * @param tankType Asset , e.g "0x2::sui::SUI"
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const token = getCoinSymbol(tankType);
    if (!token) {
      return false;
    }

    const { data: contributorTokens } = await this.client.getOwnedObjects({
      owner: walletAddress,
      filter: {
        StructType: `${CONTRIBUTOR_TOKEN_ID}::tank::ContributorToken<${CONTRIBUTOR_TOKEN_ID}::buck::BUCK, ${tankType}>`
      },
      options: {
        showContent: true,
      },
    });
    const tokens = contributorTokens.map((token) =>
      tx.objectRef({
        objectId: token.data?.objectId ?? "",
        digest: token.data?.digest ?? "",
        version: token.data?.version ?? "",
      })
    );
    if (!tokens || tokens.length === 0) return false;

    for (const token of tokens) {
      tx.moveCall({
        target: `${BUCKET_OPERATIONS_PACKAGE_ID}::tank_operations::claim`,
        typeArguments: [tankType],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.sharedObjectRef(TREASURY_OBJECT),
          token,
        ],
      });
    }

    return true;
  }

  async getStakeUsdcTx(
    tx: TransactionBlock,
    isAf: boolean,
    stakeAmount: number,
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for stake token to pool
     * @param isAf Boolean value for Aftermath or not
     * @param stakeAmount
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const [stakeCoinInput] = await getInputCoins(tx, this.client, walletAddress, COINS_TYPE_LIST.USDC, stakeAmount);
    if (!stakeCoinInput) return false;

    if (isAf) {
      tx.moveCall({
        target: `${FOUNTAIN_PERIHERY_PACKAGE_ID}::aftermath_fountain::stake`,
        typeArguments: [COINS_TYPE_LIST.AF_LP_USDC_BUCK, COINS_TYPE_LIST.USDC],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.object(AF_OBJS.pool),
          tx.object(AF_OBJS.poolRegistry),
          tx.object(AF_OBJS.protocolFeeVault),
          tx.object(AF_OBJS.treasury),
          tx.object(AF_OBJS.insuranceFund),
          tx.object(AF_OBJS.referralVault),
          tx.sharedObjectRef(AF_USDC_BUCK_LP_REGISTRY),
          tx.sharedObjectRef(CLOCK_OBJECT),
          stakeCoinInput,
          tx.pure(walletAddress, "address"),
        ]
      });
    }
    else {
      tx.moveCall({
        target: `${FOUNTAIN_PERIHERY_PACKAGE_ID}::cetus_fountain::stake`,
        typeArguments: [COINS_TYPE_LIST.USDC],
        arguments: [
          tx.sharedObjectRef(PROTOCOL_OBJECT),
          tx.sharedObjectRef(CETUS_USDC_BUCK_LP_REGISTRY),
          tx.sharedObjectRef(BUCKETUS_TREASURY),
          tx.sharedObjectRef(BUCKETUS_LP_VAULT_05),
          tx.object(CETUS_OBJS.globalConfig),
          tx.object(CETUS_OBJS.buckUsdcPool),
          tx.sharedObjectRef(CLOCK_OBJECT),
          stakeCoinInput,
          tx.pure(walletAddress, "address"),
        ]
      });
    }

    return true;
  }

  async getAfUnstakeTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProof: UserLpProof,
    recipient: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for unstake token from AF pool
     * @param fountainId
     * @param lpProof UserLpProof object
     * @param recipient Recipient address
     * @returns Promise<boolean>
     */

    const [stakeType, rewardType] = proofTypeToCoinType(lpProof.typeName);

    const [afLpBalance, rewardBalance] = tx.moveCall({
      target: "0x02139a2e2ccb61caf776b76fbcef883bdfa6d2cbe0c2f1115a16cb8422b44da2::fountain_core::force_unstake",
      typeArguments: [stakeType, rewardType],
      arguments: [
        tx.sharedObjectRef(CLOCK_OBJECT),
        tx.object(fountainId),
        tx.objectRef(lpProofToObject(lpProof)),
      ]
    });
    const afLpCoin = coinFromBalance(tx, COINS_TYPE_LIST.AF_LP_USDC_BUCK, afLpBalance);
    const rewardCoin = coinFromBalance(tx, COINS_TYPE_LIST.SUI, rewardBalance);
    const [buckCoin, usdcCoin] = tx.moveCall({
      target: "0xefe170ec0be4d762196bedecd7a065816576198a6527c99282a2551aaa7da38c::withdraw::all_coin_withdraw_2_coins",
      typeArguments: [COINS_TYPE_LIST.AF_LP_USDC_BUCK, COINS_TYPE_LIST.BUCK, COINS_TYPE_LIST.USDC],
      arguments: [
        tx.object(AF_OBJS.pool),
        tx.object(AF_OBJS.poolRegistry),
        tx.object(AF_OBJS.protocolFeeVault),
        tx.object(AF_OBJS.treasury),
        tx.object(AF_OBJS.insuranceFund),
        tx.object(AF_OBJS.referralVault),
        afLpCoin,
      ],
    });

    tx.transferObjects([buckCoin, usdcCoin, rewardCoin], tx.pure(recipient, "address"));

    return true;
  }

  async getKriyaUnstakeTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProof: UserLpProof,
  ): Promise<boolean> {
    /**
     * @description Get transaction for unstake token from Kriya pool
     * @param fountainId
     * @param lpProof UserLpProof object
     * @returns Promise<boolean>
     */

    tx.moveCall({
      target: "0x4379259b0f0f547b84ec1c81d704f24861edd8afd8fa6bb9c082e44fbf97a27a::fountain_periphery::force_unstake",
      typeArguments: proofTypeToCoinType(lpProof.typeName),
      arguments: [
        tx.sharedObjectRef(CLOCK_OBJECT),
        tx.object(fountainId),
        tx.objectRef(lpProofToObject(lpProof)),
      ]
    });

    return true;
  }

  async getCetusUnstakeTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProof: UserLpProof,
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for unstake token from Cetus pool
     * @param fountainId
     * @param lpProof UserLpProof object
     * @param walletAddress
     * @returns Promise<boolean>
     */

    const [bucketusOut, suiReward] = tx.moveCall({
      target: "0x02139a2e2ccb61caf776b76fbcef883bdfa6d2cbe0c2f1115a16cb8422b44da2::fountain_core::force_unstake",
      typeArguments: [COINS_TYPE_LIST.BUCKETUS, COINS_TYPE_LIST.SUI],
      arguments: [
        tx.sharedObjectRef(CLOCK_OBJECT),
        tx.object(fountainId),
        tx.objectRef(lpProofToObject(lpProof)),
      ],
    });

    const suiCoin = coinFromBalance(tx, COINS_TYPE_LIST.SUI, suiReward);
    const bucketusCoin = coinFromBalance(tx, COINS_TYPE_LIST.BUCKETUS, bucketusOut);

    const [buckCoin, usdcCoin] = tx.moveCall({
      target: "0x8da48ef1e49dcb81631ce468df5c273d2f8eb5770af4d27ec2f1049bc8a61f75::bucketus::withdraw",
      typeArguments: [COINS_TYPE_LIST.BUCK, COINS_TYPE_LIST.USDC],
      arguments: [
        tx.sharedObjectRef(BUCKETUS_TREASURY),
        tx.sharedObjectRef(BUCKETUS_LP_VAULT_05),
        tx.object(CETUS_OBJS.globalConfig),
        tx.object(CETUS_OBJS.buckUsdcPool),
        tx.sharedObjectRef(CLOCK_OBJECT),
        bucketusCoin,
      ],
    });

    tx.transferObjects([buckCoin, usdcCoin, suiCoin], tx.pure(walletAddress, "address"));

    return true;
  }

  async getAfClaimTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProofs: UserLpProof[],
  ): Promise<boolean> {
    /**
     * @description Get transaction for claim token from AF pool
     * @param fountainId
     * @param lpProof UserLpProof object
     * @returns Promise<boolean>
     */

    for (const lpProof of lpProofs) {
      const [stakeType, rewardType] = proofTypeToCoinType(lpProof.typeName);

      tx.moveCall({
        target: `${FOUNTAIN_PACKAGE_ID}::fountain_periphery::claim`,
        typeArguments: [stakeType, rewardType],
        arguments: [
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.object(fountainId),
          tx.objectRef(lpProofToObject(lpProof)),
        ]
      });
    }

    return true;
  }

  async getCetusClaimTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProofs: UserLpProof[],
    walletAddress: string,
  ): Promise<boolean> {
    /**
     * @description Get transaction for claim token from Cetus pool
     * @param fountainId
     * @param lpProofs UserLpProof objects array
     * @param walletAddress
     * @returns Promise<boolean>
     */

    for (const lpProof of lpProofs) {
      tx.moveCall({
        target: `${FOUNTAIN_PERIHERY_PACKAGE_ID}::cetus_fountain::claim`,
        arguments: [
          tx.object(fountainId),
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.objectRef(lpProofToObject(lpProof)),
          tx.pure(walletAddress, "address"),
        ],
      });
    }

    return true;
  }

  async getKriyaClaimTx(
    tx: TransactionBlock,
    fountainId: string,
    lpProofs: UserLpProof[],
  ): Promise<boolean> {
    /**
     * @description Get transaction for claim token from Kriya pool
     * @param fountainId
     * @param lpProofs UserLpProof object array
     * @param walletAddress
     * @returns Promise<boolean>
     */

    for (const lpProof of lpProofs) {
      tx.moveCall({
        target: `${KRIYA_FOUNTAIN_PACKAGE_ID}::fountain_periphery::claim`,
        typeArguments: proofTypeToCoinType(lpProof.typeName),
        arguments: [
          tx.sharedObjectRef(CLOCK_OBJECT),
          tx.object(fountainId),
          tx.objectRef(lpProofToObject(lpProof)),
        ],
      });
    }

    return true;
  }

  getStrapStakeTx(
    tx: TransactionBlock,
    collateralType: string,
    strapId: string | TransactionArgument,
    address: string,
  ): boolean {
    /**
     * @description Get transaction for stake token to strap fountain
     * @param collateralType
     * @param strapId
     * @param address
     * @returns boolean
     */
    const coin = getCoinSymbol(collateralType);
    if (!coin || !STRAP_FOUNTAIN_IDS[coin]) {
      return false;
    }

    const proof = tx.moveCall({
      target: `${STRAP_FOUNTAIN_PACKAGE_ID}::fountain::stake`,
      typeArguments: [collateralType, COINS_TYPE_LIST.SUI],
      arguments: [
        tx.sharedObjectRef(STRAP_FOUNTAIN_IDS[coin] as SharedObjectRef),
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        tx.sharedObjectRef(CLOCK_OBJECT),
        typeof strapId === "string" ? tx.object(strapId) : strapId,
      ]
    });
    tx.transferObjects([proof], tx.pure.address(address));

    return true;
  }

  getStrapUnstakeTx(
    tx: TransactionBlock,
    collateralType: string,
    strapId: string | TransactionArgument,
    address: string,
  ): boolean {
    /**
     * @description Get transaction for unstake token from strap fountain
     * @param collateralType
     * @param strapId
     * @param address
     * @returns boolean
     */
    const coin = getCoinSymbol(collateralType);
    if (!coin || !STRAP_FOUNTAIN_IDS[coin]) {
      return false;
    }

    const proof = tx.moveCall({
      target: `${STRAP_FOUNTAIN_PACKAGE_ID}::fountain::unstake`,
      typeArguments: [collateralType, COINS_TYPE_LIST.SUI],
      arguments: [
        tx.sharedObjectRef(STRAP_FOUNTAIN_IDS[coin] as SharedObjectRef),
        tx.sharedObjectRef(CLOCK_OBJECT),
        typeof strapId === "string" ? tx.object(strapId) : strapId,
      ]
    });
    tx.transferObjects([proof], tx.pure.address(address));

    return true;
  }

  getStrapClaimTx(
    tx: TransactionBlock,
    collateralType: string,
    strapId: string | TransactionArgument,
    address: string,
  ): boolean {
    /**
     * @description Get transaction for claim token from strap fountain
     * @param collateralType
     * @param strapId
     * @param address
     * @returns Promise<boolean>
     */
    const coin = getCoinSymbol(collateralType);
    if (!coin || !STRAP_FOUNTAIN_IDS[coin]) {
      return false;
    }

    const reward = tx.moveCall({
      target: `${STRAP_FOUNTAIN_PACKAGE_ID}::fountain::claim`,
      typeArguments: [collateralType, COINS_TYPE_LIST.SUI],
      arguments: [
        tx.sharedObjectRef(STRAP_FOUNTAIN_IDS[coin] as SharedObjectRef),
        tx.sharedObjectRef(CLOCK_OBJECT),
        typeof strapId === "string" ? tx.object(strapId) : strapId,
      ]
    });
    tx.transferObjects([reward], tx.pure.address(address));

    return true;
  }

  getDestroyPositionTx(
    tx: TransactionBlock,
    collateralType: string,
    strapId: string | TransactionArgument,
  ): boolean {
    /**
     * @description Get transaction for destroy position
     * @param collateralType
     * @param strapId
     * @returns boolean
     */
    const coin = getCoinSymbol(collateralType);
    if (!coin) {
      return false;
    }

    tx.moveCall({
      target: `${BUCKET_OPERATIONS_PACKAGE_ID}::bucket_operations::destroy_empty_strap`,
      typeArguments: [collateralType],
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        typeof strapId === "string" ? tx.object(strapId) : strapId,
      ]
    });

    return true;
  }

  getFlashBorrowTx(
    tx: TransactionBlock,
    inputs: {
      coinSymbol: string;
      amount: number | TransactionArgument;
    },
  ): [TransactionArgument, TransactionArgument] {
    /**
     * @description Get flash borrow transaction
     * @param tx base transaction
     * @param inputs coin with amount
     * @returns [flashLoans, flashReceipt]
     */
    const { coinSymbol, amount } = inputs;
    const coinType = COINS_TYPE_LIST[coinSymbol as COIN];
    const isBuck = coinType === COINS_TYPE_LIST.BUCK;
    const target = isBuck
      ? (`${CORE_PACKAGE_ID}::buck::flash_borrow_buck`)
      : (`${CORE_PACKAGE_ID}::buck::flash_borrow`);
    const typeArguments = isBuck ? [COINS_TYPE_LIST.SUI] : [coinType];
    const [flashLoans, flashReceipt] = tx.moveCall({
      target,
      typeArguments,
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        typeof amount == "number" ? tx.pure.u64(amount) : amount,
      ],
    });
    return [flashLoans, flashReceipt];
  }

  getFlashRepayTx(
    tx: TransactionBlock,
    inputs: {
      coinSymbol: string;
      repayment: TransactionArgument;
      flashReceipt: TransactionArgument;
    },
  ) {
    /**
     * @description Get flash repay transaction
     * @param tx base transaction
     * @param inputs coin with receipt & repay amount
     */
    const { coinSymbol, repayment, flashReceipt } = inputs;
    const coinType = COINS_TYPE_LIST[coinSymbol as COIN];
    const isBuck = coinType === COINS_TYPE_LIST.BUCK;
    const target = isBuck
      ? (`${CORE_PACKAGE_ID}::buck::flash_repay_buck`)
      : (`${CORE_PACKAGE_ID}::buck::flash_repay`);
    const typeArguments = isBuck ? [COINS_TYPE_LIST.SUI] : [coinType];
    tx.moveCall({
      target,
      typeArguments,
      arguments: [
        tx.sharedObjectRef(PROTOCOL_OBJECT),
        repayment,
        flashReceipt
      ],
    });
  }

}