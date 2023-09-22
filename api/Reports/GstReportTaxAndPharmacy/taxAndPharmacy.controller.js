const {
    getGstReportOfPharmacy,
    getGstReportPharmacyWise,
    getSumOfAmountTaxDisc,
    getInPatientMedReturn,
    getInPatientMedReturnSum,
    getInPatientMedSale,
    getOpCreditPharmSale,
    getGstReportPharmCollection,
} = require('./taxAndPharmacy.service');

module.exports = {

    getGstReportOfPharmacy: (req, res) => {
        const body = req.body;
        getGstReportOfPharmacy(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },


    getGstReportPharmacyWise: (req, res) => {
        const body = req.body;
        getGstReportPharmacyWise(body, (err, results) => {

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
                message: "Gst Reports",
                data: results
            });
        })
    },

    getInPatientMedSale: (req, res) => {
        const body = req.body;
        getInPatientMedSale(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },

    getInPatientMedReturn: (req, res) => {
        const body = req.body;
        getInPatientMedReturn(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },


    getSumOfAmountTaxDisc: (req, res) => {
        const body = req.body;
        getSumOfAmountTaxDisc(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },

    getInPatientMedReturnSum: (req, res) => {
        const body = req.body;
        getInPatientMedReturnSum(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },





    getOpCreditPharmSale: (req, res) => {
        const body = req.body;
        getOpCreditPharmSale(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },




    getGstReportPharmCollection: (req, res) => {
        const body = req.body;
        getGstReportPharmCollection(body, (err, results) => {
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
                message: "Gst Reports",
                data: results
            });
        })
    },
}