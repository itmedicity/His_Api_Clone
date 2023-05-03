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
    unsettledAmount
} = require('./collection.service')

module.exports = {
    getadvanceCollection: (req, res) => {
        const body = req.body;
        advanceCollection(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "advance Collection",
                data: results
            });
        })
    },
    getAdvanceRefund: (req, res) => {
        const body = req.body;
        advanceRefund(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "advance Refund",
                data: results
            });
        })
    },
    getAdvanceSettled: (req, res) => {
        const body = req.body;
        advanceSettled(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "advance Settled",
                data: results
            });
        })
    },
    getcollectionAgainstSaleTotal: (req, res) => {
        const body = req.body;
        collectionAgainstSalePart1(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "get collection Against Sale Total",
                data: results
            });
        })
    },
    getcollectionAgainstSaleDeduction: (req, res) => {
        const body = req.body;
        collectionAgainstSalePart2(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "get collection Against Sale Deduction",
                data: results
            });
        })
    },
    getComplimentory: (req, res) => {
        const body = req.body;
        complimentory(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "complimentory",
                data: results
            });
        })
    },
    getcreditInsuranceBillCollection: (req, res) => {
        const body = req.body;
        creditInsuranceBillCollection(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "credit Insurance Bill Collection",
                data: results
            });
        })
    },
    getcreditInsuranceBill: (req, res) => {
        const body = req.body;
        creditInsuranceBill(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "credit Insurance Bill",
                data: results
            });
        })
    },
    getipConsolidatedDiscount: (req, res) => {
        const body = req.body;
        ipConsolidatedDiscount(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "ip Consolidated Discount",
                data: results
            });
        })
    },
    getipPreviousDayDiscount: (req, res) => {
        const body = req.body;
        ipPreviousDayDiscount(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "get ip Previous Day Discount",
                data: results
            });
        })
    },
    getipPreviousDayCollection: (req, res) => {
        const body = req.body;
        ipPreviousDayCollection(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "ip Previous Day Collection",
                data: results
            });
        })
    },
    getunsettledAmount: (req, res) => {
        const body = req.body;
        unsettledAmount(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Unsettled Amount",
                data: results
            });
        })
    },
}