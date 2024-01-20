const { patientTypeDiscountTssh } = require('./patientTypeTssh.service')

module.exports = {
    getpatientTypeDiscountTssh: (req, res) => {
        const body = req.body;
        patientTypeDiscountTssh(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "No Result"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Patient Type Discount",
                data: results
            });
        })
    },
}