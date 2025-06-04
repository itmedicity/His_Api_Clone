const { getQtnMastDetails, getQtnDetailDetails } = require('./bis_quotation.service')

module.exports = {
    getQtnMastDetails: (req, res) => {
        const body = req.body;
        getQtnMastDetails(body, (err, results) => {
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
}
