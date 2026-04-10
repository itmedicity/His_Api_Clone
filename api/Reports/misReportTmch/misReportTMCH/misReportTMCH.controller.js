const {getTmcConnection} = require("../../../../config/oradbconfig");
const {insertIntoGTT} = require("../../../../utls/controller-helperFun");

const collectionTMCHService = require("./collectionTmch.service");
const pharmacyCollectionTMCHService = require("./pharmacyTmch.service");
const procedureTMCHService = require("./proincomeTmch.service");
const patientTypeDiscountTMCHService = require("./patientTypeTmch.service");
// FROM TSSH SERVICE FILE IMPORT
const pharmacyTsshService = require("../../misReportTssh/misReportTssh/pharmacyTssh.service");

const getCollectionAndIncomeMisReportTMCH = async (req, res) => {
  // console.log(req.body);
  let conn;
  try {
    conn = await getTmcConnection();
    const {from, to, ptno, grouped, phar, ipNoColl} = req.body;

    // console.log(ptno);
    // console.log("ptno" + ptno.length());

    const bind = {
      from: from,
      to: to,
      patient: ptno,
    };

    // INSERT IP NUMNER IN TO THE TEMPORARTY TABLE GTT_EXCLUDE_IP
    await insertIntoGTT(conn, ptno);

    // CALLING SERVICE FUNCTION
    const advanceCollection = await collectionTMCHService.advanceCollectionTmch(conn, bind);
    const advanceRefund = await collectionTMCHService.advanceRefundTmch(conn, bind);
    const advanceSettled = await collectionTMCHService.advanceSettledTmch(conn, bind);
    const collectionAgainstSalePart1 = await collectionTMCHService.collectionAgainstSalePart1Tmch(conn, bind);
    const collectionAgainstSalePart2 = await collectionTMCHService.collectionAgainstSalePart2Tmch(conn, bind);
    const complimentory = await collectionTMCHService.complimentory(conn, bind);
    const creditInsuranceBill = await collectionTMCHService.creditInsuranceBillTmch(conn, bind);
    const ipConsolidatedDiscount = await collectionTMCHService.ipConsolidatedDiscountTmch(conn, bind);

    // const ipPreviousDayDiscount = await collectionTMCHService.ipPreviousDayDiscount(conn, bind);
    // const ipPreviousDayDiscount = async (conn, bind) => {
    //   const results = await collectionTMCHService.ipPreviousDayDiscountTmch(conn, bind);
    //   if (Object.keys(results).length === 0) {
    //     return res.status(200).json({
    //       success: 2,
    //       message: "No Result",
    //       data: [],
    //     });
    //   }

    //   if (Array.isArray(results) && results.length > 0) {
    //     const ipNumber = results?.map((e) => e.IP_NO);
    //     const getResult = await collectionTMCHService.getIpNumberFromPreviousDayCollection(ipNumber);

    //     if (Object.keys(getResult).length === 0) {
    //       return res.status(200).json({
    //         success: 1,
    //         message: "ip Previous Day Collection",
    //         data: results,
    //       });
    //     }

    //     if (getResult) {
    //       let array = Object.values(JSON.parse(JSON.stringify(getResult)));
    //       const notInclPat = results?.filter((e) => !array?.map((e) => e.ip_no).includes(e.IP_NO));

    //       if (Object.keys(notInclPat).length === 0) {
    //         return res.status(200).json({
    //           success: 1,
    //           message: "ip Previous Day Collection",
    //           data: results,
    //         });
    //       } else {
    //         return res.status(200).json({
    //           success: 1,
    //           message: "ip Previous Day Collection",
    //           data: notInclPat,
    //         });
    //       }
    //     }
    //   }
    // };

    const ipPreviousDayDiscount = async (conn, bind) => {
      const results = await collectionTMCHService.ipPreviousDayDiscountTmch(conn, bind);

      if (!results || results.length === 0) {
        return [];
      }

      const ipNumber = results.map((e) => e.IP_NO);

      const getResult = await collectionTMCHService.getIpNumberFromPreviousDayCollection(ipNumber);

      if (!getResult || getResult.length === 0) {
        return results;
      }

      const array = Object.values(JSON.parse(JSON.stringify(getResult)));

      const notInclPat = results.filter((e) => !array.map((e) => e.ip_no).includes(e.IP_NO));

      return notInclPat.length === 0 ? results : notInclPat;
    };

    const ipPreviousDayDiscountResult = await ipPreviousDayDiscount(conn, bind);

    // const ipPreviousDayCollection = await collectionTMCHService.ipPreviousDayCollection(conn, bind);
    // const ipPreviousDayCollection = async (conn, bind) => {
    //   const results = await collectionTMCHService.ipPreviousDayCollectionTmch(conn, bind);

    //   if (Object.keys(results).length === 0) {
    //     return res.status(200).json({
    //       success: 2,
    //       message: "No Result",
    //       data: [],
    //     });
    //   }

    //   if (Array.isArray(results) && results.length > 0) {
    //     const ipNumber = results?.map((e) => e.IP_NO);

    //     const getResult = await getIpNumberFromPreviousDayCollection(ipNumber);

    //     if (Object.keys(getResult).length === 0) {
    //       return res.status(200).json({
    //         success: 1,
    //         message: "No Result",
    //         data: results,
    //       });
    //     }

    //     if (getResult) {
    //       let array = Object.values(JSON.parse(JSON.stringify(getResult)));
    //       const notInclPat = results?.filter((e) => !array?.map((e) => e.ip_no).includes(e.IP_NO));

    //       if (Object.keys(getResult).length === 0) {
    //         return res.status(200).json({
    //           success: 1,
    //           message: "ip Previous Day Collection",
    //           data: [],
    //         });
    //       } else {
    //         return res.status(200).json({
    //           success: 1,
    //           message: "ip Previous Day Collection",
    //           data: notInclPat,
    //         });
    //       }
    //     }
    //   }
    // };

    const ipPreviousDayCollection = async (conn, bind) => {
      const results = await collectionTMCHService.ipPreviousDayCollectionTmch(conn, bind);
      // console.log("previous day collection", results);

      if (!results || results.length === 0) {
        return [];
      }

      const ipNumber = results.map((e) => e.IP_NO);
      // console.log(ipNumber);
      const getResult = await collectionTMCHService.getIpNumberFromPreviousDayCollection(ipNumber);
      // console.log(getResult);
      if (!getResult || getResult.length === 0) {
        return results;
      }

      const array = Object.values(JSON.parse(JSON.stringify(getResult)));

      const notInclPat = results.filter((e) => !array.map((e) => e.ip_no).includes(e.IP_NO));

      return notInclPat.length === 0 ? [] : notInclPat;
    };

    const ipPreviousDayCollectionResult = await ipPreviousDayCollection(conn, bind);
    // console.log(ipPreviousDayCollectionResult, "ipPreviousDayCollectionResult");

    const unsettledAmount = await collectionTMCHService.unsettledAmount(conn, bind);
    const misGroupMast = await collectionTMCHService.misGroupMast(conn);
    const misGroup = await collectionTMCHService.misGroup(conn);
    const creditInsuranceBillRefund = await collectionTMCHService.creditInsuranceBillRefund(conn, bind);

    const procedurePart1 = await procedureTMCHService.proIncomePart1Tmch(conn, bind);
    const procedurePart2 = await procedureTMCHService.proIncomePart2Tmch(conn, bind);
    const procedurePart3 = await procedureTMCHService.proIncomePart3Tmch(conn, bind);
    const procedurePart4 = await procedureTMCHService.proIncomePart4Tmch(conn, bind);
    const theaterIncome = await procedureTMCHService.theaterIncomeTmch(conn, bind);
    const patientTypeDiscount = await patientTypeDiscountTMCHService.patientTypeDiscountTmch(conn, bind);
    // needs to be insert pharmacy ip number - pharma
    await conn.commit(); // clear GTT table ip_data
    await insertIntoGTT(conn, phar); // insert  pharmacy ip_no in  to the GTT temp table
    const pharmacyReturnPart1 = await pharmacyCollectionTMCHService.phamracyTmchReturnPart1(conn, bind);
    const pharmacyReturnPart2 = await pharmacyCollectionTMCHService.phamracyTmchReturnPart2(conn, bind);
    const pharmacyReturnPart3 = await pharmacyCollectionTMCHService.phamracyTmchReturnPart3(conn, bind);
    const pharmacySalePart1 = await pharmacyCollectionTMCHService.pharmacyTmchSalePart1(conn, bind);
    const pharmacySalePart2 = await pharmacyCollectionTMCHService.phamracyTmchSalePart2(conn, bind);
    const pharmacySalePart3 = await pharmacyCollectionTMCHService.phamracyTmchSalePart3(conn, bind);
    // await pharmacyTsshService.getTempTableList(conn, "before");
    /** Oracle coimmit for clear the GTT TEMPORORY TABLE IP_DATA AND INSERT GROUPED IP_NO **/
    await conn.commit(); // clear GTT table ip_data
    await insertIntoGTT(conn, grouped); // insert grouped ip_no in  to the GTT temp table
    // await pharmacyTsshService.getTempTableList(conn, "after"); // getTempTableList(conn);
    // pharmacy round off getting from tsssh service
    const pharmacyRoundOffTssh = await pharmacyTsshService.pharmacyRoundOffAmntTssh(conn, bind);
    const TmchGroupedReturnPart1 = await pharmacyTsshService.TmchGroupedReturnPart1(conn, bind);
    const TmchGroupedReturnPart2 = await pharmacyTsshService.TmchGroupedReturnPart2(conn, bind);
    const TmchGroupedTsshSalePart3 = await pharmacyTsshService.TmchGroupedTsshSalePart3(conn, bind);
    const TmchGroupedTsshReturnPart3 = await pharmacyTsshService.TmchGroupedTsshReturnPart3(conn, bind);
    const TmchGroupedRoundOffAmntTssh = await pharmacyTsshService.TmchGroupedRoundOffAmntTssh(conn, bind);
    await conn.commit(); // clear GTT table ip_data
    await insertIntoGTT(conn, ipNoColl); // insert grouped ip_no in  to the GTT temp table
    const creditInsuranceBillCollection = await collectionTMCHService.creditInsuranceBillCollectionTmch(conn, bind);

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
        ipPreviousDayDiscount: ipPreviousDayDiscountResult,
        ipPreviousDayCollection: ipPreviousDayCollectionResult,
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
      pharamcyTsshIncome: {
        TmchGroupedReturnPart1,
        // TmchGroupedReturnPart2,
        TmchGroupedTsshSalePart3,
        TmchGroupedTsshReturnPart3,
        TmchGroupedRoundOffAmntTssh,
      },
      patienttypeDisc: {
        patientTypeDiscount,
      },
      pharmacyRoundOffTssh,
    };

    // console.log(result);

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

module.exports = getCollectionAndIncomeMisReportTMCH;
