
const { GetProcedureList } = require('./procedure.service')
module.exports = {
    GetProcedureList: (req, res) => {
        const body = req.body;
        GetProcedureList(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: "Procedure Not Found"

                })
            }
            return res.status(200).json({
                success: 1,
                data: results
            })
        })
    },
}