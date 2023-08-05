const pool = require('../../config/dbconfig');

module.exports = {

    userRightsInsert: (data, callBack) => {
        pool.query(
            `insert into medi_ellider.user_rights_details
            ( user_group_id,
                 module_id, 
                 menugroup_id,
                 menuname_id, 
                 view_menu,
                 pdf_view,
                 excel_view
            ) values ?`,
            [
                data
            ],

            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)

            });
    },

    getUserRights: (data, callBack) => {
        pool.query(
            `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SlNo,user_rights_details.module_id,user_rights_details.menugroup_id,
             user_rights_details.menuname_id, menugroup_master.menugroup_name,menuname_details.menu_name,
             view_menu,pdf_view,excel_view from medi_ellider.user_rights_details 
             left join menugroup_master on menugroup_master.menugroup_id=user_rights_details.menugroup_id
             left join menuname_details on menuname_details.menuname_id=user_rights_details.menuname_id
             where user_rights_details.user_group_id = ? and user_rights_details.menugroup_id = ? order by user_rights_details.menuname_id`,
            [
                data.user_group_id,
                data.menugroup_id
            ],
            (err, results, fields) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },


    userRightsUpdate: (body) => {
        return Promise.all(body.map((val) => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `update medi_ellider.user_rights_details set view_menu = ?, pdf_view = ?,excel_view = ? 
                    where user_group_id = ? and menuname_id = ?`,
                    [
                        val.view_menu,
                        val.pdf_view,
                        val.excel_view,
                        val.user_group_id,
                        val.menuname_id

                    ],
                    (error, results, fields) => {
                        if (error) {
                            return reject(error)
                        }
                        return resolve(results)
                    }
                )


            })
        })
        )
    },


}
