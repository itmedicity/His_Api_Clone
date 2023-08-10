const { getAllPharmacySales, getOpCountMonthWise, getIpCountMonthWise } = require('./rolProcess.service')

module.exports = {

    getAllPharmacySales: (req, res) => {
        const body = req.body;
        getAllPharmacySales(body, (err, results) => {

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

    getOpCountMonthWise: (req, res) => {
        const body = req.body;
        getOpCountMonthWise(body, (err, results) => {

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
    getIpCountMonthWise: (req, res) => {
        const body = req.body;
        getIpCountMonthWise(body, (err, results) => {
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


}
