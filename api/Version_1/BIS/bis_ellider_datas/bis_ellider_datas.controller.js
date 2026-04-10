const { getOpdatas, getCashcredit, getIpAddmissionCount, getDischargeCount } = require('./bis_ellider_datas.service')

module.exports = {
    getOpdatas: (req, res) => {
        const body = req.body;
        getOpdatas(body, (err, results) => {
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
                message: "Op Count Updated",
                data: results
            });
        });
    },
    getCashcredit: (req, res) => {
        const body = req.body;
        getCashcredit(body, (err, results) => {
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
                message: "Op Count Updated",
                data: results
            });
        });
    },

    getIpAddmissionCount: (req, res) => {
        const body = req.body;
        getIpAddmissionCount(body, (err, results) => {
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
                message: "IP Admission Count Updated",
                data: results
            });
        });
    },
    getDischargeCount: (req, res) => {
        const body = req.body;
        getDischargeCount(body, (err, results) => {
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
                message: "IP Discharge Count Updated",
                data: results
            });
        });
    },
}
