const {getTmcConnection, oracleConnectionClose} = require("../../../../config/oradbconfig");
const qmtService = require("./qmt.service");

const getQmtReport = async (req, res) => {
  let conn;

  const body = req.body;

  try {
    conn = await getTmcConnection();

    const getMisincexpmast = await qmtService.getMisincexpmast(conn);
    const getMisincexpgroup = await qmtService.getMisincexpgroup(conn);
    const getTheaterIncome = await qmtService.getTheaterIncome(conn, body);
    const getTheaterIncome_two = await qmtService.getTheaterIncome_two(conn, body);
    const getConsultingIncome = await qmtService.getConsultingIncome(conn, body);
    const getIpincomeSection_one = await qmtService.getIpincomeSection_one(conn, body);
    const getIpincomeSection_two = await qmtService.getIpincomeSection_two(conn, body);
    const getIpincomeSection_three = await qmtService.getIpincomeSection_three(conn, body);
    const getProcedureIncomeSection_one = await qmtService.getProcedureIncomeSection_one(conn, body);
    const getIpincomeSection_four = await qmtService.getIpincomeSection_four(conn, body);
    const getProcedureIncomeSecition_two = await qmtService.getProcedureIncomeSecition_two(conn, body);
    const getIpincomeSection_five = await qmtService.getIpincomeSection_five(conn, body);
    const getIpincomeSection_six = await qmtService.getIpincomeSection_six(conn, body);
    const getIpRefundDetlSection_three = await qmtService.getIpRefundDetlSection_three(conn, body);
    const getUngroupedRoomDetl = await qmtService.getUngroupedRoomDetl(conn, body);

    const getIpPreviousDayCollection = await qmtService.getCollectionPortion_two(conn, body);
    const getCollectionAgainstSales_one = await qmtService.getCollectionPortion_one(conn, body);
    const getCollectionAgainstSales_two = await qmtService.getIpRefundDetlSection_five(conn, body);
    const getCeditInsuranceBillCollection = await qmtService.getCollectionPortion_three(conn, body);

    const getAdvanceCollection = await qmtService.getCollectionPortion_five(conn, body);

    const getAdvanceSettled = await qmtService.getCollectionPortion_six(conn, body);

    const getUnsettledAmount = await qmtService.getCollectionPortion_eight(conn, body);

    const Credit_Insurance_Bill_two = await qmtService.getIpRefundDetlSection_six(conn, body);
    const Credit_Insurance_Bill_one = await qmtService.getCollectionPortion_seven(conn, body);

    const getPharmacyCollection_One = await qmtService.getPharmacyCollection_One(conn, body);
    const getPharamcyReturnSection_one = await qmtService.getPharamcyReturnSection_one(conn, body);
    const getPharmacyCollection_Two = await qmtService.getPharmacyCollection_Two(conn, body);
    const getPharamcyCollection_three = await qmtService.getPharamcyCollection_three(conn, body);
    const getPharmacyCollection_four = await qmtService.getPharmacyCollection_four(conn, body);
    const getPharmacyReturnSection_three = await qmtService.getPharmacyReturnSection_three(conn, body);

    const getIpPreviousDayDicount = await qmtService.getDiscount_one(conn, body);
    const IpConsolidated_Discount = await qmtService.getDiscount_three(conn, body);
    const getTypeDiscount = await qmtService.getTypeDiscount(conn, body);

    const getIpRefundDetl = await qmtService.getIpRefundDetl(conn, body);
    const getIpRefundDetl_one = await qmtService.getIpRefundDetl_one(conn, body);
    const getReceiptmasterSection_one = await qmtService.getReceiptmasterSection_one(conn, body);
    const getIpRefundReceiptDetlSection_Two = await qmtService.getIpRefundReceiptDetlSection_Two(conn, body);
    const getIpRefundDetlSection_four = await qmtService.getIpRefundDetlSection_four(conn, body);
    const getPerttyCash = await qmtService.getPerttyCash(conn, body);
    const getCollectionPortion_four = await qmtService.getCollectionPortion_four(conn, body);
    const getDiscount = await qmtService.getDiscount(conn, body);
    const getAdvanceRefund = await qmtService.getAdvanceRefund(conn, body);
    const getIpRefundDetlSection_seven = await qmtService.getIpRefundDetlSection_seven(conn, body);
    const getWriteoffamnt = await qmtService.getWriteoffamnt(conn, body);

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
    oracleConnectionClose(conn);
  }
};

module.exports = getQmtReport;
