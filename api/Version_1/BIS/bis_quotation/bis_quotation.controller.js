const { getQtnMastDetails, getQtnDetailDetails, getActiveItems, storeItems, medstore, medDescription, getTotalQtn } = require('./bis_quotation.service')

module.exports = {
    getQtnMastDetails: (req, res) => {
        const body = req.body;
        getQtnMastDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    successVal: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    successVal: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                successVal: 2,
                message: "Quotation Details Updated",
                MastData: results
            });
        });
    },
    getQtnDetailDetails: (req, res) => {
        const body = req.body;
        getQtnDetailDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Quotation Details Updated",
                DetailData: results
            });
        });
    },
    getActiveItems: (req, res) => {
        const body = req.body;
        getActiveItems(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Quotation Active Items Updated",
                data: results
            });
        });
    },
    storeItems: (req, res) => {
        const body = req.body;
        storeItems(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Store master updated",
                data: results
            });
        });
    },
    medstore: (req, res) => {
        const body = req.body;
        medstore(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Store master updated",
                data: results
            });
        });
    },
    medDescription: (req, res) => {
        const body = req.body;
        medDescription(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Store master updated",
                data: results
            });
        });
    },

    getTotalQtn: (req, res) => {
        const body = req.body;
        getTotalQtn(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                message: "Store master updated",
                data: results
            });
        });
    },
}
