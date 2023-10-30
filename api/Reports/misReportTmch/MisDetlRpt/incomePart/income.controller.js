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
    pharmacyIncomePart4
} = require('../incomePart/income.service')

module.exports = {
    bedIncome: (req, res) => {
        const body = req.body;
        bedIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "bedIncome",
                data: results
            });
        })
    },
    nsIncome: (req, res) => {
        const body = req.body;
        nsIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "nsIncome",
                data: results
            });
        })
    },
    roomRentIncome: (req, res) => {
        const body = req.body;
        roomRentIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "roomRentIncome",
                data: results
            });
        })
    },
    otherIncome: (req, res) => {
        const body = req.body;
        otherIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "otherIncome",
                data: results
            });
        })
    },
    consultingIncome: (req, res) => {
        const body = req.body;
        consultingIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "consultingIncome",
                data: results
            });
        })
    },
    anesthetiaIncome: (req, res) => {
        const body = req.body;
        anesthetiaIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "anesthetiaIncome",
                data: results
            });
        })
    },
    surgeonIncome: (req, res) => {
        const body = req.body;
        surgeonIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "surgeonIncome",
                data: results
            });
        })
    },
    theaterIncome: (req, res) => {
        const body = req.body;
        theaterIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "theaterIncome",
                data: results
            });
        })
    },
    cardiologyIncome: (req, res) => {
        const body = req.body;
        cardiologyIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "cardiologyIncome",
                data: results
            });
        })
    },
    disPosibleItemIncome: (req, res) => {
        const body = req.body;
        disPosibleItemIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "disPosibleItemIncome",
                data: results
            });
        })
    },
    icuIncome: (req, res) => {
        const body = req.body;
        icuIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "icuIncome",
                data: results
            });
        })
    },
    icuprocedureIncome: (req, res) => {
        const body = req.body;
        icuprocedureIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "icuprocedureIncome",
                data: results
            });
        })
    },
    radiologyIncome: (req, res) => {
        const body = req.body;
        radiologyIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "radiologyIncome",
                data: results
            });
        })
    },
    laboratoryIncome: (req, res) => {
        const body = req.body;
        laboratoryIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "laboratoryIncome",
                data: results
            });
        })
    },
    mriIncome: (req, res) => {
        const body = req.body;
        mriIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "mriIncome",
                data: results
            });
        })
    },
    dietIncome: (req, res) => {
        const body = req.body;
        dietIncome(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "dietIncome",
                data: results
            });
        })
    },
    pharmacyIncomePart1: (req, res) => {
        const body = req.body;
        pharmacyIncomePart1(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "pharmacyIncomePart1",
                data: results
            });
        })
    },
    pharmacyIncomePart2: (req, res) => {
        const body = req.body;
        pharmacyIncomePart2(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "pharmacyIncomePart2",
                data: results
            });
        })
    },
    pharmacyIncomePart3: (req, res) => {
        const body = req.body;
        pharmacyIncomePart3(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "pharmacyIncomePart3",
                data: results
            });
        })
    },
    pharmacyIncomePart4: (req, res) => {
        const body = req.body;
        pharmacyIncomePart4(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "pharmacyIncomePart4",
                data: results
            });
        })
    },
}