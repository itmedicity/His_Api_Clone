const {getTmcConnection, oracleConnectionClose} = require("../../../../config/oradbconfig");
const {
  collectionReports001,
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
} = require("./collectionTssh.service");

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
const getUserWiseCollectionSummary = async (req, res) => {
  let conn;
  const {fromDate, toDate, mhCode} = req.query;
  const bind = {fromDate, toDate, mhCode: mhCode || "00"};

  try {
    conn = await getTmcConnection();

    const usersRows = await getUsersList(conn);
    const ipBillRows = await getIpBill(conn, bind);
    const opBillConsolidatedRows = await getOpBillConsolidated(conn, bind);
    const opBillReceiptRows = await getOpBillReceipt(conn, bind);
    const posBillingRows = await getPosBilling(conn, bind);
    const advPharmacyRows = await getAdvPharmacy(conn, bind);
    const advIpRows = await getAdvIp(conn, bind);
    const advBillingRows = await getAdvBilling(conn, bind);
    const advOpRows = await getAdvOp(conn, bind);
    const advSettldBillRows = await getAdvSettldBill(conn, bind);
    const advSettldIpRows = await getAdvSettldIp(conn, bind);
    const advSettldOpRows = await getAdvSettldOp(conn, bind);
    const advSettldPharmacyRows = await getAdvSettldPharmacy(conn, bind);
    const ipReceiptCollectionRows = await getIpReceiptCollection(conn, bind);
    const ipReceiptPrevCollectionRows = await getIpReceiptPrevCollection(conn, bind);
    const billmastCollectionRows = await getBillmastCollection(conn, bind);
    const creditBillCollectionRows = await getCreditBillCollection(conn, bind);
    const refundPharmacyRows = await getRefundPharmacy(conn, bind);
    const refundBillmastRows = await getRefundBillmast(conn, bind);
    const refundReceiptRows = await getRefundReceipt(conn, bind);
    const refundIpRows = await getRefundIp(conn, bind);
    const refundIpReceiptRows = await getRefundIpReceipt(conn, bind);

    await conn.commit();

    const data = mergeUserWiseCollection(
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
    );
    const creditBillCollection = buildCreditBillCollection(creditBillCollectionRows);
    const refund = buildRefundSection(
      refundPharmacyRows,
      refundBillmastRows,
      refundReceiptRows,
      refundIpRows,
      refundIpReceiptRows,
    );

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
