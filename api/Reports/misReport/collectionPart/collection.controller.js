const {
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
  misGroup,
  misGroupMast,
  creditInsuranceBillRefund,
} = require("./collection.service");

const {controllerHelper} = require("../../../../utls/controller-helperFun");

module.exports = {
  getadvanceCollection: controllerHelper(advanceCollection, "advance Collection"),
  getAdvanceRefund: controllerHelper(advanceRefund, "advance Refund"),
  getAdvanceSettled: controllerHelper(advanceSettled, "advance Settled"),
  getcollectionAgainstSaleTotal: controllerHelper(collectionAgainstSalePart1, "collection Against Sale Total"),
  getcollectionAgainstSaleDeduction: controllerHelper(collectionAgainstSalePart2, "collection Against Sale Deduction"),
  getComplimentory: controllerHelper(complimentory, "complimentory"),
  getcreditInsuranceBillCollection: controllerHelper(creditInsuranceBillCollection, "credit Insurance Bill Collection"),
  getcreditInsuranceBill: controllerHelper(creditInsuranceBill, "credit Insurance Bill"),
  getipConsolidatedDiscount: controllerHelper(ipConsolidatedDiscount, "ip Consolidated Discount"),
  getipPreviousDayDiscount: controllerHelper(ipPreviousDayDiscount, "ip Previous Day Discount"),
  getipPreviousDayCollection: controllerHelper(ipPreviousDayCollection, "ip Previous Day Collection"),
  getunsettledAmount: controllerHelper(unsettledAmount, "unsettled Amount"),
  getmisGroup: controllerHelper(misGroup, "mis Group"),
  getmisGroupMast: controllerHelper(misGroupMast, "mis Group Mast"),
  getcreditInsuranceBillRefund: controllerHelper(creditInsuranceBillRefund, "credit Insurance Bill Refund"),

  // getadvanceCollection:async (req, res) => {
  //   const body = req.body;
  //   advanceCollection(body, (err, results) => {
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
  // getAdvanceRefund: (req, res) => {
  //   const body = req.body;
  //   advanceRefund(body, (err, results) => {
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
  // getAdvanceSettled: (req, res) => {
  //   const body = req.body;
  //   advanceSettled(body, (err, results) => {
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
  // getcollectionAgainstSaleTotal: (req, res) => {
  //   const body = req.body;
  //   collectionAgainstSalePart1(body, (err, results) => {
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
  // getcollectionAgainstSaleDeduction: (req, res) => {
  //   const body = req.body;
  //   collectionAgainstSalePart2(body, (err, results) => {
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
  // getComplimentory: (req, res) => {
  //   const body = req.body;
  //   complimentory(body, (err, results) => {
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
  // getcreditInsuranceBillCollection: (req, res) => {
  //   const body = req.body;
  //   creditInsuranceBillCollection(body, (err, results) => {
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
  // getcreditInsuranceBill: (req, res) => {
  //   const body = req.body;
  //   creditInsuranceBill(body, (err, results) => {
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
  // getipConsolidatedDiscount: (req, res) => {
  //   const body = req.body;
  //   ipConsolidatedDiscount(body, (err, results) => {
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
  // getipPreviousDayDiscount: (req, res) => {
  //   const body = req.body;
  //   ipPreviousDayDiscount(body, (err, results) => {
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
  //       message: "get ip Previous Day Discount",
  //       data: results,
  //     });
  //   });
  // },
  // getipPreviousDayCollection: (req, res) => {
  //   const body = req.body;
  //   ipPreviousDayCollection(body, (err, results) => {
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
  //       message: "ip Previous Day Collection",
  //       data: results,
  //     });
  //   });
  // },
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
