const { userRightsInsert, getUserRights, userRightsUpdate } = require('./userRights.service')

module.exports = {
    userRightsInsert: (req, res) => {
        const body = req.body;
        const data = body.map((val) => {
            return [val.user_group_id, val.module_id, val.menugroup_id,
            val.menuname_id, val.view_menu, val.pdf_view, val.excel_view]
        })
        userRightsInsert(data, (err, results) => {

            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            return res.status(200).json({
                success: 1,
                message: "User Rights Updated"
            })
        })
    },

    getUserRights: (req, res) => {
        const body = req.body;
        getUserRights(body, (err, results) => {
            if (err) {
                return res.status(400).json({
                    success: 0,
                    message: err
                })
            }
            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            })
        })

    },

    userRightsUpdate: async (req, res) => {
        const body = req.body;
        userRightsUpdate(body).then(results => {
            return res.status(200).json({
                success: 1,
                message: "User Rights Updated"
            });
        }).catch(err => {
            return res.status(200).json({
                success: 0,
                message: "Error Occured"
            });
        })
    },

}
