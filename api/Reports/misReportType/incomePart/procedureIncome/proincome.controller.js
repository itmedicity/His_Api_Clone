const {controllerHelper} = require("../../../../../utls/controller-helperFun");
const {proIncomePart1, proIncomePart2, proIncomePart3, proIncomePart4, theaterIncome} = require("./proincome.service");

module.exports = {
  getproIncomePart1: controllerHelper(proIncomePart1, "Procedure Income"),
  getproIncomePart2: controllerHelper(proIncomePart2, "Procedure Income"),
  getproIncomePart3: controllerHelper(proIncomePart3, "Procedure Income"),
  getproIncomePart4: controllerHelper(proIncomePart4, "Procedure Income"),
  gettheaterIncome: controllerHelper(theaterIncome, "Theater Income"),
  //   getproIncomePart1: (req, res) => {
  //     const body = req.body;
  //     proIncomePart1(body, (err, results) => {
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
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "Procedure Income",
  //         data: results,
  //       });
  //     });
  //   },
  //   getproIncomePart2: (req, res) => {
  //     const body = req.body;
  //     proIncomePart2(body, (err, results) => {
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
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "Procedure Income",
  //         data: results,
  //       });
  //     });
  //   },
  //   getproIncomePart3: (req, res) => {
  //     const body = req.body;
  //     proIncomePart3(body, (err, results) => {
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
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "Procedure Income",
  //         data: results,
  //       });
  //     });
  //   },
  //   getproIncomePart4: (req, res) => {
  //     const body = req.body;
  //     proIncomePart4(body, (err, results) => {
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
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "Procedure Income",
  //         data: results,
  //       });
  //     });
  //   },
  //   gettheaterIncome: (req, res) => {
  //     const body = req.body;
  //     theaterIncome(body, (err, results) => {
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
  //         });
  //       }
  //       return res.status(200).json({
  //         success: 1,
  //         message: "Theater income",
  //         data: results,
  //       });
  //     });
  //   },
};
