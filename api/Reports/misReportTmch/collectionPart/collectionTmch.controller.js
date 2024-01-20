// @ts-nocheck
const moment = require('moment/moment');
const {
    advanceCollectionTmch,
    advanceRefundTmch,
    advanceSettledTmch,
    collectionAgainstSalePart1Tmch,
    collectionAgainstSalePart2Tmch,
    complimentory,
    creditInsuranceBillCollectionTmch,
    creditInsuranceBillTmch,
    ipConsolidatedDiscountTmch,
    ipPreviousDayDiscountTmch,
    ipPreviousDayCollectionTmch,
    unsettledAmount,
    misGroupMast,
    misGroup,
    getIpReceiptPatientIpInfo,
    getDischargedIpInfoMysql,
    creditInsuranceBillRefund,
    getIpNumberFromPreviousDayCollection
} = require('./collectionTmch.service')

module.exports = {
    getadvanceCollectionTmch: (req, res) => {
        const body = req.body;
        advanceCollectionTmch(body, (err, results) => {
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
                message: "advance Collection",
                data: results
            });
        })
    },
    getadvanceRefundTmch: (req, res) => {
        const body = req.body;
        advanceRefundTmch(body, (err, results) => {
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
                message: "advance Refund",
                data: results
            });
        })
    },
    getadvanceSettledTmch: (req, res) => {
        const body = req.body;
        advanceSettledTmch(body, (err, results) => {
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
                message: "advance Settled",
                data: results
            });
        })
    },
    getcollectionAgainstSalePart1Tmch: (req, res) => {
        const body = req.body;
        collectionAgainstSalePart1Tmch(body, (err, results) => {
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
                message: "get collection Against Sale Total",
                data: results
            });
        })
    },
    getcollectionAgainstSalePart2Tmch: (req, res) => {
        const body = req.body;
        collectionAgainstSalePart2Tmch(body, (err, results) => {
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
                message: "get collection Against Sale Deduction",
                data: results
            });
        })
    },
    getcomplimentoryTmch: (req, res) => {
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
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "complimentory",
                data: results
            });
        })
    },
    getcreditInsuranceBillCollectionTmch: (req, res) => {
        const body = req.body;
        creditInsuranceBillCollectionTmch(body, (err, results) => {
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
                message: "credit Insurance Bill Collection",
                data: results
            });
        })
    },
    getcreditInsuranceBillTmch: (req, res) => {
        const body = req.body;
        creditInsuranceBillTmch(body, (err, results) => {
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
                message: "credit Insurance Bill",
                data: results
            });
        })
    },
    getipConsolidatedDiscountTmch: (req, res) => {
        const body = req.body;
        ipConsolidatedDiscountTmch(body, (err, results) => {
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
                message: "ip Consolidated Discount",
                data: results
            });
        })
    },
    getipPreviousDayDiscountTmch: (req, res) => {
        const body = req.body;
        ipPreviousDayDiscountTmch(body, (err, results) => {
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

            if (results) {

                const ipNumber = results?.map((e) => e.IP_NO);

                getIpNumberFromPreviousDayCollection(ipNumber, (err, getResult) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        });
                    }


                    if (Object.keys(getResult).length === 0) {
                        return res.status(200).json({
                            success: 1,
                            message: "ip Previous Day Collection",
                            data: results
                        });
                    }


                    if (getResult) {
                        let array = Object.values(JSON.parse(JSON.stringify(getResult)))
                        const notInclPat = results?.filter((e) => !array?.map(e => e.ip_no).includes(e.IP_NO))

                        if (Object.keys(notInclPat).length === 0) {
                            return res.status(200).json({
                                success: 1,
                                message: "ip Previous Day Collection",
                                data: results
                            });
                        } else {
                            return res.status(200).json({
                                success: 1,
                                message: "ip Previous Day Collection",
                                data: notInclPat,
                            });
                        }
                    }
                })
            }
        })
    },
    getipPreviousDayCollectionTmch: (req, res) => {
        const body = req.body;
        ipPreviousDayCollectionTmch(body, (err, results) => {
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
            if (results) {
                const ipNumber = results?.map((e) => e.IP_NO);

                getIpNumberFromPreviousDayCollection(ipNumber, (err, getResult) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        });
                    }
                    if (Object.keys(getResult).length === 0) {
                        return res.status(200).json({
                            success: 1,
                            message: "No Result",
                            data: results
                        });
                    }

                    if (getResult) {
                        let array = Object.values(JSON.parse(JSON.stringify(getResult)))
                        const notInclPat = results?.filter((e) => !array?.map(e => e.ip_no).includes(e.IP_NO))

                        if (Object.keys(getResult).length === 0) {
                            return res.status(200).json({
                                success: 1,
                                message: "ip Previous Day Collection",
                                data: []
                            });
                        } else {
                            return res.status(200).json({
                                success: 1,
                                message: "ip Previous Day Collection",
                                data: notInclPat
                            });
                        }
                    }
                })
            }

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
                    message: "No Result",
                    data: []
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Unsettled Amount",
                data: results
            });
        })
    },
    misGroup: (req, res) => {
        misGroup((err, results) => {
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
                message: "mis group master",
                data: results
            });
        })
    },
    misGroupMast: (req, res) => {
        misGroupMast((err, results) => {
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
                message: "mis group master",
                data: results
            });
        })
    },
    getcreditInsuranceBillRefund: (req, res) => {
        const body = req.body;
        creditInsuranceBillRefund(body, (err, results) => {
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
                message: "credit Insurance Bill",
                data: results
            });
        })
    },
}