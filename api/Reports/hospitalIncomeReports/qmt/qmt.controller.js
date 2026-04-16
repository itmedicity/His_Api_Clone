const {getTmcConnection, oracleConnectionClose, closeConnection} = require("../../../../config/oradbconfig");
const qmtService = require("./qmt.service");

const getQmtReport = async (req, res) => {
  let main_conn;
  let income_conn;
  let pharma_conn;
  let secon_conn;

  const body = req.body;
  //   console.log(`body`, body);

  try {
    [main_conn, income_conn, pharma_conn, secon_conn] = await Promise.all([getTmcConnection(), getTmcConnection(), getTmcConnection(), getTmcConnection()]);

    const [
      getMisincexpmast,
      getMisincexpgroup,
      getTheaterIncome,
      getTheaterIncome_two,
      getConsultingIncome,
      getIpincomeSection_one,
      getIpincomeSection_two,
      getIpincomeSection_three,
      getProcedureIncomeSection_one,
      getIpincomeSection_four,
      getProcedureIncomeSecition_two,
      getIpincomeSection_five,
      getIpincomeSection_six,
      getIpRefundDetlSection_three,
      getUngroupedRoomDetl,
    ] = await Promise.all([
      qmtService.getMisincexpmast(main_conn),
      qmtService.getMisincexpgroup(main_conn),
      qmtService.getTheaterIncome(main_conn, body),
      qmtService.getTheaterIncome_two(main_conn, body),
      qmtService.getConsultingIncome(main_conn, body),
      qmtService.getIpincomeSection_one(main_conn, body),
      qmtService.getIpincomeSection_two(main_conn, body),
      qmtService.getIpincomeSection_three(main_conn, body),
      qmtService.getProcedureIncomeSection_one(main_conn, body),
      qmtService.getIpincomeSection_four(main_conn, body),
      qmtService.getProcedureIncomeSecition_two(main_conn, body),
      qmtService.getIpincomeSection_five(main_conn, body),
      qmtService.getIpincomeSection_six(main_conn, body),
      qmtService.getIpRefundDetlSection_three(main_conn, body),
      qmtService.getUngroupedRoomDetl(main_conn, body),
    ]);

    // const getMisincexpmast = await qmtService.getMisincexpmast(main_conn);
    // const getMisincexpgroup = await qmtService.getMisincexpgroup(main_conn);

    // const getTheaterIncome = await qmtService.getTheaterIncome(main_conn, body);
    // const getTheaterIncome_two = await qmtService.getTheaterIncome_two(main_conn, body);
    // const getConsultingIncome = await qmtService.getConsultingIncome(main_conn, body);
    // const getIpincomeSection_one = await qmtService.getIpincomeSection_one(main_conn, body);
    // const getIpincomeSection_two = await qmtService.getIpincomeSection_two(main_conn, body);
    // const getIpincomeSection_three = await qmtService.getIpincomeSection_three(main_conn, body);
    // const getProcedureIncomeSection_one = await qmtService.getProcedureIncomeSection_one(main_conn, body);
    // const getIpincomeSection_four = await qmtService.getIpincomeSection_four(main_conn, body);
    // const getProcedureIncomeSecition_two = await qmtService.getProcedureIncomeSecition_two(main_conn, body);
    // const getIpincomeSection_five = await qmtService.getIpincomeSection_five(main_conn, body);
    // const getIpincomeSection_six = await qmtService.getIpincomeSection_six(main_conn, body);
    // const getIpRefundDetlSection_three = await qmtService.getIpRefundDetlSection_three(main_conn, body);
    // const getUngroupedRoomDetl = await qmtService.getUngroupedRoomDetl(main_conn, body);

    const [
      getIpPreviousDayCollection,
      getCollectionAgainstSales_one,
      getCollectionAgainstSales_two,
      getCeditInsuranceBillCollection,
      getAdvanceCollection,
      getAdvanceSettled,
      getUnsettledAmount,
      Credit_Insurance_Bill_two,
      Credit_Insurance_Bill_one,
    ] = await Promise.all([
      qmtService.getCollectionPortion_two(income_conn, body),
      qmtService.getCollectionPortion_one(income_conn, body),
      qmtService.getIpRefundDetlSection_five(income_conn, body),
      qmtService.getCollectionPortion_three(income_conn, body),
      qmtService.getCollectionPortion_five(income_conn, body),
      qmtService.getCollectionPortion_six(income_conn, body),
      qmtService.getCollectionPortion_eight(income_conn, body),
      qmtService.getIpRefundDetlSection_six(income_conn, body),
      qmtService.getCollectionPortion_seven(income_conn, body),
    ]);

    // const getIpPreviousDayCollection = await qmtService.getCollectionPortion_two(income_conn, body);
    // const getCollectionAgainstSales_one = await qmtService.getCollectionPortion_one(income_conn, body);
    // const getCollectionAgainstSales_two = await qmtService.getIpRefundDetlSection_five(income_conn, body);
    // const getCeditInsuranceBillCollection = await qmtService.getCollectionPortion_three(income_conn, body);
    // const getAdvanceCollection = await qmtService.getCollectionPortion_five(income_conn, body);
    // const getAdvanceSettled = await qmtService.getCollectionPortion_six(income_conn, body);
    // const getUnsettledAmount = await qmtService.getCollectionPortion_eight(income_conn, body);
    // const Credit_Insurance_Bill_two = await qmtService.getIpRefundDetlSection_six(income_conn, body);
    // const Credit_Insurance_Bill_one = await qmtService.getCollectionPortion_seven(income_conn, body);

    const [getPharmacyCollection_One, getPharamcyReturnSection_one, getPharmacyCollection_Two, getPharamcyCollection_three, getPharmacyCollection_four, getPharmacyReturnSection_three] =
      await Promise.all([
        qmtService.getPharmacyCollection_One(pharma_conn, body),
        qmtService.getPharamcyReturnSection_one(pharma_conn, body),
        qmtService.getPharmacyCollection_Two(pharma_conn, body),
        qmtService.getPharamcyCollection_three(pharma_conn, body),
        qmtService.getPharmacyCollection_four(pharma_conn, body),
        qmtService.getPharmacyReturnSection_three(pharma_conn, body),
      ]);

    // const getPharmacyCollection_One = await qmtService.getPharmacyCollection_One(pharma_conn, body);
    // const getPharamcyReturnSection_one = await qmtService.getPharamcyReturnSection_one(pharma_conn, body);
    // const getPharmacyCollection_Two = await qmtService.getPharmacyCollection_Two(pharma_conn, body);
    // const getPharamcyCollection_three = await qmtService.getPharamcyCollection_three(pharma_conn, body);
    // const getPharmacyCollection_four = await qmtService.getPharmacyCollection_four(pharma_conn, body);
    // const getPharmacyReturnSection_three = await qmtService.getPharmacyReturnSection_three(pharma_conn, body);

    const [
      getIpPreviousDayDicount,
      IpConsolidated_Discount,
      getTypeDiscount,
      getIpRefundDetl,
      getIpRefundDetl_one,
      getReceiptmasterSection_one,
      getIpRefundReceiptDetlSection_Two,
      getIpRefundDetlSection_four,
      getPerttyCash,
      getCollectionPortion_four,
      getDiscount,
      getAdvanceRefund,
      getIpRefundDetlSection_seven,
      getWriteoffamnt,
    ] = await Promise.all([
      qmtService.getDiscount_one(secon_conn, body),
      qmtService.getDiscount_three(secon_conn, body),
      qmtService.getTypeDiscount(secon_conn, body),
      qmtService.getIpRefundDetl(secon_conn, body),
      qmtService.getIpRefundDetl_one(secon_conn, body),
      qmtService.getReceiptmasterSection_one(secon_conn, body),
      qmtService.getIpRefundReceiptDetlSection_Two(secon_conn, body),
      qmtService.getIpRefundDetlSection_four(secon_conn, body),
      qmtService.getPerttyCash(secon_conn, body),
      qmtService.getCollectionPortion_four(secon_conn, body),
      qmtService.getDiscount(secon_conn, body),
      qmtService.getAdvanceRefund(secon_conn, body),
      qmtService.getIpRefundDetlSection_seven(secon_conn, body),
      qmtService.getWriteoffamnt(secon_conn, body),
    ]);

    // const getIpPreviousDayDicount = await qmtService.getDiscount_one(secon_conn, body);
    // const IpConsolidated_Discount = await qmtService.getDiscount_three(secon_conn, body);
    // const getTypeDiscount = await qmtService.getTypeDiscount(secon_conn, body);
    // const getIpRefundDetl = await qmtService.getIpRefundDetl(secon_conn, body);
    // const getIpRefundDetl_one = await qmtService.getIpRefundDetl_one(secon_conn, body);
    // const getReceiptmasterSection_one = await qmtService.getReceiptmasterSection_one(secon_conn, body);
    // const getIpRefundReceiptDetlSection_Two = await qmtService.getIpRefundReceiptDetlSection_Two(secon_conn, body);
    // const getIpRefundDetlSection_four = await qmtService.getIpRefundDetlSection_four(secon_conn, body);
    // const getPerttyCash = await qmtService.getPerttyCash(secon_conn, body);
    // const getCollectionPortion_four = await qmtService.getCollectionPortion_four(secon_conn, body);
    // const getDiscount = await qmtService.getDiscount(secon_conn, body);
    // const getAdvanceRefund = await qmtService.getAdvanceRefund(secon_conn, body);
    // const getIpRefundDetlSection_seven = await qmtService.getIpRefundDetlSection_seven(secon_conn, body);
    // const getWriteoffamnt = await qmtService.getWriteoffamnt(secon_conn, body);

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
    await Promise.all([oracleConnectionClose(main_conn), oracleConnectionClose(income_conn), oracleConnectionClose(pharma_conn), oracleConnectionClose(secon_conn)]);

    // closeConnection();
    // await oracleConnectionClose(main_conn);
    // await oracleConnectionClose(income_conn);
    // await oracleConnectionClose(pharma_conn);
    // await oracleConnectionClose(secon_conn);
  }
};

module.exports = getQmtReport;
