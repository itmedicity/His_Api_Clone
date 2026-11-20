const {executeTmc} = require("../../../../config/oracleExecutor");
const {oracledb} = require("../../../../config/oradbconfig");
const {
  sql_one,
  sql_usersList,
  sql_ipBill,
  sql_opBillConsolidated,
  sql_opBillReceipt,
  sql_posBilling,
  sql_advPharmacy,
  sql_advIp,
  sql_advBilling,
  sql_advOp,
  sql_advSettldBill,
  sql_advSettldIp,
  sql_advSettldOp,
  sql_advSettldPharmacy,
  sql_ipReceiptCollection,
  sql_ipReceiptPrevCollection,
  sql_billmastCollection,
  sql_creditBillCollection,
  sql_refundPharmacy,
  sql_refundBillmast,
  sql_refundReceipt,
  sql_refundIp,
  sql_refundIpReceipt,
} = require("./collection.sql");

const controller_service = async (conn, bind) => {
  const result = await executeTmc(sql_one, bind, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

// ---------------------------------------------------------------------------
// User Wise Collection — Summary section (Phase 1)
// Each function below shares the one connection passed in from the
// controller and runs its matching query from collection.sql.js.
// ---------------------------------------------------------------------------

const runQuery = async (conn, sql, bind) => {
  const result = await conn.execute(sql, bind, {outFormat: oracledb.OUT_FORMAT_OBJECT});
  return result.rows;
};

const getUsersList = async (conn) => runQuery(conn, sql_usersList, {});
const getIpBill = async (conn, bind) => runQuery(conn, sql_ipBill, bind);
const getOpBillConsolidated = async (conn, bind) => runQuery(conn, sql_opBillConsolidated, bind);
const getOpBillReceipt = async (conn, bind) => runQuery(conn, sql_opBillReceipt, bind);
const getPosBilling = async (conn, bind) => runQuery(conn, sql_posBilling, bind);
const getAdvPharmacy = async (conn, bind) => runQuery(conn, sql_advPharmacy, bind);
const getAdvIp = async (conn, bind) => runQuery(conn, sql_advIp, bind);
const getAdvBilling = async (conn, bind) => runQuery(conn, sql_advBilling, bind);
const getAdvOp = async (conn, bind) => runQuery(conn, sql_advOp, bind);
const getAdvSettldBill = async (conn, bind) => runQuery(conn, sql_advSettldBill, bind);
const getAdvSettldIp = async (conn, bind) => runQuery(conn, sql_advSettldIp, bind);
const getAdvSettldOp = async (conn, bind) => runQuery(conn, sql_advSettldOp, bind);
const getAdvSettldPharmacy = async (conn, bind) => runQuery(conn, sql_advSettldPharmacy, bind);
const getIpReceiptCollection = async (conn, bind) => runQuery(conn, sql_ipReceiptCollection, bind);
const getIpReceiptPrevCollection = async (conn, bind) => runQuery(conn, sql_ipReceiptPrevCollection, bind);
const getBillmastCollection = async (conn, bind) => runQuery(conn, sql_billmastCollection, bind);

// ---------------------------------------------------------------------------
// User Wise Collection — Credit Bill Collection section (Phase 2)
// ---------------------------------------------------------------------------

const getCreditBillCollection = async (conn, bind) => runQuery(conn, sql_creditBillCollection, bind);

/**
 * Builds the Credit Bill Collection section rows (RECPCOLLECTIONMAST activity). Unlike the
 * Summary section, this section has no IP/OP/POS/Advance breakdown — Total is simply the
 * Cash+Card+Cheque+Bank collection total (confirmed against real data — Accounts/Beera/Fio2/
 * Information/Kavya@15100, 01/12/2025, whose figures and section footer total reproduce exactly).
 */
const buildCreditBillCollection = (rows) => {
  return rows.map((row) => {
    const cash = num(row.CASH);
    const cheque = num(row.CHQDD);
    const card = num(row.CARD);
    const bank = num(row.BANK);
    const collectionTotal = cash + cheque + card + bank;
    return {
      US_CODE: row.US_CODE,
      USC_NAME: row.USC_NAME,
      BILLCOUNT: num(row.BILLCOUNT),
      CASH: cash,
      CR_CARD: card,
      CHEQUE: cheque,
      BANK_TRANSFER: bank,
      TOTAL_AFTER_ADV: collectionTotal,
      COLLECTION_TOTAL: collectionTotal,
      UNSETTLED_AMT: 0,
    };
  });
};

const num = (v) => Number(v || 0);
const keyOf = (row) => row.US_CODE ?? row.us_code;
const nameOf = (row) => row.USC_NAME ?? row.usc_name;

// ---------------------------------------------------------------------------
// User Wise Collection — Refund section (Phase 3)
// ---------------------------------------------------------------------------

const getRefundPharmacy = async (conn, bind) => runQuery(conn, sql_refundPharmacy, bind);
const getRefundBillmast = async (conn, bind) => runQuery(conn, sql_refundBillmast, bind);
const getRefundReceipt = async (conn, bind) => runQuery(conn, sql_refundReceipt, bind);
const getRefundIp = async (conn, bind) => runQuery(conn, sql_refundIp, bind);
const getRefundIpReceipt = async (conn, bind) => runQuery(conn, sql_refundIpReceipt, bind);

/**
 * Builds the Refund section rows. Pharmacy refunds (Mretmast) feed POS#/POS Amt; Billmast and
 * Receipt refunds both feed OP#/OP Amt (Excel attributes general Billmast refunds to the OP
 * column too, not a separate bucket) — confirmed against real data (Najam/Pradeepkumar/
 * Rajeshkumar/Sinic/Shimis/etc., 01/12/2025: every individual row and the section footer total
 * — OP#=22, OP Amt=₹7,800, POS#=32, POS Amt=₹9,692, Cash=₹17,098, Credit=₹394 — reproduce
 * exactly). IP-bill refunds (Iprefundmast/IPRECEIPTrefund) feed IP#/IP Amt — both tables are
 * empty in this database as of this writing, so that portion could not be verified against real
 * non-zero data; implemented faithfully from the literal source query (query 14) rather than
 * left unbuilt, since it's a zero-risk addition until real data appears.
 */
const buildRefundSection = (refundPharmacyRows, refundBillmastRows, refundReceiptRows, refundIpRows, refundIpReceiptRows) => {
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

  for (const row of refundPharmacyRows) {
    const target = getOrCreate(row);
    if (!target) continue;
    target.POS_COUNT += num(row.BILLCOUNT);
    target.POS_AMT += num(row.AMOUNT);
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.CREDIT_INSURANCE += num(row.CREDIT);
  }

  for (const rows of [refundBillmastRows, refundReceiptRows]) {
    for (const row of rows) {
      const target = getOrCreate(row);
      if (!target) continue;
      target.OP_COUNT += num(row.BILLCOUNT);
      target.OP_AMT += num(row.AMOUNT);
      target.CASH += num(row.CASH);
      target.CR_CARD += num(row.CARD);
      target.CHEQUE += num(row.CHEQUE);
      target.CREDIT_INSURANCE += num(row.CREDIT);
    }
  }

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
 * Merges the 16 Phase-1 query result sets into one row per cashier (us_code),
 * per the query-to-column mapping documented in the approved plan.
 */
const mergeUserWiseCollection = (
  usersRows,
  ipBillRows,
  opBillConsolidatedRows,
  opBillReceiptRows,
  posBillingRows,
  advPharmacyRows,
  advIpRows,
  advBillingRows,
  advOpRows,
  advSettldBillRows,
  advSettldIpRows,
  advSettldOpRows,
  advSettldPharmacyRows,
  ipReceiptCollectionRows,
  ipReceiptPrevCollectionRows,
  billmastCollectionRows,
) => {
  const userMap = new Map();

  for (const row of usersRows) {
    userMap.set(row.US_CODE, blankRow(row.US_CODE, row.USC_NAME));
  }

  for (const row of ipBillRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    // A group whose billing and refund branches net to zero contributes no bill count either —
    // a zero-net group isn't a real bill for reporting purposes (confirmed against real data:
    // Aneesa, 01/12/2025, whose Excel row is all zeros despite 91 raw Disbillmast rows netting
    // to ₹0 between IP Bill and IP Bill refund).
    if (num(row.AMOUNT) !== 0) {
      target.IP_COUNT += num(row.BILLCOUNT);
      target.IP_AMT += num(row.AMOUNT);
      target.ROUND_OFF += num(row.ROUNDOFF);
    }
    target.CREDIT_INSURANCE += num(row.CREDIT);
  }

  for (const row of opBillConsolidatedRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    if (num(row.AMOUNT) !== 0) {
      target.OP_COUNT += num(row.BILLCOUNT);
      target.OP_AMT += num(row.AMOUNT);
      target.ROUND_OFF += num(row.ROUNDOFF);
    }
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.CREDIT_INSURANCE += num(row.CREDIT);
    target.BANK_TRANSFER += num(row.BANK);
  }

  for (const row of opBillReceiptRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    if (num(row.AMOUNT) !== 0) {
      target.OP_COUNT += num(row.BILLCOUNT);
      target.OP_AMT += num(row.AMOUNT);
      target.ROUND_OFF += num(row.ROUNDOFF);
    }
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.CREDIT_INSURANCE += num(row.CREDIT);
    target.BANK_TRANSFER += num(row.BANK);
  }

  for (const row of posBillingRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    // Pbillmast's own AMOUNT (BMN_NETAMT) excludes tax; the Excel "POS Amt" column is
    // NETAMT + TAX (confirmed against real data — Ajmal@14550, 01/12/2025).
    if (num(row.AMOUNT) !== 0) {
      target.POS_COUNT += num(row.BILLCOUNT);
      target.POS_AMT += num(row.AMOUNT) + num(row.TAX);
      target.ROUND_OFF += num(row.ROUNDOFF);
    }
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.CREDIT_INSURANCE += num(row.CREDIT);
    target.BANK_TRANSFER += num(row.BANK);
  }

  for (const rows of [advPharmacyRows, advIpRows, advBillingRows, advOpRows]) {
    for (const row of rows) {
      const target = getOrCreateRow(userMap, row);
      if (!target) continue;
      target.ADV_COUNT += num(row.BILLCOUNT);
      target.ADV_COLLD += num(row.CASH) + num(row.CHEQUE) + num(row.CARD) + num(row.BANK);
      // Money collected as an advance is still money physically collected that day, so it
      // also flows into the Collection Details columns, not just the Adv Colld aggregate
      // (confirmed against real data — Beera/Fio, 01/12/2025: their Cash+Card shortfall
      // matched their Adv Colld total exactly).
      target.CASH += num(row.CASH);
      target.CR_CARD += num(row.CARD);
      target.CHEQUE += num(row.CHEQUE);
      target.BANK_TRANSFER += num(row.BANK);
    }
  }

  for (const rows of [advSettldBillRows, advSettldIpRows, advSettldOpRows, advSettldPharmacyRows]) {
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
    // Per the legacy report's footer note: "Receipt Discount is included in the Adv. Settled".
    target.ADV_SETTLD += num(row.CONDISCOUNT);
  }

  for (const row of billmastCollectionRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    target.CASH += num(row.CASH);
    target.CR_CARD += num(row.CARD);
    target.CHEQUE += num(row.CHEQUE);
    target.CREDIT_INSURANCE += num(row.CREDIT);
    target.BANK_TRANSFER += num(row.BANK);
    // Billmast is itself a revenue source for IP/OP bills (distinct from
    // Disbillmast/Opbillmast/Receiptmast), split by BMC_IPOP — confirmed against real data
    // (Akhila@12174, 01/12/2025). Refund rows carry no reliable BMC_IPOP so they only affect
    // the payment-method columns above, not this revenue split. A group whose billing and
    // COLLCNCODE-branch amounts net to zero contributes no bill count either — a zero-net
    // group isn't a real bill for reporting purposes (confirmed against real data: Aneesa,
    // 01/12/2025, whose Excel row is all zeros despite 91 raw Billmast rows netting to ₹0).
    if (num(row.AMOUNT) !== 0) {
      if (row.BMC_IPOP === "I") {
        target.IP_COUNT += num(row.BILLCOUNT);
        target.IP_AMT += num(row.AMOUNT);
        target.ROUND_OFF += num(row.ROUNDOFF);
      } else if (row.BMC_IPOP === "O") {
        target.OP_COUNT += num(row.BILLCOUNT);
        target.OP_AMT += num(row.AMOUNT);
        target.ROUND_OFF += num(row.ROUNDOFF);
      }
    }
  }

  for (const row of ipReceiptPrevCollectionRows) {
    const target = getOrCreateRow(userMap, row);
    if (!target) continue;
    // Prev Collection is informational (highlighting how much of today's collection relates to
    // a bill from an earlier period) — the underlying cash/card/cheque/bank still needs to land
    // in the main Collection Details columns too (confirmed against real data: Accounts, A037,
    // 01/12/2025, whose ₹23,000 card payment here was missing from the Cr.Card total).
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
    // Prev Collection money is already accounted for against an earlier period's bill, so it
    // doesn't count against today's total when computing what's still unsettled (confirmed
    // against real data — Accounts, A037, 01/12/2025: Excel shows Unsettled=0 there, not the
    // -18,000 a naive TotalAfterAdv - CollectionTotal would give).
    row.UNSETTLED_AMT = row.TOTAL_AFTER_ADV - (row.COLLECTION_TOTAL - row.PREV_COLLECTION);
  }

  return Array.from(userMap.values());
};

module.exports = {
  collectionReports001: controller_service,
  getUsersList,
  getIpBill,
  getOpBillConsolidated,
  getOpBillReceipt,
  getPosBilling,
  getAdvPharmacy,
  getAdvIp,
  getAdvBilling,
  getAdvOp,
  getAdvSettldBill,
  getAdvSettldIp,
  getAdvSettldOp,
  getAdvSettldPharmacy,
  getIpReceiptCollection,
  getIpReceiptPrevCollection,
  getBillmastCollection,
  mergeUserWiseCollection,
  getCreditBillCollection,
  buildCreditBillCollection,
  getRefundPharmacy,
  getRefundBillmast,
  getRefundReceipt,
  getRefundIp,
  getRefundIpReceipt,
  buildRefundSection,
};
