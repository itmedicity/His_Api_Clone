const {
    pharmacyTmchSalePart1,
    phamracyTmchReturnPart1,
    phamracyTmchSalePart2,
    phamracyTmchReturnPart2,
    phamracyTmchSalePart3,
    phamracyTmchReturnPart3
} = require('./pharmacyTmch.service')

module.exports = {
    getpharmacyTmchSalePart1: (req, res) => {
        const body = req.body;
        pharmacyTmchSalePart1(body, (err, results) => {
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
    getphamracyTmchReturnPart1: (req, res) => {
        const body = req.body;
        phamracyTmchReturnPart1(body, (err, results) => {
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
    getphamracyTmchSalePart2: (req, res) => {
        const body = req.body;
        phamracyTmchSalePart2(body, (err, results) => {
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
    getphamracyTmchReturnPart2: (req, res) => {
        const body = req.body;
        phamracyTmchReturnPart2(body, (err, results) => {
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
    getphamracyTmchSalePart3: (req, res) => {
        const body = req.body;
        phamracyTmchSalePart3(body, (err, results) => {
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
    getphamracyTmchReturnPart3: (req, res) => {
        const body = req.body;
        phamracyTmchReturnPart3(body, (err, results) => {
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