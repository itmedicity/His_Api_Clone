const {controllerHelper, controllerGETHelper} = require("../../../../utls/controller-helperFun");
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
  getadvanceCollectionTssh: controllerHelper(advanceCollectionTssh, "advance Collection"),
  // getadvanceCollectionTssh: (req, res) => {
  //   const body = req.body;
  //   advanceCollectionTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "advance Collection",
  //       data: results,
  //     });
  //   });
  // },
  getadvanceRefundTssh: controllerHelper(advanceRefundTssh, "advance Refund"),
  // getadvanceRefundTssh: (req, res) => {
  //   const body = req.body;
  //   advanceRefundTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "advance Refund",
  //       data: results,
  //     });
  //   });
  // },
  getadvanceSettledTssh: controllerHelper(advanceSettledTssh, "advance Settled"),
  // getadvanceSettledTssh: (req, res) => {
  //   const body = req.body;
  //   advanceSettledTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "advance Settled",
  //       data: results,
  //     });
  //   });
  // },
  getcollectionAgainstSalePart1Tssh: controllerHelper(collectionAgainstSalePart1Tssh, "collection Against Sale Total"),
  // getcollectionAgainstSalePart1Tssh: (req, res) => {
  //   const body = req.body;
  //   collectionAgainstSalePart1Tssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "get collection Against Sale Total",
  //       data: results,
  //     });
  //   });
  // },
  getcollectionAgainstSalePart2Tssh: controllerHelper(collectionAgainstSalePart2Tssh, "collection Against Sale Deduction"),
  // getcollectionAgainstSalePart2Tssh: (req, res) => {
  //   const body = req.body;
  //   collectionAgainstSalePart2Tssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "get collection Against Sale Deduction",
  //       data: results,
  //     });
  //   });
  // },
  getcomplimentoryTssh: controllerHelper(complimentoryTssh, "complimentory"),
  // getcomplimentoryTssh: (req, res) => {
  //   const body = req.body;
  //   complimentoryTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "complimentory",
  //       data: results,
  //     });
  //   });
  // },
  getcreditInsuranceBillCollectionTssh: controllerHelper(creditInsuranceBillCollectionTssh, "credit Insurance Bill Collection"),
  // getcreditInsuranceBillCollectionTssh: (req, res) => {
  //   const body = req.body;
  //   creditInsuranceBillCollectionTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "credit Insurance Bill Collection",
  //       data: results,
  //     });
  //   });
  // },
  getcreditInsuranceBillTssh: controllerHelper(creditInsuranceBillTssh, "credit Insurance Bill"),
  // getcreditInsuranceBillTssh: (req, res) => {
  //   const body = req.body;
  //   creditInsuranceBillTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "credit Insurance Bill",
  //       data: results,
  //     });
  //   });
  // },
  getipConsolidatedDiscountTssh: controllerHelper(ipConsolidatedDiscountTssh, "ip Consolidated Discount"),
  // getipConsolidatedDiscountTssh: (req, res) => {
  //   const body = req.body;
  //   ipConsolidatedDiscountTssh(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "ip Consolidated Discount",
  //       data: results,
  //     });
  //   });
  // },

  getipPreviousDayDiscountTssh: async (req, res) => {
    try {
      const body = req.body;
      const results = await ipPreviousDayDiscountTssh(body);
      if (Object.keys(results).length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      const ipNumber = results?.map((e) => e.IP_NO);
      let datas = {
        ipno: ipNumber,
        group: body.groupIdForPrevious,
      };

      const getResult = await getIpNumberFromPreviousDayCollection(datas);

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
    } catch (err) {
      return res.status(200).json({
        success: 0,
        message: err.message || "Something went wrong- line 247",
      });
    }
    // ipPreviousDayDiscountTssh(body, (err, results) => {
    //   if (err) {
    //   }

    //   if (Object.keys(results).length === 0) {
    //   }

    //   if (results) {
    //     const ipNumber = results?.map((e) => e.IP_NO);

    //     let datas = {
    //       ipno: ipNumber,
    //       group: body.groupIdForPrevious,
    //     };
    //   }
    // });
  },
  getipPreviousDayCollectionTssh: async (req, res) => {
    try {
      const body = req.body;
      const results = await ipPreviousDayCollectionTssh(body);
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

        const getResult = await getIpNumberFromPreviousDayCollection(datas);

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
      }
    } catch (err) {
      return res.status(200).json({
        success: 0,
        message: err.message,
      });
    }
  },
  getunsettledAmount: controllerHelper(unsettledAmount, "Unsettled Amount"),
  // getunsettledAmount: (req, res) => {
  //   const body = req.body;
  //   unsettledAmount(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "Unsettled Amount",
  //       data: results,
  //     });
  //   });
  // },
  misGroup: controllerGETHelper(misGroup, "mis group master"),
  // misGroup: (req, res) => {
  //   misGroup((err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "mis group master",
  //       data: results,
  //     });
  //   });
  // },
  misGroupMast: controllerGETHelper(misGroupMast, "mis group master"),
  // misGroupMast: (req, res) => {
  //   misGroupMast((err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "mis group master",
  //       data: results,
  //     });
  //   });
  // },
  getcreditInsuranceBillRefund: controllerHelper(creditInsuranceBillRefund, "credit Insurance Bill"),
  // getcreditInsuranceBillRefund: (req, res) => {
  //   const body = req.body;
  //   creditInsuranceBillRefund(body, (err, results) => {
  //     if (err) {
  //       return res.status(200).json({
  //         success: 0,
  //         message: err.message,
  //       });
  //     }
  //     if (Object.keys(results).length === 0) {
  //       return res.status(200).json({
  //         success: 2,
  //         message: "No Result",
  //         data: [],
  //       });
  //     }
  //     return res.status(200).json({
  //       success: 1,
  //       message: "credit Insurance Bill",
  //       data: results,
  //     });
  //   });
  // },
};
