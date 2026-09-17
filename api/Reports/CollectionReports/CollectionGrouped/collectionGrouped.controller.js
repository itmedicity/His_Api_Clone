const {getTmcConnection, oracleConnectionClose} = require("../../../../config/oradbconfig");
const {insertIntoGTT} = require("../../../../utls/controller-helperFun");
const {
  collectionReports001,
  getUsersList,
  getIpBill,
  getAdvIp,
  getAdvOp,
  getAdvSettldBill,
  getAdvSettldPharmacy,
  getIpReceiptCollection,
  getIpReceiptPrevCollection,
  mergeUserWiseCollection,
  getRefundIp,
  getRefundIpReceipt,
  buildRefundSection,
} = require("./collectionGrouped.service");

const getCollectionReports = async (req, res) => {
  const {fromDate, toDate} = req.body;
  try {
    const bind = {fromDate: fromDate, toDate: toDate};

    const collection_One = await collectionReports001(bind);

    const results = {
      collection_one: collection_One,
    };

    return res.status(200).json({
      success: 1,
      message: "Unsettled Amount User Wise",
      data: results,
    });
  } catch (error) {
    return res.status(200).json({
      success: 0,
      message: error.message,
    });
  }
};

// User Wise Collection — Summary section (Phase 1)
// CollectionGrouped includes only the groupedPatient slice (tmch_status='1' from
// /admission/getIpNumber, sent as `groupedPatient` — see IncomeReportsTmch.jsx) so its totals
// plus CollectionTmc's and CollectionTssh's totals reconstruct CollectionQmt's unfiltered totals
// exactly.
const getUserWiseCollectionSummary = async (req, res) => {
  let conn;
  const {fromDate, toDate, mhCode, groupedPatient} = req.body;
  const bind = {fromDate, toDate, mhCode: mhCode || "00"};

  try {
    conn = await getTmcConnection();
    await insertIntoGTT(conn, (groupedPatient || []).map((ip) => ({ip, status: 3})));

    const usersRows = await getUsersList(conn);
    const ipBillRows = await getIpBill(conn, bind);
    const advIpRows = await getAdvIp(conn, bind);
    const advOpRows = await getAdvOp(conn, bind);
    const advSettldBillRows = await getAdvSettldBill(conn, bind);
    const advSettldPharmacyRows = await getAdvSettldPharmacy(conn, bind);
    const ipReceiptCollectionRows = await getIpReceiptCollection(conn, bind);
    const ipReceiptPrevCollectionRows = await getIpReceiptPrevCollection(conn, bind);
    const refundIpRows = await getRefundIp(conn, bind);
    const refundIpReceiptRows = await getRefundIpReceipt(conn, bind);

    await conn.commit();

    const data = mergeUserWiseCollection(
      usersRows,
      ipBillRows,
      advIpRows,
      advOpRows,
      advSettldBillRows,
      advSettldPharmacyRows,
      ipReceiptCollectionRows,
      ipReceiptPrevCollectionRows,
    );
    // RECPCOLLECTIONMAST (Credit Bill Collection), Pbillmast/Billmast payment breakdown, and
    // Pharmacy/Billmast refunds have no GTT_EXCLUDE_IP filter in this slice's SQL, so they carry
    // no data here — their full contribution stays under CollectionTmc.
    const creditBillCollection = [];
    const refund = buildRefundSection(refundIpRows, refundIpReceiptRows);

    return res.status(200).json({
      success: 1,
      message: "User Wise Collection Summary",
      data,
      creditBillCollection,
      refund,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await oracleConnectionClose(conn);
    }
  }
};

module.exports = {
  getCollectionReports,
  getUserWiseCollectionSummary,
};
