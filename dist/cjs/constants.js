"use strict";
// Copyright Andrei <andreid.dev@gmail.com>
Object.defineProperty(exports, "__esModule", { value: true });
exports.HASUI_APY_URL = exports.AFSUI_APY_URL = exports.BUCKETUS_LP_VAULT = exports.BUCKETUS_TREASURY = exports.CETUS_OBJS = exports.AF_OBJS = exports.AF_USDC_BUCK_LP_REGISTRY = exports.AF_USDC_BUCK_LP_REGISTRY_ID = exports.AF_SUI_BUCK_LP_REGISTRY = exports.AF_SUI_BUCK_LP_REGISTRY_ID = exports.KRIYA_USDC_BUCK_LP_REGISTRY = exports.KRIYA_USDC_BUCK_LP_REGISTRY_ID = exports.KRIYA_SUI_BUCK_LP_REGISTRY = exports.KRIYA_SUI_BUCK_LP_REGISTRY_ID = exports.CETUS_USDC_BUCK_LP_REGISTRY = exports.CETUS_USDC_BUCK_LP_REGISTRY_ID = exports.CETUS_SUI_BUCK_LP_REGISTRY = exports.CETUS_SUI_BUCK_LP_REGISTRY_ID = exports.FOUNTAIN_PERIHERY_PACKAGE_ID = exports.TREASURY_OBJECT_ID = exports.ORACLE_OBJECT_ID = exports.SUPRA_UPDATE_TARGET = exports.SUPRA_HANDLER_OBJECT = exports.SWITCHBOARD_UPDATE_TARGET = exports.SUPRA_ID = exports.SUPRA_PRICE_FEEDS = exports.COIN_DECIMALS = exports.COINS_TYPE_LIST = exports.TESTNET_CORE_PACKAGE_ID = exports.TESTNET_CONTRIBUTOR_TOKEN_ID = exports.TESTNET_PROTOCOL_ID = exports.TESTNET_BUCKET_OPERATIONS_PACKAGE_ID = exports.TESTNET_PACKAGE_ID = exports.MAINNET_CORE_PACKAGE_ID = exports.MAINNET_CONTRIBUTOR_TOKEN_ID = exports.MAINNET_PROTOCOL_ID = exports.MAINNET_BUCKET_OPERATIONS_PACKAGE_ID = exports.MAINNET_PACKAGE_ID = void 0;
const builder_1 = require("@mysten/sui.js/src/builder");
exports.MAINNET_PACKAGE_ID = "0x275b6c59f68837f7c8d7076254373a5bb16e20e6435967defdd86f943e70a2db";
exports.MAINNET_BUCKET_OPERATIONS_PACKAGE_ID = "0xb59c19de88addb7b3e721066c6c99987d09ad22fa829c69dbf0f0c1c0be20625";
exports.MAINNET_PROTOCOL_ID = "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
exports.MAINNET_CONTRIBUTOR_TOKEN_ID = "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2";
exports.MAINNET_CORE_PACKAGE_ID = "0x275b6c59f68837f7c8d7076254373a5bb16e20e6435967defdd86f943e70a2db";
exports.TESTNET_PACKAGE_ID = "0x1ca47988f33d06d748a779e78f321b9ba74f6ad25b3de2840da425022dfaa969";
exports.TESTNET_BUCKET_OPERATIONS_PACKAGE_ID = "0x6f206ba15a7d81662e20ac1e6a4e0b443f3972861327584e8a1148c9880e4a09";
exports.TESTNET_PROTOCOL_ID = "0x8b7ff1f21c8e80683a4504f8e564ad42e51361875ecce8c9ecc5596a67abd225";
exports.TESTNET_CONTRIBUTOR_TOKEN_ID = "0x1ca47988f33d06d748a779e78f321b9ba74f6ad25b3de2840da425022dfaa969";
exports.TESTNET_CORE_PACKAGE_ID = "0x275b6c59f68837f7c8d7076254373a5bb16e20e6435967defdd86f943e70a2db";
exports.COINS_TYPE_LIST = {
    SUI: "0x2::sui::SUI",
    USDC: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
    USDT: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
    afSUI: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
    haSUI: "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
    vSUI: "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    WETH: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
    AF_LP_USDC_BUCK: "0xf1b901d93cc3652ee26e8d88fff8dc7b9402b2b2e71a59b244f938a140affc5e::af_lp::AF_LP",
    AF_LP_SUI_BUCK: "0x62e39f5554a2badccab46bf3fab044e3f7dc889d42a567a68d3c1b2e5463001f::af_lp::AF_LP",
    BUCK: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
    BKT: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::bkt::BKT",
};
exports.COIN_DECIMALS = {
    SUI: 9,
    USDC: 6,
    USDT: 6,
    afSUI: 9,
    haSUI: 9,
    vSUI: 9,
    WETH: 8,
    BUCK: 9,
    BKT: 9,
    AF_LP_USDC_BUCK: 9,
    AF_LP_SUI_BUCK: 9,
};
exports.SUPRA_PRICE_FEEDS = {
    usdc_usd: "0x1c400c096e8b52a22c43c080fea4aa22661c9a35b469493dfac5332aecb4789c",
    usdt_usd: "0x11ea8c7b6287f1410c8bac2e475b4fe6fea45fd59e036a058522ab3acec8fed3",
    eth_usdt: "0x258d0f9c61768d184d218a068ff8117728f5becb1bfe2b1e3b6e231dda875a67",
    sui_usdt: "0x898236b8f93d5ea7f94fbec1b3ac152ae51901e3078859a92cbf06c46c20b316",
    hasui_sui: "0xd741ca15eb5e19f2d138b9e9cb95d70dc90667370dee7cbad184acfbb35063cf",
    vsui_sui: "0xd291ea0aebb1a9314cd60d5142755267f9badbeccd30b91e92b54bef29864f33",
    afsui_sui: "0xbe4289cf638a9ad1f085bd8a3e0aeaed814078e3961b77fb08cc7550ee5d8c00",
};
exports.SUPRA_ID = {
    USDT: "48",
    USDC: "89",
    // WBTC: "18",
    WETH: "19",
    SUI: "90",
    afSUI: "90",
    haSUI: "90",
    vSUI: "90",
};
exports.SWITCHBOARD_UPDATE_TARGET = "0xe2077d678de929d64d3fcd79c1adfbd23d97324e9bae3a60102d44367fbe008c::bucket_oracle::update_price_from_switchboard";
exports.SUPRA_HANDLER_OBJECT = "0xaa0315f0748c1f24ddb2b45f7939cff40f7a8104af5ccbc4a1d32f870c0b4105";
exports.SUPRA_UPDATE_TARGET = "0xe2077d678de929d64d3fcd79c1adfbd23d97324e9bae3a60102d44367fbe008c::bucket_oracle::update_price_from_supra";
exports.ORACLE_OBJECT_ID = "0xf578d73f54b3068166d73c1a1edd5a105ce82f97f5a8ea1ac17d53e0132a1078";
exports.TREASURY_OBJECT_ID = "0x7032c4d7afd30cd0dd04c924d63f1127de6fcc429968306807091d3ad3ff78b1";
exports.FOUNTAIN_PERIHERY_PACKAGE_ID = "0x8c51a9c8d235413e5dd4ff922191d5fc1f79b5b0c4d70620f00415a411f1040d";
exports.CETUS_SUI_BUCK_LP_REGISTRY_ID = "0x7778d68f02810b2c002b6f40084c5f3fe0b1bcc7d7a7c64d72ba40ff9a815bac";
exports.CETUS_SUI_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.CETUS_SUI_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 7598161,
});
exports.CETUS_USDC_BUCK_LP_REGISTRY_ID = "0xb9d46d57d933fabaf9c81f4fc6f54f9c1570d3ef49785c6b7200cad6fe302909";
exports.CETUS_USDC_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.CETUS_USDC_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 61717743,
});
exports.KRIYA_SUI_BUCK_LP_REGISTRY_ID = "0xcc39bcc2c438a79beb2656ff043714a60baf89ba37592bef2e14ee8bca0cf007";
exports.KRIYA_SUI_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.KRIYA_SUI_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 18368425,
});
exports.KRIYA_USDC_BUCK_LP_REGISTRY_ID = "0xae1910e5bcb13a4f5b12688f0da939b9c9d3e8a9e8d0a2e02c818f6a94e598fd";
exports.KRIYA_USDC_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.KRIYA_USDC_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 18368428,
});
exports.AF_SUI_BUCK_LP_REGISTRY_ID = "0xe2569ee20149c2909f0f6527c210bc9d97047fe948d34737de5420fab2db7062";
exports.AF_SUI_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.AF_SUI_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 6366296,
});
exports.AF_USDC_BUCK_LP_REGISTRY_ID = "0x885e09419b395fcf5c8ee5e2b7c77e23b590e58ef3d61260b6b4eb44bbcc8c62";
exports.AF_USDC_BUCK_LP_REGISTRY = builder_1.Inputs.SharedObjectRef({
    objectId: exports.AF_USDC_BUCK_LP_REGISTRY_ID,
    mutable: true,
    initialSharedVersion: 6366295,
});
exports.AF_OBJS = {
    pool: "0xeec6b5fb1ddbbe2eb1bdcd185a75a8e67f52a5295704dd73f3e447394775402b",
    poolRegistry: "0xfcc774493db2c45c79f688f88d28023a3e7d98e4ee9f48bbf5c7990f651577ae",
    protocolFeeVault: "0xf194d9b1bcad972e45a7dd67dd49b3ee1e3357a00a50850c52cd51bb450e13b4",
    treasury: "0x28e499dff5e864a2eafe476269a4f5035f1c16f338da7be18b103499abf271ce",
    insuranceFund: "0xf0c40d67b078000e18032334c3325c47b9ec9f3d9ae4128be820d54663d14e3b",
    referralVault: "0x35d35b0e5b177593d8c3a801462485572fc30861e6ce96a55af6dc4730709278"
};
exports.CETUS_OBJS = {
    poolBuckUsdc: "0x6ecf6d01120f5f055f9a605b56fd661412a81ec7c8b035255e333c664a0c12e7",
    globalConfig: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f"
};
exports.BUCKETUS_TREASURY = builder_1.Inputs.SharedObjectRef({
    objectId: "0x781d3060afe9f5427bb865088ab25c8d827ed2b0be71ab140ff9ab5a0d8c9466",
    initialSharedVersion: 61707529,
    mutable: true,
});
exports.BUCKETUS_LP_VAULT = builder_1.Inputs.SharedObjectRef({
    objectId: "0x1a0b93fd2965ce3ceb4039c90b232ddee7b0e79015cab0ca10528bb5f4285188",
    initialSharedVersion: 61717741,
    mutable: true,
});
exports.AFSUI_APY_URL = "https://aftermath.finance/api/staking/apy";
exports.HASUI_APY_URL = "https://www.haedal.xyz/api/stats/home";
//# sourceMappingURL=constants.js.map