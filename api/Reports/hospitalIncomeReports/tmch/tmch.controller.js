const {getTmcConnection, oracleConnectionClose} = require("../../../../config/oradbconfig");
const {insertIntoGTT} = require("../../../../utls/controller-helperFun");
const {getIpNumberFromPreviousDayCollection} = require("../../misReportTmch/misReportTMCH/collectionTmch.service");
const qmtService = require("./tmch.service");
const groupedService = require("../tssh/tssh.service");

const getTmchReport = async (req, res) => {
  let main_conn;
  let income_conn;
  let pharma_conn;
  let secon_conn;

  // const conn = await getTmcConnection();

  const body = req.body;
  const {from, to, ptno, grouped, phar} = req.body;
  //   console.log(`body`, body);
  // console.log("ptno" + ptno);

  try {
    [main_conn, income_conn, pharma_conn, secon_conn] = await Promise.all([getTmcConnection(), getTmcConnection(), getTmcConnection(), getTmcConnection()]);

    await main_conn.execute("DELETE FROM GTT_EXCLUDE_IP");
    await main_conn.commit();
    await insertIntoGTT(main_conn, ptno);
    const getMisincexpmast = await qmtService.getMisincexpmast(main_conn);
    const getMisincexpgroup = await qmtService.getMisincexpgroup(main_conn);
    const getUngroupedRoomDetl = await qmtService.getUngroupedRoomDetl(main_conn, body);
    const getTheaterIncome = await qmtService.getTheaterIncome(main_conn, body);
    const getTheaterIncome_two = await qmtService.getTheaterIncome_two(main_conn, body);
    const getConsultingIncome = await qmtService.getConsultingIncome(main_conn, body);
    const getIpRefundDetl = await qmtService.getIpRefundDetl(main_conn, body);
    const getIpRefundDetl_one = await qmtService.getIpRefundDetl_one(main_conn, body);
    const getIpincomeSection_one = await qmtService.getIpincomeSection_one(main_conn, body);
    const getIpincomeSection_two = await qmtService.getIpincomeSection_two(main_conn, body);
    const getIpincomeSection_three = await qmtService.getIpincomeSection_three(main_conn, body);
    const getProcedureIncomeSection_one = await qmtService.getProcedureIncomeSection_one(main_conn, body);
    const getReceiptmasterSection_one = await qmtService.getReceiptmasterSection_one(main_conn, body);

    const getIpRefundReceiptDetlSection_Two = await qmtService.getIpRefundReceiptDetlSection_Two(main_conn, body);
    const getIpincomeSection_four = await qmtService.getIpincomeSection_four(main_conn, body);
    const getProcedureIncomeSecition_two = await qmtService.getProcedureIncomeSecition_two(main_conn, body);
    const getIpRefundDetlSection_three = await qmtService.getIpRefundDetlSection_three(main_conn, body);
    const getIpincomeSection_five = await qmtService.getIpincomeSection_five(main_conn, body);
    const getIpRefundDetlSection_four = await qmtService.getIpRefundDetlSection_four(main_conn, body);
    const getCollectionAgainstSales_one = await qmtService.getCollectionPortion_one(main_conn, body);
    const getPerttyCash = await qmtService.getPerttyCash(main_conn, body);
    const getCeditInsuranceBillCollection = await qmtService.getCollectionPortion_three(main_conn, body);
    const getCollectionAgainstSales_two = await qmtService.getIpRefundDetlSection_five(main_conn, body);
    const getCollectionPortion_four = await qmtService.getCollectionPortion_four(main_conn, body);
    const getDiscount = await qmtService.getDiscount(main_conn, body);
    const getIpincomeSection_six = await qmtService.getIpincomeSection_six(main_conn, body);

    const ipPreviousDayCollection = async (conn, bind) => {
      const results = await qmtService.getCollectionPortion_two(conn, bind);
      if (!results || results.length === 0) {
        return [];
      }

      const ipNumber = results.map((e) => e.IP_NO);
      const getResult = await getIpNumberFromPreviousDayCollection(ipNumber);
      if (!getResult || getResult.length === 0) {
        return results;
      }
      const ipSet = new Set(getResult.map((e) => e.ip_no));
      const notInclPat = results?.filter((e) => !ipSet.has(e.IP_NO));
      return notInclPat;
    };

    const getIpPreviousDayCollection = await ipPreviousDayCollection(main_conn, body);
    const ipPreviousDayDiscount = async (conn, bind) => {
      const results = await qmtService.getDiscount_one(conn, bind);
      if (!results || results.length === 0) {
        return [];
      }

      const ipNumber = results.map((e) => e.IP_NO);
      const getResult = await getIpNumberFromPreviousDayCollection(ipNumber);
      if (!getResult || getResult.length === 0) {
        return results;
      }

      const array = Object.values(JSON.parse(JSON.stringify(getResult)));
      const notInclPat = results.filter((e) => !array.map((e) => e.ip_no).includes(e.IP_NO));
      return notInclPat;
    };

    const getIpPreviousDayDicount = await ipPreviousDayDiscount(main_conn, body);

    const getAdvanceCollection = await qmtService.getCollectionPortion_five(main_conn, body);
    const getAdvanceSettled = await qmtService.getCollectionPortion_six(main_conn, body);
    const Credit_Insurance_Bill_two = await qmtService.getIpRefundDetlSection_six(main_conn, body);
    const getAdvanceRefund = await qmtService.getAdvanceRefund(main_conn, body);
    const Credit_Insurance_Bill_one = await qmtService.getCollectionPortion_seven(main_conn, body);
    const getUnsettledAmount = await qmtService.getCollectionPortion_eight(main_conn, body);
    const getIpRefundDetlSection_seven = await qmtService.getIpRefundDetlSection_seven(main_conn, body);
    const getWriteoffamnt = await qmtService.getWriteoffamnt(main_conn, body);
    const IpConsolidated_Discount = await qmtService.getDiscount_three(main_conn, body);
    const getTypeDiscount = await qmtService.getTypeDiscount(main_conn, body);
    // PHARMACY INCOME
    await pharma_conn.execute("DELETE FROM GTT_EXCLUDE_IP");
    await pharma_conn.commit();
    await insertIntoGTT(pharma_conn, phar);
    const getPharmacyCollection_One = await qmtService.getPharmacyCollection_One(pharma_conn, body);
    const getPharamcyReturnSection_one = await qmtService.getPharamcyReturnSection_one(pharma_conn, body);
    const getPharmacyCollection_Two = await qmtService.getPharmacyCollection_Two(pharma_conn, body);
    const getPharamcyCollection_three = await qmtService.getPharamcyCollection_three(pharma_conn, body);
    const getPharmacyCollection_four = await qmtService.getPharmacyCollection_four(pharma_conn, body);
    const getPharmacyReturnSection_three = await qmtService.getPharmacyReturnSection_three(pharma_conn, body);

    // GROUPED PHARMACY SERVICE FROM TSSH
    await secon_conn.execute("DELETE FROM GTT_EXCLUDE_IP");
    await secon_conn.commit();
    await insertIntoGTT(secon_conn, grouped);
    const getGroupedPharmacyService_One = await groupedService.getPharmacyCollection_Two(secon_conn, body);
    const getGroupedPharmacyService_Two = await groupedService.getPharmacyCollection_four(secon_conn, body);
    const getGroupedPharmacyService_Three = await groupedService.getPharmacyReturnSection_three(secon_conn, body);
    await secon_conn.execute("DELETE FROM GTT_EXCLUDE_IP");
    await secon_conn.commit();

    const result = {
      income: {
        getTheaterIncome: getTheaterIncome,
        getTheaterIncome_two: getTheaterIncome_two,
        getConsultingIncome: getConsultingIncome,
        getIpincomeSection_one: getIpincomeSection_one,
        getIpincomeSection_two: getIpincomeSection_two,
        getIpincomeSection_three: getIpincomeSection_three,
        getProcedureIncomeSection_one: getProcedureIncomeSection_one,
        getIpincomeSection_four: getIpincomeSection_four,
        getProcedureIncomeSecition_two: getProcedureIncomeSecition_two,
        getIpincomeSection_five: getIpincomeSection_five,
        getIpincomeSection_six: getIpincomeSection_six,
        getIpRefundDetlSection_three: getIpRefundDetlSection_three,
        getIpRefundDetlSection_four: getIpRefundDetlSection_four,
        getUngroupedRoomDetl: getUngroupedRoomDetl,
      },
      IpPreviousDayCollection: {
        getIpPreviousDayCollection: getIpPreviousDayCollection,
      },
      CollectionAgainstSales: {
        getCollectionAgainstSales_one: getCollectionAgainstSales_one,
        getCollectionAgainstSales_two: getCollectionAgainstSales_two,
      },
      CreditInSuranceBillCollection: {
        creditInsuranceBillCollection: getCeditInsuranceBillCollection,
      },
      AdvanceCollection: {
        getAdvanceCollection: getAdvanceCollection,
      },
      AdvanceSettled: {
        getAdvanceSettled: getAdvanceSettled,
      },
      UnsettledAmount: {
        getUnsettledAmount: getUnsettledAmount,
      },
      Credit_Insurance_Bill: {
        Credit_Insurance_Bill_one: Credit_Insurance_Bill_one,
        Credit_Insurance_Bill_two: Credit_Insurance_Bill_two,
      },
      pharmacy: {
        getPharmacyCollection_One: getPharmacyCollection_One,
        getPharamcyReturnSection_one: getPharamcyReturnSection_one,
        getPharmacyCollection_Two: getPharmacyCollection_Two,
        getPharamcyCollection_three: getPharamcyCollection_three,
        getPharmacyCollection_four: getPharmacyCollection_four,
        getPharmacyReturnSection_three: getPharmacyReturnSection_three,
      },
      groupedPharmacyService: {
        getGroupedPharmacyService_One: getGroupedPharmacyService_One,
        getGroupedPharmacyService_Two: getGroupedPharmacyService_Two,
        getGroupedPharmacyService_Three: getGroupedPharmacyService_Three,
      },
      discount: {
        IpPreviousDayDicount: getIpPreviousDayDicount,
        IpConsolidated_Discount: IpConsolidated_Discount,
        getTypeDiscount: getTypeDiscount,
      },
      pettyCash: {
        getPerttyCash: getPerttyCash,
      },
      advanceRefund: {
        getAdvanceRefund: getAdvanceRefund,
      },
      writeOff: {
        getWriteoffamnt: getWriteoffamnt,
      },
      masterData: {
        getMisincexpmast: getMisincexpmast,
        getMisincexpgroup: getMisincexpgroup,
      },
      ungrouped: {
        getDiscount: getDiscount,
        getReceiptmasterSection_one: getReceiptmasterSection_one,
        getCollectionPortion_four: getCollectionPortion_four,
        getIpRefundDetl: getIpRefundDetl,
        getIpRefundDetl_one: getIpRefundDetl_one,
        getIpRefundReceiptDetlSection_Two: getIpRefundReceiptDetlSection_Two,
        getIpRefundDetlSection_seven: getIpRefundDetlSection_seven,
      },
    };

    return res.status(200).json({
      success: 1,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    await Promise.all([oracleConnectionClose(main_conn), oracleConnectionClose(income_conn), oracleConnectionClose(pharma_conn), oracleConnectionClose(secon_conn)]);
  }
};

module.exports = getTmchReport;
