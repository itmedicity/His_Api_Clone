const {
  pharmacyTsshSalePart1,
  phamracyTsshReturnPart1,
  phamracyTsshSalePart2,
  phamracyTsshReturnPart2,
  phamracyTsshSalePart3,
  phamracyTsshReturnPart3,
  pharmacyRoundOffAmntTssh,
  TmchGroupedSalePart1,
  TmchGroupedReturnPart1,
  TmchGroupedSalePart2,
  TmchGroupedReturnPart2,
  TmchGroupedTsshSalePart3,
  TmchGroupedTsshReturnPart3,
  TmchGroupedRoundOffAmntTssh,
} = require("./pharmacyTssh.service");

module.exports = {
  getpharmacyTsshSalePart1: (req, res) => {
    const body = req.body;
    pharmacyTsshSalePart1(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  getphamracyTsshReturnPart1: (req, res) => {
    const body = req.body;
    phamracyTsshReturnPart1(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  getphamracyTsshSalePart2: (req, res) => {
    const body = req.body;
    phamracyTsshSalePart2(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  getphamracyTsshReturnPart2: (req, res) => {
    const body = req.body;
    phamracyTsshReturnPart2(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  getphamracyTsshSalePart3: (req, res) => {
    const body = req.body;
    phamracyTsshSalePart3(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  getphamracyTsshReturnPart3: (req, res) => {
    const body = req.body;
    phamracyTsshReturnPart3(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Pharmacy Sale",
        data: results,
      });
    });
  },
  pharmacyRoundOffAmntTssh: (req, res) => {
    const body = req.body;
    pharmacyRoundOffAmntTssh(body, (err, results) => {
      if (err) {
        return res.status(200).json({
          success: 0,
          message: err.message,
        });
      }
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Round Off",
        data: results,
      });
    });
  },
  /*
   *
   * TMCH GROUPED REPORTS
   *
   *
   */
  pharmacyGroupedAmntForTmch: async (req, res) => {
    try {
      const body = req.body;
      // const pharmaGroup1 = await
      // const pharmaGroup2 = await
      // const pharmaGroup3 = await
      // const pharmaGroup4 = await
      // const pharmaGroup5 = await
      // const pharmaGroup6 = await
      // const pharmaGroup7 = await

      const [pharmaGroup1, pharmaGroup2, pharmaGroup3, pharmaGroup4, pharmaGroup5, pharmaGroup6, pharmaGroup7] = await Promise.all([
        TmchGroupedSalePart1(body),
        TmchGroupedReturnPart1(body),
        TmchGroupedSalePart2(body),
        TmchGroupedReturnPart2(body),
        TmchGroupedTsshSalePart3(body),
        TmchGroupedTsshReturnPart3(body),
        TmchGroupedRoundOffAmntTssh(body),
      ]);
      const result = {
        result1: pharmaGroup1?.success === 1 ? pharmaGroup1?.data : [],
        result2: pharmaGroup2?.success === 1 ? pharmaGroup2?.data : [],
        result3: pharmaGroup3?.success === 1 ? pharmaGroup3?.data : [],
        result4: pharmaGroup4?.success === 1 ? pharmaGroup4?.data : [],
        result5: pharmaGroup5?.success === 1 ? pharmaGroup5?.data : [],
        result6: pharmaGroup6?.success === 1 ? pharmaGroup6?.data : [],
        // result7 : pharmaGroup7?.success === 1 ? pharmaGroup7?.data : [],
      };

      const totals = {AMT: 0, GROSSAMT: 0, DISCOUNT: 0, COMP: 0, TAX: 0};

      Object.values(result)
        .flat()
        .forEach((item) => {
          totals.AMT += Number(item.AMT ?? 0);
          totals.GROSSAMT += Number(item.GROSSAMT ?? 0);
          totals.DISCOUNT += Number(item.DISCOUNT ?? 0);
          totals.COMP += Number(item.COMP ?? 0);
          totals.TAX += Number(item.TAX ?? 0);
        });

      return res.status(200).json({
        success: 1,
        message: "PharmacyGroupedTmchAmount",
        data: totals,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
        data: [],
      });
    }
  },
};
