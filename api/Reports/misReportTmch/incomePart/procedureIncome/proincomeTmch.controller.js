const {controllerHelper} = require("../../../../../utls/controller-helperFun");
const {proIncomePart1Tmch, proIncomePart2Tmch, proIncomePart3Tmch, proIncomePart4Tmch, theaterIncomeTmch} = require("./proincomeTmch.service");

module.exports = {
  getproIncomePart1Tmch: controllerHelper(proIncomePart1Tmch, "Procedure Income"),
  // getproIncomePart1Tmch: (req, res) => {
  //     const body = req.body;
  //     proIncomePart1Tmch(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result"
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "Procedure Income",
  //             data: results
  //         });
  //     })
  // },
  getproIncomePart2Tmch: controllerHelper(proIncomePart2Tmch, "Procedure Income"),
  // getproIncomePart2Tmch: (req, res) => {
  //     const body = req.body;
  //     proIncomePart2Tmch(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result"
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "Procedure Income",
  //             data: results
  //         });
  //     })
  // },
  getproIncomePart3Tmch: controllerHelper(proIncomePart3Tmch, "Procedure Income"),
  // getproIncomePart3Tmch: (req, res) => {
  //     const body = req.body;
  //     proIncomePart3Tmch(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result"
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "Procedure Income",
  //             data: results
  //         });
  //     })
  // },
  getproIncomePart4Tmch: controllerHelper(proIncomePart4Tmch, "Procedure Income"),
  // getproIncomePart4Tmch: (req, res) => {
  //     const body = req.body;
  //     proIncomePart4Tmch(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result"
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "Procedure Income",
  //             data: results
  //         });
  //     })
  // },
  gettheaterIncomeTmch: controllerHelper(theaterIncomeTmch, "Theater Income"),
  // gettheaterIncomeTmch: (req, res) => {
  //     const body = req.body;
  //     theaterIncomeTmch(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result"
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "Theater income",
  //             data: results
  //         });
  //     })
  // },
};
