const {controllerHelper} = require("../../../../../utls/controller-helperFun");
const {
  bedIncome,
  nsIncome,
  roomRentIncome,
  otherIncome,
  consultingIncome,
  anesthetiaIncome,
  surgeonIncome,
  theaterIncome,
  cardiologyIncome,
  disPosibleItemIncome,
  icuIncome,
  icuprocedureIncome,
  radiologyIncome,
  laboratoryIncome,
  mriIncome,
  dietIncome,
  pharmacyIncomePart1,
  pharmacyIncomePart2,
  pharmacyIncomePart3,
  pharmacyIncomePart4,
} = require("../incomePart/income.service");

module.exports = {
  bedIncome: controllerHelper(bedIncome, "bedIncome"),
  // bedIncome: (req, res) => {
  //     const body = req.body;
  //     bedIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "bedIncome",
  //             data: results
  //         });
  //     })
  // },
  nsIncome: controllerHelper(nsIncome, "nsIncome"),
  // nsIncome: (req, res) => {
  //     const body = req.body;
  //     nsIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "nsIncome",
  //             data: results
  //         });
  //     })
  // },
  roomRentIncome: controllerHelper(roomRentIncome, "roomRentIncome"),
  // roomRentIncome: (req, res) => {
  //     const body = req.body;
  //     roomRentIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "roomRentIncome",
  //             data: results
  //         });
  //     })
  // },
  otherIncome: controllerHelper(otherIncome, "otherIncome"),
  // otherIncome: (req, res) => {
  //     const body = req.body;
  //     otherIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "otherIncome",
  //             data: results
  //         });
  //     })
  // },
  consultingIncome: controllerHelper(consultingIncome, "consultingIncome"),
  // consultingIncome: (req, res) => {
  //     const body = req.body;
  //     consultingIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "consultingIncome",
  //             data: results
  //         });
  //     })
  // },
  anesthetiaIncome: controllerHelper(anesthetiaIncome, "anesthetiaIncome"),
  // anesthetiaIncome: (req, res) => {
  //     const body = req.body;
  //     anesthetiaIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "anesthetiaIncome",
  //             data: results
  //         });
  //     })
  // },
  surgeonIncome: controllerHelper(surgeonIncome, "surgeonIncome"),
  // surgeonIncome: (req, res) => {
  //     const body = req.body;
  //     surgeonIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "surgeonIncome",
  //             data: results
  //         });
  //     })
  // },
  theaterIncome: controllerHelper(theaterIncome, "theaterIncome"),
  // theaterIncome: (req, res) => {
  //     const body = req.body;
  //     theaterIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "theaterIncome",
  //             data: results
  //         });
  //     })
  // },
  cardiologyIncome: controllerHelper(cardiologyIncome, "cardiologyIncome"),
  // cardiologyIncome: (req, res) => {
  //     const body = req.body;
  //     cardiologyIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "cardiologyIncome",
  //             data: results
  //         });
  //     })
  // },
  disPosibleItemIncome: controllerHelper(disPosibleItemIncome, "disPosibleItemIncome"),
  // disPosibleItemIncome: (req, res) => {
  //     const body = req.body;
  //     disPosibleItemIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "disPosibleItemIncome",
  //             data: results
  //         });
  //     })
  // },
  icuIncome: controllerHelper(icuIncome, "icuIncome"),
  // icuIncome: (req, res) => {
  //     const body = req.body;
  //     icuIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "icuIncome",
  //             data: results
  //         });
  //     })
  // },
  icuprocedureIncome: controllerHelper(icuprocedureIncome, "icuprocedureIncome"),
  // icuprocedureIncome: (req, res) => {
  //     const body = req.body;
  //     icuprocedureIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "icuprocedureIncome",
  //             data: results
  //         });
  //     })
  // },
  radiologyIncome: controllerHelper(radiologyIncome, "radiologyIncome"),
  // radiologyIncome: (req, res) => {
  //     const body = req.body;
  //     radiologyIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "radiologyIncome",
  //             data: results
  //         });
  //     })
  // },
  laboratoryIncome: controllerHelper(laboratoryIncome, "laboratoryIncome"),
  // laboratoryIncome: (req, res) => {
  //     const body = req.body;
  //     laboratoryIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "laboratoryIncome",
  //             data: results
  //         });
  //     })
  // },
  mriIncome: controllerHelper(mriIncome, "mriIncome"),
  // mriIncome: (req, res) => {
  //     const body = req.body;
  //     mriIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "mriIncome",
  //             data: results
  //         });
  //     })
  // },
  dietIncome: controllerHelper(dietIncome, "dietIncome"),
  // dietIncome: (req, res) => {
  //     const body = req.body;
  //     dietIncome(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "dietIncome",
  //             data: results
  //         });
  //     })
  // },
  pharmacyIncomePart1: controllerHelper(pharmacyIncomePart1, "pharmacyIncomePart1"),
  // pharmacyIncomePart1: (req, res) => {
  //     const body = req.body;
  //     pharmacyIncomePart1(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "pharmacyIncomePart1",
  //             data: results
  //         });
  //     })
  // },
  pharmacyIncomePart2: controllerHelper(pharmacyIncomePart2, "pharmacyIncomePart2"),
  // pharmacyIncomePart2: (req, res) => {
  //     const body = req.body;
  //     pharmacyIncomePart2(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "pharmacyIncomePart2",
  //             data: results
  //         });
  //     })
  // },
  pharmacyIncomePart3: controllerHelper(pharmacyIncomePart3, "pharmacyIncomePart3"),
  // pharmacyIncomePart3: (req, res) => {
  //     const body = req.body;
  //     pharmacyIncomePart3(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "pharmacyIncomePart3",
  //             data: results
  //         });
  //     })
  // },
  pharmacyIncomePart4: controllerHelper(pharmacyIncomePart4, "pharmacyIncomePart4"),
  // pharmacyIncomePart4: (req, res) => {
  //     const body = req.body;
  //     pharmacyIncomePart4(body, (err, results) => {
  //         if (err) {
  //             return res.status(200).json({
  //                 success: 0,
  //                 message: err.message
  //             });
  //         }
  //         if (Object.keys(results).length === 0) {
  //             return res.status(200).json({
  //                 success: 2,
  //                 message: "No Result",
  //                 data: []
  //             });
  //         }
  //         return res.status(200).json({
  //             success: 1,
  //             message: "pharmacyIncomePart4",
  //             data: results
  //         });
  //     })
  // },
};
