const { getPODetails, getPendingPODetails } = require('./purchase.service')

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