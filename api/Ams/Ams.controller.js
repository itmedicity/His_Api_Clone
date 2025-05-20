const { getAntibiotic } = require('./Ams.service')
module.exports = {
    getAntibiotic: (req, res) => {
        const body = req.body;
        getAntibiotic(body, (err, results) => {
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

}