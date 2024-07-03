
const { GetElliderPatientList, GetIPPatientList, GetEndoscopyIPInfo, GetInitialAssessmentDetails,
    GetEndoscopyPatientsQI } = require('./getPatientsList.service')
module.exports = {
    GetElliderPatientList: (req, res) => {
        const body = req.body;
        GetElliderPatientList(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Data Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },

    GetEndoscopyIPInfo: (req, res) => {
        const id = req.params.id;
        GetEndoscopyIPInfo(id, (err, results) => {
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

    GetIPPatientList: (req, res) => {
        const body = req.body;
        GetIPPatientList(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Data Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },

    GetInitialAssessmentDetails: (req, res) => {
        const body = req.body;
        GetInitialAssessmentDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Data Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },

    GetEndoscopyPatientsQI: (req, res) => {
        const body = req.body;
        GetEndoscopyPatientsQI(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Data Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },

}