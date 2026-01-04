const { getPurchaseMastDatas, getGrmDetails, getpendingApprovalQtn, getPurchaseDetails, getItemDetails } = require('./StoreReport.service')

module.exports = {
    getPurchaseMastDatas: (req, res) => {
        const body = req.body;
        getPurchaseMastDatas(body, (err, results) => {
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
                message: "Fetched Purchase Datas",
                data: results
            });
        });
    },
    getGrmDetails: (req, res) => {
        const body = req.body;
        getGrmDetails(body, (err, results) => {
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
                message: "Fetched GRN Datas",
                data: results
            });
        });
    },

    getpendingApprovalQtn: (req, res) => {
        getpendingApprovalQtn((err, results) => {
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
    getPurchaseDetails: (req, res) => {
        const id = req.params.id;
        // console.log("id");
        getPurchaseDetails(id, (err, results) => {
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
                message: "Purchase Details",
                data: results
            });
        })
    },
    getItemDetails: (req, res) => {
        const id = req.params.id;
        // console.log("id");
        getItemDetails(id, (err, results) => {
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
                message: "PItem Details",
                data: results
            });
        })
    },
}

