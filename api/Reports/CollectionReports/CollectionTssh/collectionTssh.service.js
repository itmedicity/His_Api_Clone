const {executeTmc} = require("../../../../config/oracleExecutor");
const {oracledb} = require("../../../../config/oradbconfig");
const {
  sql_one,
  sql_usersList,
  sql_ipBill,
  sql_advIp,
  sql_advOp,
  sql_advSettldBill,
  sql_advSettldIp,
  sql_advSettldPharmacy,
  sql_ipReceiptCollection,
  sql_ipReceiptPrevCollection,
  sql_refundIp,
  sql_refundIpReceipt,
} = require("./collection.sql");

const controller_service = async (conn, bind) => {
  const result = await executeTmc(sql_one, bind, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

// ---------------------------------------------------------------------------
// User Wise Collection — Summary section (Phase 1), IP-restricted (rmIpNumber, STATUS = 2)
// Only the GTT_EXCLUDE_IP-filtered queries are kept — every other query (OP-only/null-effect
// tagged tables, plus the BOTH-tagged tables collection.sql.js leaves unfiltered) is dropped
// entirely; their full contribution stays wholly under CollectionTmc.
// ---------------------------------------------------------------------------

const runQuery = async (conn, sql, bind) => {
  const result = await conn.execute(sql, bind, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getUsersList = async (conn) => runQuery(conn, sql_usersList, {});
const getIpBill = async (conn, bind) => runQuery(conn, sql_ipBill, bind);
const getAdvIp = async (conn, bind) => runQuery(conn, sql_advIp, bind);
const getAdvOp = async (conn, bind) => runQuery(conn, sql_advOp, bind);
const getAdvSettldBill = async (conn, bind) => runQuery(conn, sql_advSettldBill, bind);
const getAdvSettldIp = async (conn, bind) => runQuery(conn, sql_advSettldIp, bind);
const getAdvSettldPharmacy = async (conn, bind) => runQuery(conn, sql_advSettldPharmacy, bind);
const getIpReceiptCollection = async (conn, bind) => runQuery(conn, sql_ipReceiptCollection, bind);
const getIpReceiptPrevCollection = async (conn, bind) => runQuery(conn, sql_ipReceiptPrevCollection, bind);

// ---------------------------------------------------------------------------
// User Wise Collection — Refund section (Phase 3)
// Only IP-tagged refund sources remain (Iprefundmast/IPRECEIPTrefund) — Pharmacy/Billmast
// refunds have no GTT filter in CollectionTmc's SQL, so their full amount stays there.
// ---------------------------------------------------------------------------

const getRefundIp = async (conn, bind) => runQuery(conn, sql_refundIp, bind);
const getRefundIpReceipt = async (conn, bind) => runQuery(conn, sql_refundIpReceipt, bind);

const num = (v) => Number(v || 0);
const keyOf = (row) => row.US_CODE ?? row.us_code;
const nameOf = (row) => row.USC_NAME ?? row.usc_name;

/**
 * Builds the Refund section rows. Only IP-bill refunds (Iprefundmast/IPRECEIPTrefund) feed
 * IP#/IP Amt here — POS#/POS Amt and OP#/OP Amt have no IP_NO-filtered source in this slice.
 */
const buildRefundSection = (refundIpRows, refundIpReceiptRows) => {
  const userMap = new Map();

  const blank = (usCode, uscName) => ({
    US_CODE: usCode,
    USC_NAME: uscName,
    IP_COUNT: 0,
    IP_AMT: 0,
    OP_COUNT: 0,
    OP_AMT: 0,
    POS_COUNT: 0,
    POS_AMT: 0,
    CASH: 0,
    CR_CARD: 0,
    CHEQUE: 0,
    CREDIT_INSURANCE: 0,
    BANK_TRANSFER: 0,
  });

  const getOrCreate = (row) => {
    const usCode = keyOf(row);
    if (!usCode) return null;
    if (!userMap.has(usCode)) {
      userMap.set(usCode, blank(usCode, nameOf(row)));
    }
    return userMap.get(usCode);
  };

  for (const row of refundIpRows) {
    const target = getOrCreate(row);
    if (!target) continue;
    target.IP_COUNT += num(row.BILLCOUNT);
    target.IP_AMT += num(row.AMOUNT);
    target.CREDIT_INSURANCE += num(row.CREDIT);
  }

  for (const row of refundIpReceiptRows) {
    const target = getOrCreate(row);
    if (!target) continue;
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
  }

  for (const row of userMap.values()) {
    row.TOTAL_AFTER_ADV = row.IP_AMT + row.OP_AMT + row.POS_AMT;
    row.COLLECTION_TOTAL = row.CASH + row.CR_CARD + row.CHEQUE + row.CREDIT_INSURANCE + row.BANK_TRANSFER;
  }

  return Array.from(userMap.values());
};

const blankRow = (usCode, uscName) => ({
  US_CODE: usCode,
  USC_NAME: uscName,
  IP_COUNT: 0,
  IP_AMT: 0,
  OP_COUNT: 0,
  OP_AMT: 0,
  POS_COUNT: 0,
  POS_AMT: 0,
  ROUND_OFF: 0,
  REVENUE_TOTAL: 0,
  ADV_COUNT: 0,
  ADV_COLLD: 0,
  ADV_SETTLD: 0,
  TOTAL_AFTER_ADV: 0,
  CASH: 0,
  CR_CARD: 0,
  CHEQUE: 0,
  CREDIT_INSURANCE: 0,
  BANK_TRANSFER: 0,
  COLLECTION_TOTAL: 0,
  PREV_COLLECTION: 0,
  UNSETTLED_AMT: 0,
});

const getOrCreateRow = (userMap, row) => {
  const usCode = keyOf(row);
  if (!usCode) return null;
  if (!userMap.has(usCode)) {
    userMap.set(usCode, blankRow(usCode, nameOf(row)));
  }
  return userMap.get(usCode);
};

/**
 * Merges the 8 Phase-1 query result sets (IP-restricted slice — everything else dropped, see
 * the module header) into one row per cashier (us_code).
 */
const mergeUserWiseCollection = (
  usersRows,
  ipBillRows,
  advIpRows,
  advOpRows,
  advSettldBillRows,
  advSettldIpRows,
  advSettldPharmacyRows,
  ipReceiptCollectionRows,
  ipReceiptPrevCollectionRows,
) => {
  const userMap = new Map();

  for (const row of usersRows) {
    userMap.set(row.US_CODE, blankRow(row.US_CODE, row.USC_NAME));
  }

  for (const row of ipBillRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    if (num(row.AMOUNT) !== 0) {
      target.IP_COUNT += num(row.BILLCOUNT);
      target.IP_AMT += num(row.AMOUNT);
      target.ROUND_OFF += num(row.ROUNDOFF);
    }
    target.CREDIT_INSURANCE += num(row.CREDIT);
  }

  for (const rows of [advIpRows, advOpRows]) {
    for (const row of rows) {
      const target = getOrCreateRow(userMap, row);
      if (!target) continue;
      target.ADV_COUNT += num(row.BILLCOUNT);
      target.ADV_COLLD += num(row.CASH) + num(row.CHEQUE) + num(row.CARD) + num(row.BANK);
      target.CASH += num(row.CASH);
      target.CR_CARD += num(row.CARD);
      target.CHEQUE += num(row.CHEQUE);
      target.BANK_TRANSFER += num(row.BANK);
    }
  }

  for (const rows of [advSettldBillRows, advSettldIpRows, advSettldPharmacyRows]) {
    for (const row of rows) {
      const target = getOrCreateRow(userMap, row);
      if (!target) continue;
      target.ADV_SETTLD += num(row.AMOUNT);
    }
  }

  for (const row of ipReceiptCollectionRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.BANK_TRANSFER += num(row.BANK);
    target.ADV_SETTLD += num(row.CONDISCOUNT);
  }

  for (const row of ipReceiptPrevCollectionRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    target.PREV_COLLECTION += num(row.CASH) + num(row.CHEQUE) + num(row.CARD) + num(row.BANK);
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.BANK_TRANSFER += num(row.BANK);
  }

  for (const row of userMap.values()) {
    row.REVENUE_TOTAL = row.IP_AMT + row.OP_AMT + row.POS_AMT;
    row.TOTAL_AFTER_ADV = row.REVENUE_TOTAL + row.ADV_COLLD - row.ADV_SETTLD;
    row.COLLECTION_TOTAL = row.CASH + row.CR_CARD + row.CHEQUE + row.CREDIT_INSURANCE + row.BANK_TRANSFER;
    row.UNSETTLED_AMT = row.TOTAL_AFTER_ADV - (row.COLLECTION_TOTAL - row.PREV_COLLECTION);
  }

  return Array.from(userMap.values());
};

module.exports = {
  collectionReports001: controller_service,
  getUsersList,
  getIpBill,
  getAdvIp,
  getAdvOp,
  getAdvSettldBill,
  getAdvSettldIp,
  getAdvSettldPharmacy,
  getIpReceiptCollection,
  getIpReceiptPrevCollection,
  mergeUserWiseCollection,
  getRefundIp,
  getRefundIpReceipt,
  buildRefundSection,
};
