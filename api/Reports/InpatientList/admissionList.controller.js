const {
    ipAdmissionList,
    insertTsshPatient,
    checkPatientInserted,
    getTsshPatientDateWise,
    deleteIPNumberFromTssh,
    getPatientData
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
    insertTsshPat: (req, res) => {
        const body = req.body;

        checkPatientInserted(body, (err, results) => {

            if (err === null) {
                if (results.length === 0) {
                    insertTsshPatient(body, (err, results) => {
                        if (err) {
                            return res.status(200).json({
                                success: 0,
                                message: err.message
                            });
                        }

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
                message: "Patient Removed From TSSH ",
                data: results
            });
        })
    },
    getPatientData: (req, res) => {
        const id = req.params.id;
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

}