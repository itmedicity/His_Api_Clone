const { oraUsers } = require('../oraUsers/user.service')
module.exports = {
    getOrauser: async (req, res) => {
        oraUsers((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Data Fetched",
                data: results
            });
        })
    }
}