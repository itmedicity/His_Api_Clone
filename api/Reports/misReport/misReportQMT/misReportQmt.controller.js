const {oracledb, getTmcConnection} = require("../../../../config/oradbconfig");
const collectionQmtService = require("../collectionPart/collection.service");
const pharmacyCollectionQmtService = require("../incomePart/pharmacyincome/pharmacy.service");
const procedureQmtService = require("../incomePart/procedureIncome/proincome.service");
const patientTypeDiscountQmtService = require("../PatientType/patientType.service");

const getCollectionAndIncomeMisReportQMT = async (req, res) => {
  console.log(req.body);
  let conn;
  try {
    conn = await getTmcConnection();
    const {from, to} = req.body;

    const bind = {
      from: from,
      to: to,
    };

    console.log(bind);
    console.time("MIS_TOTAL_TIME");

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
    console.timeEnd("misReportQmt");
    const result = {
      mis: {
        misGroupMast,
        misGroup,
      },
      collection: {
        advanceCollection,
        advanceRefund,
        advanceSettled,
        collectionAgainstSalePart1,
        collectionAgainstSalePart2,
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

    // if (Array.isArray(data) && data.length === 0) {
    //   return res.status(200).json({
    //     success: 2,
    //     message: "No Result",
    //   });
    // }

    console.log(result);

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

/***
 * 
 * 
 * 
 *     // const [
    //   advanceCollection,
    //   advanceRefund,
    //   advanceSettled,
    //   collectionAgainstSalePart1,
    //   collectionAgainstSalePart2,
    //   complimentory,
    //   creditInsuranceBillCollection,
    //   creditInsuranceBill,
    //   ipConsolidatedDiscount,
    //   ipPreviousDayDiscount,
    //   ipPreviousDayCollection,
    //   unsettledAmount,
    //   misGroupMast,
    //   misGroup,
    //   creditInsuranceBillRefund,
    //   pharmacyReturnPart1,
    //   pharmacyReturnPart2,
    //   pharmacyReturnPart3,
    //   pharmacySalePart1,
    //   pharmacySalePart2,
    //   pharmacySalePart3,
    //   procedurePart1,
    //   procedurePart2,
    //   procedurePart3,
    //   procedurePart4,
    //   theaterIncome,
    //   patientTypeDiscount,
    // ] = await Promise.all([
    //   collectionQmtService.advanceCollection(conn, bind),
    //   collectionQmtService.advanceRefund(conn, bind),
    //   collectionQmtService.advanceSettled(conn, bind),
    //   collectionQmtService.collectionAgainstSalePart1(conn, bind),
    //   collectionQmtService.collectionAgainstSalePart2(conn, bind),
    //   collectionQmtService.complimentory(conn, bind),
    //   collectionQmtService.creditInsuranceBillCollection(conn, bind),
    //   collectionQmtService.creditInsuranceBill(conn, bind),
    //   collectionQmtService.ipConsolidatedDiscount(conn, bind),
    //   collectionQmtService.ipPreviousDayDiscount(conn, bind),
    //   collectionQmtService.ipPreviousDayCollection(conn, bind),
    //   collectionQmtService.unsettledAmount(conn, bind),
    //   collectionQmtService.misGroupMast(conn),
    //   collectionQmtService.misGroup(conn),
    //   collectionQmtService.creditInsuranceBillRefund(conn, bind),
    //   pharmacyCollectionQmtService.phamracyReturnPart1(conn, bind),
    //   pharmacyCollectionQmtService.phamracyReturnPart2(conn, bind),
    //   pharmacyCollectionQmtService.phamracyReturnPart3(conn, bind),
    //   pharmacyCollectionQmtService.pharmacySalePart1(conn, bind),
    //   pharmacyCollectionQmtService.phamracySalePart2(conn, bind),
    //   pharmacyCollectionQmtService.phamracySalePart3(conn, bind),
    //   procedureQmtService.proIncomePart1(conn, bind),
    //   procedureQmtService.proIncomePart2(conn, bind),
    //   procedureQmtService.proIncomePart3(conn, bind),
    //   procedureQmtService.proIncomePart4(conn, bind),
    //   procedureQmtService.theaterIncome(conn, bind),
    //   patientTypeDiscountQmtService.patientTypeDiscount(conn, bind),
    // ]);

 */
