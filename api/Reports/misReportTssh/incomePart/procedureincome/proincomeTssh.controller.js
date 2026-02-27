const {controllerHelper} = require("../../../../../utls/controller-helperFun");
const {proIncomePart1Tssh, proIncomePart2Tssh, proIncomePart3Tssh, proIncomePart4Tssh, theaterIncomeTssh} = require("./proincomeTssh.service");

module.exports = {
  getproIncomePart1Tssh: controllerHelper(proIncomePart1Tssh, "Procedure Income"),
  // getproIncomePart1Tssh: (req, res) => {
  //     const body = req.body;
  //     proIncomePart1Tssh(body, (err, results) => {
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
  getproIncomePart2Tssh: controllerHelper(proIncomePart2Tssh, "Procedure Income"),
  // getproIncomePart2Tssh: (req, res) => {
  //     const body = req.body;
  //     proIncomePart2Tssh(body, (err, results) => {
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
  getproIncomePart3Tssh: controllerHelper(proIncomePart3Tssh, "Procedure Income"),
  // getproIncomePart3Tssh: (req, res) => {
  //     const body = req.body;
  //     proIncomePart3Tssh(body, (err, results) => {
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
  getproIncomePart4Tssh: controllerHelper(proIncomePart4Tssh, "Procedure Income"),
  // getproIncomePart4Tssh: (req, res) => {
  //     const body = req.body;
  //     proIncomePart4Tssh(body, (err, results) => {
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
  gettheaterIncomeTssh: controllerHelper(theaterIncomeTssh, "Theater Income"),
  // gettheaterIncomeTssh: (req, res) => {
  //     const body = req.body;
  //     theaterIncomeTssh(body, (err, results) => {
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
