import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";

import { BucketInfo } from "../types";
import { CLOCK_OBJECT, PROTOCOL_ID, PROTOCOL_OBJECT } from "../constants";

export function computeBorrowFeeRate(
  bucketInfo: BucketInfo | null | undefined,
): number {
  if (!bucketInfo) return 0.005;
  const interval =
    (new Date().valueOf() - bucketInfo.latestRedemptionTime) / (3600_000 * 12);
  const borrowFee = (bucketInfo.baseFeeRate / 1_000_000) * 0.5 ** interval;

  if (borrowFee < 0.005) return 0.005;
  else if (borrowFee > 0.05) return 0.05;
  else return borrowFee;
}

const bottleStruct = bcs.struct(
  "0xb3f10f2c9a52b615ab8b0b930ee55e019bacb407b29f5f534e6d9c3291341db8::utils::BottleData",
  {
    debtor: bcs.Address,
    coll_amount: bcs.U64,
    debt_amount: bcs.U64,
  },
);

type Bottle = {
  debtor: string;
  collAmount: number;
  debtAmount: number;
  ncr: number;
};

type BottlePage = {
  bottles: Bottle[];
  nextCursor: string | null;
};

export async function getBottlesByStep(
  client: SuiClient,
  coinType: string,
  cursor: string | null,
  isUpward: boolean,
): Promise<BottlePage> {
  const tx = new Transaction();
  tx.moveCall({
    target:
      "0xf84a73f667f65dbc54483b8c456defc3ebc4e469026e5e8b4c2a0f3ff4a8748d::utils::get_bottles_with_direction",
    typeArguments: [coinType],
    arguments: [
      tx.sharedObjectRef(PROTOCOL_OBJECT),
      tx.sharedObjectRef(CLOCK_OBJECT),
      tx.pure(bcs.option(bcs.Address).serialize(cursor)),
      tx.pure.u64(50),
      tx.pure.u64(951),
      tx.pure.bool(isUpward),
    ],
  });
  const res = await client.devInspectTransactionBlock({
    sender: PROTOCOL_ID,
    transactionBlock: tx,
  });
  const returnValues = res?.results?.[0]?.returnValues;
  if (!returnValues || returnValues?.[0]?.[0][0] === 0) {
    return { bottles: [], nextCursor: null };
  } else {
    const bottleVec = returnValues[0];
    const cursorVec = returnValues[1];
    if (!bottleVec) return { bottles: [], nextCursor: null };

    const [value] = bottleVec;
    const [cursor] = cursorVec;
    const bottles = bcs.vector(bottleStruct).parse(Uint8Array.from(value));
    const nextCursor = bcs.option(bcs.Address).parse(Uint8Array.from(cursor));
    return {
      bottles: bottles.map((data) => {
        const { debtor, coll_amount, debt_amount } = data;
        const collAmount = Number(coll_amount);
        const debtAmount = Number(debt_amount);
        const ncr = collAmount / debtAmount;
        return { debtor, collAmount, debtAmount, ncr };
      }),
      nextCursor,
    };
  }
}
