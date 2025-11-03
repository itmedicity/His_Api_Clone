const {
    ipAdmissionList,
    insertTsshPatient,
    checkPatientInserted,
    getTsshPatientDateWise,
    deleteIPNumberFromTssh,
    getPatientData,
    getIpadmissChecks,
    getTsshPatientList,
    getTotalPatientList,
    getDischargePatientList,
    notDischargedPatientListTssh,
    getLastDischargeUpdateDate,
    updateDischargedPatient,
    updateLastDischargeDate,
    getDischargedipNoFromMysql,
    // getIpadmissChecks,
    insertAsRemoveTmcPatient,
    getTsshIpNoFromMysql,
    getIpReceiptPatientInfo,
    getDischargedIpInfoFromMysql,
    getTsshIpNoFromMysqlGrouping,
    getDischargedIpInfoFromMysqlGrouped,
    getGroupedPatientList,
    getTmcIncomeReport,
    getTsshIncomeReport,
    getIpNumberTsshGrouped
} = require('./admissionList.service');

module.exports = {
    getIpAdmissionList: (req, res) => {
        const body = req.body;
        ipAdmissionList(body, (err, results) => {
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
                message: "Admission List",
                data: results
            });
        })
    },
    insertTsshPat: async (req, res) => {
        const body = req.body;

        checkPatientInserted(body, (err, results) => {

            if (err === null) {
                if (results.length === 0) {
                    insertTsshPatient(body).then(reslt => {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        })
                    }).catch(eor => {
                        return res.status(200).json({
                            success: 1,
                            message: "Patient Transfer To TSSH"
                        });
                    })
                } else {
                    return res.status(200).json({
                        success: 2,
                        message: "Patient Already Transfer"
                    });
                }
            } else {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
        })
    },
    removeAsTmchPatient: (req, res) => {
        const body = req.body;

        checkPatientInserted(body, (err, results) => {

            if (err === null) {
                if (results.length === 0) {
                    insertAsRemoveTmcPatient(body, (err, results) => {
                        if (err) {
                            return res.status(200).json({
                                success: 0,
                                message: err.message
                            });
                        }

                        return res.status(200).json({
                            success: 1,
                            message: "Patient Grouped From TMCH"
                        });
                    })

                } else {
                    return res.status(200).json({
                        success: 2,
                        message: "Patient Already Grouped"
                    });
                }
            } else {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
        })
    },
    getTsshPatientDateWise: (req, res) => {
        const body = req.body;
        getTsshPatientDateWise(body, (err, results) => {
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
                message: "Tssh Patient List",
                data: results
            });
        })
    },
    deleteIPNumberFromTssh: (req, res) => {
        const body = req.body;
        deleteIPNumberFromTssh(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    succ: 0,
                    msage: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    succ: 2,
                    msage: "No Result",
                });
            }
            return res.status(200).json({
                succ: 1,
                msage: "Patient Removed From TSSH ",
                data: results
            });
        })
    },
    getPatientData: (req, res) => {
        const id = req.params.id;
        // console.log("id");
        getPatientData(id, (err, results) => {
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
                message: "Patient Infomation",
                data: results
            });
        })
    },
    getTsshPatientList: (req, res) => {
        const body = req.body;
        getTsshPatientList(body, (err, results) => {
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
                message: "Get Tssh Patient List",
                data: results
            });
        })
    },
    getTotalPatientList: (req, res) => {
        const body = req.body;
        getTotalPatientList(body, (err, results) => {
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
                message: "GET TOTAL PATIENT LIST",
                data: results
            });
        })
    },
    getDischargePatientList: (req, res) => {
        const body = req.body;
        getDischargePatientList(body, (err, results) => {
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
                message: "Get The Discharged Patient List",
                data: results
            });
        })
    },
    notDischargedPatientListTssh: (req, res) => {
        notDischargedPatientListTssh((err, results) => {
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
                message: "Get The Discharged Patient List",
                data: results
            });
        })
    },
    getLastDischargeUpdateDate: (req, res) => {
        getLastDischargeUpdateDate((err, results) => {
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
                message: "Last discharge updated dates",
                data: results
            });
        })
    },
    updateDischargedPatient: (req, res) => {
        const body = req.body;
        updateDischargedPatient(body)
            .then((mesge) => {
                return res.status(200).json({
                    success: 1,
                    message: mesge
                });
            }).catch((e) => {
                return res.status(200).json({
                    success: 0,
                    message: e.sqlMessage
                });
            })
    },
    updateLastDischargeDate: (req, res) => {
        const body = req.body;
        updateLastDischargeDate(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Update The last dicharge uipdated date",
            });
        })
    },
    getDischargedipNoFromMysql: (req, res) => {
        const body = req.body;
        getDischargedipNoFromMysql(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getTsshIpNoFromMysql: (req, res) => {
        const body = req.body;
        getTsshIpNoFromMysql(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getIpadmissChecks: (req, res) => {
        const id = req.params.id;
        getIpadmissChecks(id, (err, results) => {
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
                message: "Patient Infomation",
                data: results
            });
        })
    },
    getIpReceiptPatientInfo: (req, res) => {
        const body = req.body;
        getIpReceiptPatientInfo(body, (err, results) => {
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
                message: "ip receipt details",
                data: results
            });
        })
    },
    getDischargedIpInfoFromMysql: (req, res) => {
        const body = req.body;
        getDischargedIpInfoFromMysql(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getTsshIpNoFromMysqlGrouping: (req, res) => {
        const body = req.body;
        getTsshIpNoFromMysqlGrouping(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getDischargedIpInfoFromMysqlGrouped: (req, res) => {
        const body = req.body;
        getDischargedIpInfoFromMysqlGrouped(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getGroupedPatientList: (req, res) => {
        const body = req.body;
        getGroupedPatientList(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getTmcIncomeReport: (req, res) => {
        const body = req.body;
        getTmcIncomeReport(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getTsshIncomeReport: (req, res) => {
        const body = req.body;
        getTsshIncomeReport(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
    getIpNumberTsshGrouped: (req, res) => {
        const body = req.body;
        getIpNumberTsshGrouped(body, (err, results) => {
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
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        })
    },
}