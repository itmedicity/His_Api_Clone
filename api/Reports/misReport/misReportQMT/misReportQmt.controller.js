const {getTmcConnection} = require("../../../../config/oradbconfig");
const collectionQmtService = require("../collectionPart/collection.service");
const pharmacyCollectionQmtService = require("../incomePart/pharmacyincome/pharmacy.service");
const procedureQmtService = require("../incomePart/procedureIncome/proincome.service");
const patientTypeDiscountQmtService = require("../PatientType/patientType.service");

const getCollectionAndIncomeMisReportQMT = async (req, res) => {
  // console.log(req.body);
  let conn;
  try {
    conn = await getTmcConnection();
    const {from, to} = req.body;

    const bind = {
      from: from,
      to: to,
    };

    const advanceCollection = await collectionQmtService.advanceCollection(conn, bind);
    const advanceRefund = await collectionQmtService.advanceRefund(conn, bind);
    const advanceSettled = await collectionQmtService.advanceSettled(conn, bind);
    const collectionAgainstSalePart1 = await collectionQmtService.collectionAgainstSalePart1(conn, bind);
    const collectionAgainstSalePart2 = await collectionQmtService.collectionAgainstSalePart2(conn, bind);
    const complimentory = await collectionQmtService.complimentory(conn, bind);
    const creditInsuranceBillCollection = await collectionQmtService.creditInsuranceBillCollection(conn, bind);
    const creditInsuranceBill = await collectionQmtService.creditInsuranceBill(conn, bind);
    const ipConsolidatedDiscount = await collectionQmtService.ipConsolidatedDiscount(conn, bind);
    const ipPreviousDayDiscount = await collectionQmtService.ipPreviousDayDiscount(conn, bind);
    const ipPreviousDayCollection = await collectionQmtService.ipPreviousDayCollection(conn, bind);
    const unsettledAmount = await collectionQmtService.unsettledAmount(conn, bind);
    const misGroupMast = await collectionQmtService.misGroupMast(conn);
    const misGroup = await collectionQmtService.misGroup(conn);
    const creditInsuranceBillRefund = await collectionQmtService.creditInsuranceBillRefund(conn, bind);
    const pharmacyReturnPart1 = await pharmacyCollectionQmtService.phamracyReturnPart1(conn, bind);
    const pharmacyReturnPart2 = await pharmacyCollectionQmtService.phamracyReturnPart2(conn, bind);
    const pharmacyReturnPart3 = await pharmacyCollectionQmtService.phamracyReturnPart3(conn, bind);
    const pharmacySalePart1 = await pharmacyCollectionQmtService.pharmacySalePart1(conn, bind);
    const pharmacySalePart2 = await pharmacyCollectionQmtService.phamracySalePart2(conn, bind);
    const pharmacySalePart3 = await pharmacyCollectionQmtService.phamracySalePart3(conn, bind);
    const procedurePart1 = await procedureQmtService.proIncomePart1(conn, bind);
    const procedurePart2 = await procedureQmtService.proIncomePart2(conn, bind);
    const procedurePart3 = await procedureQmtService.proIncomePart3(conn, bind);
    const procedurePart4 = await procedureQmtService.proIncomePart4(conn, bind);
    const theaterIncome = await procedureQmtService.theaterIncome(conn, bind);
    const patientTypeDiscount = await patientTypeDiscountQmtService.patientTypeDiscount(conn, bind);
    // console.timeEnd("misReportQmt");
    const result = {
      mis: {
        misGroupMast,
        misGroup,
      },
      collection: {
        advanceCollection,
        advanceRefund,
        advanceSettled,
        collectionAgainstSalesTotal: collectionAgainstSalePart1,
        collectionAgainstSalesDeduction: collectionAgainstSalePart2,
        complimentory,
        creditInsuranceBillCollection,
        creditInsuranceBill,
        ipConsolidatedDiscount,
        ipPreviousDayDiscount,
        ipPreviousDayCollection,
        unsettledAmount,
        creditInsuranceBillRefund,
      },
      income: {
        procedurePart1,
        procedurePart2,
        procedurePart3,
        procedurePart4,
        theaterIncome,
      },
      pharamcyIncome: {
        pharmacyReturnPart1,
        pharmacyReturnPart2,
        pharmacyReturnPart3,
        pharmacySalePart1,
        pharmacySalePart2,
        pharmacySalePart3,
      },
      patienttypeDisc: {
        patientTypeDiscount,
      },
    };

    return res.status(200).json({
      success: 1,
      message: "successfully get mis-qmt-reports",
      data: result,
    });
  } catch (error) {
    console.log("MIS ERROR:", error);
    return res.status(200).json({
      success: 0,
      message: error.message || "Unexpected Error",
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

module.exports = getCollectionAndIncomeMisReportQMT;
