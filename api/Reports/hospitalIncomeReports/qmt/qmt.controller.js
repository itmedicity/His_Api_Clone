const {getTmcConnection} = require("../../../../config/oradbconfig");
const qmtService = require("./qmt.service");

const getQmtReport = async (req, res) => {
  const conn = await getTmcConnection();

  const body = req.body;

  try {
    const getMisincexpmast = await qmtService.getMisincexpmast(conn);
    const getMisincexpgroup = await qmtService.getMisincexpgroup(conn);
    const getUngroupedRoomDetl = await qmtService.getUngroupedRoomDetl(conn, body);
    const getTheaterIncome = await qmtService.getTheaterIncome(conn, body);
    const getTheaterIncome_two = await qmtService.getTheaterIncome_two(conn, body);
    const getConsultingIncome = await qmtService.getConsultingIncome(conn, body);
    const getIpRefundDetl = await qmtService.getIpRefundDetl(conn, body);
    const getIpRefundDetl_one = await qmtService.getIpRefundDetl_one(conn, body);
    const getIpincomeSection_one = await qmtService.getIpincomeSection_one(conn, body);
    const getIpincomeSection_two = await qmtService.getIpincomeSection_two(conn, body);
    const getPharmacyCollection_One = await qmtService.getPharmacyCollection_One(conn, body);
    const getIpincomeSection_three = await qmtService.getIpincomeSection_three(conn, body);
    const getProcedureIncomeSection_one = await qmtService.getProcedureIncomeSection_one(conn, body);
    const getPharamcyReturnSection_one = await qmtService.getPharamcyReturnSection_one(conn, body);
    const getReceiptmasterSection_one = await qmtService.getReceiptmasterSection_one(conn, body);
    const getPharmacyCollection_Two = await qmtService.getPharmacyCollection_Two(conn, body);
    const getIpRefundReceiptDetlSection_Two = await qmtService.getIpRefundReceiptDetlSection_Two(conn, body);
    const getPharamcyCollection_three = await qmtService.getPharamcyCollection_three(conn, body);
    const getIpincomeSection_four = await qmtService.getIpincomeSection_four(conn, body);
    const getPharmacyReturnSection_three = await qmtService.getPharmacyReturnSection_three(conn, body);
    const getProcedureIncomeSecition_two = await qmtService.getProcedureIncomeSecition_two(conn, body);
    const getPharmacyCollection_four = await qmtService.getPharmacyCollection_four(conn, body);
    const getIpRefundDetlSection_three = await qmtService.getIpRefundDetlSection_three(conn, body);
    const getIpincomeSection_five = await qmtService.getIpincomeSection_five(conn, body);
    const getIpRefundDetlSection_four = await qmtService.getIpRefundDetlSection_four(conn, body);
    const getCollectionPortion_one = await qmtService.getCollectionPortion_one(conn, body);
    const getCollectionPortion_two = await qmtService.getCollectionPortion_two(conn, body);
    const getPerttyCash = await qmtService.getPerttyCash(conn, body);
    const getCollectionPortion_three = await qmtService.getCollectionPortion_three(conn, body);
    const getIpRefundDetlSection_five = await qmtService.getIpRefundDetlSection_five(conn, body);
    const getCollectionPortion_four = await qmtService.getCollectionPortion_four(conn, body);
    const getDiscount = await qmtService.getDiscount(conn, body);
    const getIpincomeSection_six = await qmtService.getIpincomeSection_six(conn, body);
    const getDiscount_one = await qmtService.getDiscount_one(conn, body);
    const getCollectionPortion_five = await qmtService.getCollectionPortion_five(conn, body);
    const getCollectionPortion_six = await qmtService.getCollectionPortion_six(conn, body);
    const getIpRefundDetlSection_six = await qmtService.getIpRefundDetlSection_six(conn, body);
    const getAdvanceRefund = await qmtService.getAdvanceRefund(conn, body);
    const getCollectionPortion_seven = await qmtService.getCollectionPortion_seven(conn, body);
    const getCollectionPortion_eight = await qmtService.getCollectionPortion_eight(conn, body);
    const getIpRefundDetlSection_seven = await qmtService.getIpRefundDetlSection_seven(conn, body);
    const getWriteoffamnt = await qmtService.getWriteoffamnt(conn, body);
    const getDiscount_three = await qmtService.getDiscount_three(conn, body);
    const getTypeDiscount = await qmtService.getTypeDiscount(conn, body);

    const result = {
      income: {
        getTheaterIncome: getTheaterIncome,
        getConsultingIncome: getConsultingIncome,
        getIpincomeSection_one: getIpincomeSection_one,
        getIpincomeSection_two: getIpincomeSection_two,
        getIpincomeSection_three: getIpincomeSection_three,
        getTheaterIncome_two: getTheaterIncome_two,
        getProcedureIncomeSection_one: getProcedureIncomeSection_one,
        getIpincomeSection_four: getIpincomeSection_four,
        getProcedureIncomeSecition_two: getProcedureIncomeSecition_two,
        getIpincomeSection_five: getIpincomeSection_five,
        getIpincomeSection_six: getIpincomeSection_six,
      },
      collection: {
        getReceiptmasterSection_one: getReceiptmasterSection_one,
        getPharmacyCollection_four: getPharmacyCollection_four,
        getCollectionPortion_one: getCollectionPortion_one,
        getCollectionPortion_two: getCollectionPortion_two,
        getCollectionPortion_three: getCollectionPortion_three,
        getCollectionPortion_four: getCollectionPortion_four,
        getCollectionPortion_five: getCollectionPortion_five,
        getCollectionPortion_six: getCollectionPortion_six,
        getCollectionPortion_seven: getCollectionPortion_seven,
        getCollectionPortion_eight: getCollectionPortion_eight,
      },
      pharmacy: {
        getPharmacyCollection_One: getPharmacyCollection_One,
        getPharamcyReturnSection_one: getPharamcyReturnSection_one,
        getPharmacyCollection_Two: getPharmacyCollection_Two,
        getPharamcyCollection_three: getPharamcyCollection_three,
        getPharmacyReturnSection_three: getPharmacyReturnSection_three,
      },
      ipRefund: {
        getIpRefundDetl: getIpRefundDetl,
        getIpRefundDetl_one: getIpRefundDetl_one,
        getIpRefundReceiptDetlSection_Two: getIpRefundReceiptDetlSection_Two,
        getIpRefundDetlSection_three: getIpRefundDetlSection_three,
        getIpRefundDetlSection_four: getIpRefundDetlSection_four,
        getIpRefundDetlSection_five: getIpRefundDetlSection_five,
        getIpRefundDetlSection_six: getIpRefundDetlSection_six,
        getIpRefundDetlSection_seven: getIpRefundDetlSection_seven,
      },
      discount: {
        getDiscount: getDiscount,
        getDiscount_one: getDiscount_one,
        getDiscount_three: getDiscount_three,
        getTypeDiscount: getTypeDiscount,
      },
      ungrouped: {
        getUngroupedRoomDetl: getUngroupedRoomDetl,
      },
      masterData: {
        getMisincexpmast: getMisincexpmast,
        getMisincexpgroup: getMisincexpgroup,
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
    };

    return res.status(200).json({
      success: 1,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};

module.exports = getQmtReport;
