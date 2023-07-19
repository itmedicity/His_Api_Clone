const {
    pharmacyTsshSalePart1,
    phamracyTsshReturnPart1,
    phamracyTsshSalePart2,
    phamracyTsshReturnPart2,
    phamracyTsshSalePart3,
    phamracyTsshReturnPart3
} = require('./pharmacyTssh.service')

module.exports = {
    getpharmacyTsshSalePart1: (req, res) => {
        const body = req.body;
        pharmacyTsshSalePart1(body, (err, results) => {
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
    getphamracyTsshReturnPart1: (req, res) => {
        const body = req.body;
        phamracyTsshReturnPart1(body, (err, results) => {
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
    getphamracyTsshSalePart2: (req, res) => {
        const body = req.body;
        phamracyTsshSalePart2(body, (err, results) => {
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
    getphamracyTsshReturnPart2: (req, res) => {
        const body = req.body;
        phamracyTsshReturnPart2(body, (err, results) => {
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
    getphamracyTsshSalePart3: (req, res) => {
        const body = req.body;
        phamracyTsshSalePart3(body, (err, results) => {
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
    getphamracyTsshReturnPart3: (req, res) => {
        const body = req.body;
        phamracyTsshReturnPart3(body, (err, results) => {
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