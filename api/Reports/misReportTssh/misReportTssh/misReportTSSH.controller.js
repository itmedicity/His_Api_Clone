const {getTmcConnection} = require("../../../../config/oradbconfig");
const {insertIntoGTT} = require("../../../../utls/controller-helperFun");

const collectionTSSHService = require("./collectionTssh.service");
const pharmacyCollectionTSSHService = require("./pharmacyTssh.service");
const procedureTSSHService = require("./proincomeTssh.service");
const patientTypeDiscountTSSHService = require("./patientTypeTssh.service");
// FROM TSSH SERVICE FILE IMPORT
const pharmacyTsshService = require("../misReportTssh/pharmacyTssh.service");

const getCollectionAndIncomeMisReportTSSH = async (req, res) => {
  // console.log(req.body);
  let conn;
  try {
    conn = await getTmcConnection();
    const {from, to, ptno, grouped, phar, group, groupIdForPrevious, ipNoColl} = req.body;

    // console.log(ptno);

    const bind = {
      from: from,
      to: to,
      patient: ptno,
      groupIdForPrevious: groupIdForPrevious,
    };

    // INSERT IP NUMNER IN TO THE TEMPORARTY TABLE GTT_EXCLUDE_IP
    await insertIntoGTT(conn, ptno);

    // CALLING SERVICE FUNCTION
    const advanceCollection = await collectionTSSHService.advanceCollectionTssh(conn, bind);
    const advanceRefund = await collectionTSSHService.advanceRefundTssh(conn, bind);
    const advanceSettled = await collectionTSSHService.advanceSettledTssh(conn, bind);
    const collectionAgainstSalePart1 = await collectionTSSHService.collectionAgainstSalePart1Tssh(conn, bind);
    const collectionAgainstSalePart2 = await collectionTSSHService.collectionAgainstSalePart2Tssh(conn, bind);
    const complimentory = await collectionTSSHService.complimentoryTssh(conn, bind);
    const creditInsuranceBill = await collectionTSSHService.creditInsuranceBillTssh(conn, bind);
    const ipConsolidatedDiscount = await collectionTSSHService.ipConsolidatedDiscountTssh(conn, bind);

    const ipPreviousDayDiscount = async (conn, bind) => {
      const results = await collectionTSSHService.ipPreviousDayDiscountTssh(conn, bind);
      if (!results || results.length === 0) {
        return [];
      }
      const ipNumber = results.map((e) => e.IP_NO);
      let postData = {
        ipno: ipNumber,
        group: bind.groupIdForPrevious,
      };
      const getResult = await collectionTSSHService.getIpNumberFromPreviousDayCollection(postData);
      if (!getResult || getResult.length === 0) {
        return [];
      }

      const ipSet = new Set(getResult.map((e) => e.ip_no));
      const notInclPat = results.filter((e) => ipSet.has(e.IP_NO));
      //   const array = Object.values(JSON.parse(JSON.stringify(getResult)));
      //   const notInclPat = results.filter((e) => !array.map((e) => e.ip_no).includes(e.IP_NO));
      return notInclPat;
    };

    const ipPreviousDayCollection = async (conn, bind) => {
      const results = await collectionTSSHService.ipPreviousDayCollectionTssh(conn, bind);
      // console.log("previous day collection", results);
      if (!results || results.length === 0) {
        return [];
      }

      // console.log(results);
      const ipNumber = results.map((e) => e.IP_NO);
      let postData = {
        ipno: ipNumber,
        group: bind.groupIdForPrevious,
      };
      // console.log(ipNumber);
      const getResult = await collectionTSSHService.getIpNumberFromPreviousDayCollection(postData);
      if (!getResult || getResult.length === 0) {
        return [];
      }

      // const array = Object.values(JSON.parse(JSON.stringify(getResult)));
      // const notInclPat = results.filter((e) => !array.map((e) => e.ip_no).includes(e.IP_NO));
      const notInclPat = results?.filter((e) => getResult?.find((v) => v.ip_no === e.IP_NO));
      // const ipSet = new Set(getResult.map((e) => e.ip_no));
      // const notInclPat = results.filter((e) => ipSet.has(e.IP_NO));
      // console.log(notInclPat);

      //   return notInclPat.length === 0 ? results : notInclPat;
      return notInclPat;
    };

    const ipPreviousDayDiscountResult = await ipPreviousDayDiscount(conn, bind);
    const ipPreviousDayCollectionResult = await ipPreviousDayCollection(conn, bind);

    const unsettledAmount = await collectionTSSHService.unsettledAmount(conn, bind);
    const misGroupMast = await collectionTSSHService.misGroupMast(conn);
    const misGroup = await collectionTSSHService.misGroup(conn);
    const creditInsuranceBillRefund = await collectionTSSHService.creditInsuranceBillRefund(conn, bind);
    const procedurePart1 = await procedureTSSHService.proIncomePart1Tssh(conn, bind);
    const procedurePart2 = await procedureTSSHService.proIncomePart2Tssh(conn, bind);
    const procedurePart3 = await procedureTSSHService.proIncomePart3Tssh(conn, bind);
    const procedurePart4 = await procedureTSSHService.proIncomePart4Tssh(conn, bind);
    const theaterIncome = await procedureTSSHService.theaterIncomeTssh(conn, bind);
    const patientTypeDiscount = await patientTypeDiscountTSSHService.patientTypeDiscountTssh(conn, bind);
    /**************************************************************************************************************completed*/
    // needs to be insert pharmacy ip number - pharma
    // await conn.commit(); // clear GTT table ip_data
    // await insertIntoGTT(conn, phar); // insert  pharmacy ip_no in  to the GTT temp table
    // const pharmacySalePart1 = await pharmacyCollectionTSSHService.pharmacyTsshSalePart1(conn, bind);
    const pharmacySalePart2 = await pharmacyCollectionTSSHService.phamracyTsshSalePart2(conn, bind);
    const pharmacySalePart3 = await pharmacyCollectionTSSHService.phamracyTsshSalePart3(conn, bind);
    const pharmacyReturnPart1 = await pharmacyCollectionTSSHService.phamracyTsshReturnPart1(conn, bind);
    const pharmacyReturnPart2 = await pharmacyCollectionTSSHService.phamracyTsshReturnPart2(conn, bind);
    const pharmacyReturnPart3 = await pharmacyCollectionTSSHService.phamracyTsshReturnPart3(conn, bind);
    const pharmacyRoundOffTssh = await pharmacyCollectionTSSHService.pharmacyRoundOffAmntTssh(conn, bind);
    // await pharmacyTsshService.getTempTableList(conn, "before");
    /** Oracle coimmit for clear the GTT TEMPORORY TABLE IP_DATA AND INSERT GROUPED IP_NO **/
    // await conn.commit(); // clear GTT table ip_data
    // await insertIntoGTT(conn, grouped); // insert grouped ip_no in  to the GTT temp table
    // await pharmacyTsshService.getTempTableList(conn, "after"); // getTempTableList(conn);
    // pharmacy round off getting from tsssh service
    const TmchGroupedReturnPart1 = await pharmacyTsshService.TmchGroupedReturnPart1(conn, bind);
    // const TmchGroupedReturnPart2 = await pharmacyTsshService.TmchGroupedReturnPart2(conn, bind);
    const TmchGroupedTsshSalePart3 = await pharmacyTsshService.TmchGroupedTsshSalePart3(conn, bind);
    const TmchGroupedTsshReturnPart3 = await pharmacyTsshService.TmchGroupedTsshReturnPart3(conn, bind);
    const TmchGroupedRoundOffAmntTssh = await pharmacyTsshService.TmchGroupedRoundOffAmntTssh(conn, bind);
    await conn.commit();
    await insertIntoGTT(conn, ipNoColl);
    const creditInsuranceBillCollection = await collectionTSSHService.creditInsuranceBillCollectionTssh(conn, bind);

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
        // pharmacySalePart1,
        pharmacySalePart2,
        pharmacySalePart3,
        pharmacyRoundOffTssh,
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

module.exports = getCollectionAndIncomeMisReportTSSH;
