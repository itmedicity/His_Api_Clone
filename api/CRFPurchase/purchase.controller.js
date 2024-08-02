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
        getPendingPODetails((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

}