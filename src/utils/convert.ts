import { COIN, FountainInfo, FountainResponse, PsmInfo, PsmPoolResponse, StrapFountainInfo, StrapFountainResponse } from "../types";
import { COIN_DECIMALS, PSM_POOL_IDS } from "../constants";
import { formatUnits } from "./format";
import { SuiObjectResponse } from "@mysten/sui.js/client";
import { getObjectFields } from "./object";

export function objectToFountain(res: SuiObjectResponse): FountainInfo {
    const id = res.data?.objectId ?? "";

    const fields = getObjectFields(res) as FountainResponse;
    return {
        id,
        flowAmount: Number(fields.flow_amount ?? 0),
        flowInterval: Number(fields.flow_interval ?? 1),
        sourceBalance: Number(fields.source ?? 0),
        poolBalance: Number(fields.pool ?? 0),
        stakedBalance: Number(fields.staked ?? 0),
        totalWeight: Number(fields.total_weight ?? 0),
        cumulativeUnit: Number(fields.cumulative_unit ?? 0),
        latestReleaseTime: Number(fields.latest_release_time ?? 0),
    }
}

export function objectToStrapFountain(res: SuiObjectResponse): StrapFountainInfo {
    const fields = getObjectFields(res) as StrapFountainResponse;
    return {
        id: res.data?.objectId ?? "",
        flowAmount: Number(fields.flow_amount ?? 0),
        flowInterval: Number(fields.flow_interval ?? 1),
        sourceBalance: Number(fields.source ?? 0),
        poolBalance: Number(fields.pool ?? 0),
        totalDebtAmount: Number(fields.total_debt_amount ?? 0),
        cumulativeUnit: Number(fields.cumulative_unit ?? 0),
        latestReleaseTime: Number(fields.latest_release_time ?? 0),
        strapId: fields.strap_table.fields.id.id,
    }
}

export function objectToPsm(res: SuiObjectResponse): PsmInfo {
    const fields = getObjectFields(res) as PsmPoolResponse;
    const poolId = fields.id.id;
    const coin = Object.keys(PSM_POOL_IDS).find(symbol => PSM_POOL_IDS[symbol as COIN] == poolId) as string;

    return {
        id: poolId,
        tvl: Number(formatUnits(BigInt(fields.pool), COIN_DECIMALS[coin as COIN] ?? 9)),
        chargeRate: Number(fields.charge_fee_rate),
        dischargeRate: Number(fields.discharge_fee_rate),
        conversionRate: Number(fields.conversion_rate),
    };
}