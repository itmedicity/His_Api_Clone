
const { GetElliderCensusCount } = require('./censusreport.service')
module.exports = {
    GetElliderCensusCount: (req, res) => {
        const body = req.body;
        GetElliderCensusCount(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (results.length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Report Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },
}