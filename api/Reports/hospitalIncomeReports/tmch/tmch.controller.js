const {getTmcConnection, oracleConnectionClose} = require("../../../../config/oradbconfig");
const {insertIntoGTT} = require("../../../../utls/controller-helperFun");
const {getIpNumberFromPreviousDayCollection} = require("../../misReportTmch/misReportTMCH/collectionTmch.service");
const qmtService = require("./tmch.service");
const groupedService = require("../tssh/tssh.service");

const getTmchReport = async (req, res) => {
  let connMain, connPharmacy, connGrouped;

  const body = req.body;
  const {from, to, ptno, grouped, phar, ipNoColl} = req.body;
  //   console.log(`body`, body);
  // console.log("ptno" + ptno);

  try {
    // GET CONNECTION FROM TMC POOL
    [connMain, connPharmacy, connGrouped] = await Promise.all([getTmcConnection(), getTmcConnection(), getTmcConnection()]);

    // TRUNCATE TABLES AND INSERT INTO GTT FOR MAIN REPORT
    await insertIntoGTT(connMain, ptno);

    const getMisincexpmast = await qmtService.getMisincexpmast(connMain);
    const getMisincexpgroup = await qmtService.getMisincexpgroup(connMain);
    const getUngroupedRoomDetl = await qmtService.getUngroupedRoomDetl(connMain, body);
    const getTheaterIncome = await qmtService.getTheaterIncome(connMain, body);
    const getTheaterIncome_two = await qmtService.getTheaterIncome_two(connMain, body);
    const getConsultingIncome = await qmtService.getConsultingIncome(connMain, body);
    const getIpRefundDetl = await qmtService.getIpRefundDetl(connMain, body);
    const getIpRefundDetl_one = await qmtService.getIpRefundDetl_one(connMain, body);
    const getIpincomeSection_one = await qmtService.getIpincomeSection_one(connMain, body);
    const getIpincomeSection_two = await qmtService.getIpincomeSection_two(connMain, body);
    const getIpincomeSection_three = await qmtService.getIpincomeSection_three(connMain, body);
    const getProcedureIncomeSection_one = await qmtService.getProcedureIncomeSection_one(connMain, body);
    const getReceiptmasterSection_one = await qmtService.getReceiptmasterSection_one(connMain, body);
    const getIpRefundReceiptDetlSection_Two = await qmtService.getIpRefundReceiptDetlSection_Two(connMain, body);
    const getIpincomeSection_four = await qmtService.getIpincomeSection_four(connMain, body);
    const getProcedureIncomeSecition_two = await qmtService.getProcedureIncomeSecition_two(connMain, body);
    const getIpRefundDetlSection_three = await qmtService.getIpRefundDetlSection_three(connMain, body);
    const getIpincomeSection_five = await qmtService.getIpincomeSection_five(connMain, body);
    const getIpRefundDetlSection_four = await qmtService.getIpRefundDetlSection_four(connMain, body);
    const getCollectionAgainstSales_one = await qmtService.getCollectionPortion_one(connMain, body);
    const getPerttyCash = await qmtService.getPerttyCash(connMain, body);
    const getCollectionAgainstSales_two = await qmtService.getIpRefundDetlSection_five(connMain, body);
    const getCollectionPortion_four = await qmtService.getCollectionPortion_four(connMain, body);
    const getDiscount = await qmtService.getDiscount(connMain, body);
    const getIpincomeSection_six = await qmtService.getIpincomeSection_six(connMain, body);

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

    const getIpPreviousDayCollection = await ipPreviousDayCollection(connMain, body);
    const getIpPreviousDayDicount = await ipPreviousDayDiscount(connMain, body);
    const getAdvanceCollection = await qmtService.getCollectionPortion_five(connMain, body);
    const getAdvanceSettled = await qmtService.getCollectionPortion_six(connMain, body);
    const Credit_Insurance_Bill_two = await qmtService.getIpRefundDetlSection_six(connMain, body);
    const getAdvanceRefund = await qmtService.getAdvanceRefund(connMain, body);
    const Credit_Insurance_Bill_one = await qmtService.getCollectionPortion_seven(connMain, body);
    const getUnsettledAmount = await qmtService.getCollectionPortion_eight(connMain, body);
    const getIpRefundDetlSection_seven = await qmtService.getIpRefundDetlSection_seven(connMain, body);
    const getWriteoffamnt = await qmtService.getWriteoffamnt(connMain, body);
    const IpConsolidated_Discount = await qmtService.getDiscount_three(connMain, body);
    const getTypeDiscount = await qmtService.getTypeDiscount(connMain, body);
    // PHARMACY INCOME
    await connPharmacy.commit();
    await insertIntoGTT(connPharmacy, phar);

    const getPharmacyCollection_One = await qmtService.getPharmacyCollection_One(connPharmacy, body);
    const getPharamcyReturnSection_one = await qmtService.getPharamcyReturnSection_one(connPharmacy, body);
    const getPharmacyCollection_Two = await qmtService.getPharmacyCollection_Two(connPharmacy, body);
    const getPharamcyCollection_three = await qmtService.getPharamcyCollection_three(connPharmacy, body);
    const getPharmacyCollection_four = await qmtService.getPharmacyCollection_four(connPharmacy, body);
    const getPharmacyReturnSection_three = await qmtService.getPharmacyReturnSection_three(connPharmacy, body);

    // GROUPED PHARMACY SERVICE FROM TSSH
    await connGrouped.commit();
    await insertIntoGTT(connGrouped, grouped);

    const getGroupedPharmacyService_One = await groupedService.getPharmacyCollection_Two(connGrouped, body);
    const getGroupedPharmacyService_Two = await groupedService.getPharmacyCollection_four(connGrouped, body);
    const getGroupedPharmacyService_Three = await groupedService.getPharmacyReturnSection_three(connGrouped, body);

    await connGrouped.commit();
    await insertIntoGTT(connGrouped, ipNoColl);
    const getCeditInsuranceBillCollection = await qmtService.getCollectionPortion_three(connGrouped, body);
    await connGrouped.commit();

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
    // Clean up and close all connections
    if (connMain) await oracleConnectionClose(connMain);
    if (connPharmacy) await oracleConnectionClose(connPharmacy);
    if (connGrouped) await oracleConnectionClose(connGrouped);
    // oracleConnectionClose(conn);
  }
};

module.exports = getTmchReport;
