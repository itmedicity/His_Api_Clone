const { getPODetails, getPendingPODetails, getItemGrnDetails, getPODetailsBySupplier, getItemDetails } = require('./purchase.service')

module.exports = {
    getPODetails: (req, res) => {
        const body = req.body;
        getPODetails(body, (err, results) => {
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
                data: results
            });
        });
    },

    getPendingPODetails: (req, res) => {
        const body = req.body;
        getPendingPODetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },

    getItemGrnDetails: (req, res) => {
        const body = req.body;
        getItemGrnDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                });
            }
            return res.status(200).json({
                success: 1,
                elliderdata: results
            });
        });
    },

    getPODetailsBySupplier: (req, res) => {
        const id = req.params.id;
        getPODetailsBySupplier(id, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },


    getItemDetails: (req, res) => {
        const body = req.body;
        getItemDetails(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                });
            }
            return res.status(200).json({
                success: 1,
                ellData: results
            });
        });
    },
    // getPendingPODetails: (req, res) => {
    //     const { offset, limit } = req.query;
    //     getPendingPODetails(parseInt(offset, 10), parseInt(limit, 10), (err, results) => {
    //         if (err) {
    //             return res.status(200).json({
    //                 success: 0,
    //                 message: err.message
    //             });
    //         }
    //         if (!results || results.length === 0) {
    //             return res.status(200).json({
    //                 success: 1
    //             });
    //         }
    //         return res.status(200).json({
    //             success: 2,
    //             data: results
    //         });
    //     });
    // },

}