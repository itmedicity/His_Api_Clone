const { getPurchaseMastDatas, getGrmDetails } = require('./StoreReport.service')

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
}
