// @ts-nocheck
const {controllerHelper} = require("../../../../../utls/controller-helperFun");
const {
  creditInsuranceBillDetlPart1,
  creditInsuranceBillDetlPart2,
  creditInsuranceBillDetlPart3,
  creditInsuranceBillDetlPart4,
  creditInsuranceBillDetlPart5,
  creditInsuranceBillDetlPart6,
  unSettledAmountDetl,
  advanceCollection,
  creditInsuranceBillCollection1,
  creditInsuranceBillCollection2,
} = require("../collectionPart/misCollectionPart.service");

module.exports = {
  creditInsuranceBillDetlPart1: controllerHelper(creditInsuranceBillDetlPart1, "creditInsuranceBillDetlPart1"),
  //   creditInsuranceBillDetlPart1: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart1(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart1",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillDetlPart2: controllerHelper(creditInsuranceBillDetlPart2, "creditInsuranceBillDetlPart2"),
  // creditInsuranceBillDetlPart2: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart2(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart2",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillDetlPart3: controllerHelper(creditInsuranceBillDetlPart3, "creditInsuranceBillDetlPart3"),
  // creditInsuranceBillDetlPart3: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart3(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart3",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillDetlPart4: controllerHelper(creditInsuranceBillDetlPart4, "creditInsuranceBillDetlPart4"),
  // creditInsuranceBillDetlPart4: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart4(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart4",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillDetlPart5: controllerHelper(creditInsuranceBillDetlPart5, "creditInsuranceBillDetlPart5"),
  // creditInsuranceBillDetlPart5: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart5(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart5",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillDetlPart6: controllerHelper(creditInsuranceBillDetlPart6, "creditInsuranceBillDetlPart6"),
  // creditInsuranceBillDetlPart6: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillDetlPart6(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillDetlPart6",
  //         data: results,
  //       });
  //     });
  //   },
  unSettledAmountDetl: controllerHelper(unSettledAmountDetl, "unSettledAmountDetl"),
  // unSettledAmountDetl: (req, res) => {
  //     const body = req.body;
  //     unSettledAmountDetl(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "unSettledAmountDetl",
  //         data: results,
  //       });
  //     });
  //   },
  advanceCollection: controllerHelper(advanceCollection, "advanceCollection"),
  // advanceCollection: (req, res) => {
  //     const body = req.body;
  //     advanceCollection(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "advanceCollection",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillCollection1: controllerHelper(creditInsuranceBillCollection1, "creditInsuranceBillCollection1"),
  // creditInsuranceBillCollection1: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillCollection1(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillCollection1",
  //         data: results,
  //       });
  //     });
  //   },
  creditInsuranceBillCollection2: controllerHelper(creditInsuranceBillCollection2, "creditInsuranceBillCollection2"),
  // creditInsuranceBillCollection2: (req, res) => {
  //     const body = req.body;
  //     creditInsuranceBillCollection2(body, (err, results) => {
  //       if (err) {
  //         return res.status(200).json({
  //           success: 0,
  //           message: err.message,
  //         });
  //       }
  //       if (Object.keys(results).length === 0) {
  //         return res.status(200).json({
  //           success: 2,
  //           message: "No Result",
  //           data: [],
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "creditInsuranceBillCollection2",
  //         data: results,
  //       });
  //     });
  //   },
};
