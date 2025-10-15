const {
    pharmacySalePart1,
    phamracyReturnPart1,
    phamracySalePart2,
    phamracyReturnPart2,
    phamracySalePart3,
    phamracyReturnPart3
} = require('./pharmacy.service')

module.exports = {
    getpharmacySalePart1: (req, res) => {
        const body = req.body;
        pharmacySalePart1(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
    getpharmacyReturnPart1: (req, res) => {
        const body = req.body;
        phamracyReturnPart1(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
    getphamracySalePart2: (req, res) => {
        const body = req.body;
        phamracySalePart2(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
    getphamracyReturnPart2: (req, res) => {
        const body = req.body;
        phamracyReturnPart2(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
    getphamracySalePart3: (req, res) => {
        const body = req.body;
        phamracySalePart3(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
    getphamracyReturnPart3: (req, res) => {
        const body = req.body;
        phamracyReturnPart3(body, (err, results) => {
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
                message: "Pharmacy Sale",
                data: results
            });
        })
    },
}