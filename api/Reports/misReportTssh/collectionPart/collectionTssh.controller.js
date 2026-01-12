const {
  advanceCollectionTssh,
  advanceRefundTssh,
  advanceSettledTssh,
  collectionAgainstSalePart1Tssh,
  collectionAgainstSalePart2Tssh,
  complimentoryTssh,
  creditInsuranceBillCollectionTssh,
  creditInsuranceBillTssh,
  ipConsolidatedDiscountTssh,
  ipPreviousDayDiscountTssh,
  ipPreviousDayCollectionTssh,
  unsettledAmount,
  misGroupMast,
  misGroup,
  creditInsuranceBillRefund,
  getIpNumberFromPreviousDayCollection,
} = require("./collectionTssh.service");

module.exports = {
  getadvanceCollectionTssh: (req, res) => {
    const body = req.body;
    advanceCollectionTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "advance Collection",
        data: results,
      });
    });
  },
  getadvanceRefundTssh: (req, res) => {
    const body = req.body;
    advanceRefundTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "advance Refund",
        data: results,
      });
    });
  },
  getadvanceSettledTssh: (req, res) => {
    const body = req.body;
    advanceSettledTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "advance Settled",
        data: results,
      });
    });
  },
  getcollectionAgainstSalePart1Tssh: (req, res) => {
    const body = req.body;
    collectionAgainstSalePart1Tssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "get collection Against Sale Total",
        data: results,
      });
    });
  },
  getcollectionAgainstSalePart2Tssh: (req, res) => {
    const body = req.body;
    collectionAgainstSalePart2Tssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "get collection Against Sale Deduction",
        data: results,
      });
    });
  },
  getcomplimentoryTssh: (req, res) => {
    const body = req.body;
    complimentoryTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "complimentory",
        data: results,
      });
    });
  },
  getcreditInsuranceBillCollectionTssh: (req, res) => {
    const body = req.body;
    creditInsuranceBillCollectionTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill Collection",
        data: results,
      });
    });
  },
  getcreditInsuranceBillTssh: (req, res) => {
    const body = req.body;
    creditInsuranceBillTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill",
        data: results,
      });
    });
  },
  getipConsolidatedDiscountTssh: (req, res) => {
    const body = req.body;
    ipConsolidatedDiscountTssh(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "ip Consolidated Discount",
        data: results,
      });
    });
  },
  getipPreviousDayDiscountTssh: (req, res) => {
    const body = req.body;
    ipPreviousDayDiscountTssh(body, (err, results) => {
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
          data: [],
        });
      }

      if (results) {
        const ipNumber = results?.map((e) => e.IP_NO);

        let datas = {
          ipno: ipNumber,
          group: body.groupIdForPrevious,
        };

        getIpNumberFromPreviousDayCollection(datas, (err, getResult) => {
          if (err) {
            return res.status(200).json({
              success: 0,
              message: err.message,
            });
          }
          if (Object.keys(getResult).length === 0) {
            return res.status(200).json({
              success: 2,
              message: "No Result",
              data: [],
            });
          }

          if (getResult) {
            const notInclPat = results?.filter((e) => getResult?.find((v) => v.ip_no === e.IP_NO));
            if (Object.keys(getResult).length === 0) {
              return res.status(200).json({
                success: 1,
                message: "ip Previous Day Collection",
                data: [],
              });
            } else {
              return res.status(200).json({
                success: 1,
                message: "ip Previous Day Collection",
                data: notInclPat,
              });
            }
          }
        });
      }
    });
  },
  getipPreviousDayCollectionTssh: (req, res) => {
    const body = req.body;
    ipPreviousDayCollectionTssh(body, (err, results) => {
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
          data: [],
        });
      }
      if (results) {
        const ipNumber = results?.map((e) => e.IP_NO);
        let datas = {
          ipno: ipNumber,
          group: body.groupIdForPrevious,
        };

        getIpNumberFromPreviousDayCollection(datas, (err, getResult) => {
          if (err) {
            return res.status(200).json({
              success: 0,
              message: err.message,
            });
          }
          if (Object.keys(getResult).length === 0) {
            return res.status(200).json({
              success: 2,
              message: "No Result",
              data: [],
            });
          }

          if (getResult) {
            const notInclPat = results?.filter((e) => getResult?.find((v) => v.ip_no === e.IP_NO));
            if (Object.keys(getResult).length === 0) {
              return res.status(200).json({
                success: 1,
                message: "ip Previous Day Collection",
                data: [],
              });
            } else {
              return res.status(200).json({
                success: 1,
                message: "ip Previous Day Collection",
                data: notInclPat,
              });
            }
          }
        });
      }
    });
  },
  getunsettledAmount: (req, res) => {
    const body = req.body;
    unsettledAmount(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Unsettled Amount",
        data: results,
      });
    });
  },
  misGroup: (req, res) => {
    misGroup((err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "mis group master",
        data: results,
      });
    });
  },
  misGroupMast: (req, res) => {
    misGroupMast((err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "mis group master",
        data: results,
      });
    });
  },
  getcreditInsuranceBillRefund: (req, res) => {
    const body = req.body;
    creditInsuranceBillRefund(body, (err, results) => {
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
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill",
        data: results,
      });
    });
  },
};
