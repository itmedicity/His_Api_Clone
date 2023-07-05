const pool = require('../../config/dbconfig');
module.exports = {
    getModuleList: (callBack) => {
        pool.query(
            `select * from medi_ellider.module_master`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    getMenuList: (data, callBack) => {
        pool.query(
            `select * from medi_ellider.menugroup_master where module_id=?`,
            [
                data.module_id,
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    menuGroupInsert: (data, callBack) => {
        pool.query('insert into medi_ellider.menuname_details (module_id,menugroup_id,menu_name,menuname_active) values (?,?,?,?)',
            [
                data.module_id,
                data.menugroup_id,
                data.menu_name,
                data.menuname_active
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )

    },
    menugroupAlreadyExist: (data, callBack) => {
        pool.query(
            `select module_id,menugroup_id,menu_name from medi_ellider.menuname_details where module_id = ? and menugroup_id=? and menu_name=?`,
            [
                data.module_id,
                data.menugroup_id,
                data.menu_name
            ],
            (err, results, fields) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },

    getGroupMapDetails: (callBack) => {
        pool.query(
            `select menuname_id,module_master.module_name,menugroup_master.menugroup_name,menu_name,menuname_active,
            menuname_details.module_id,menuname_details.menugroup_id from medi_ellider.menuname_details
            left join module_master on module_master.module_id=menuname_details.module_id
            left join menugroup_master on menugroup_master.menugroup_id=menuname_details.menugroup_id`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    menuGroupUpdate: (data, callBack) => {
        pool.query(
            `update medi_ellider.menuname_details set module_id = ?, menugroup_id = ?, menu_name = ?, menuname_active = ? where menuname_id = ?`,
            [
                data.module_id,
                data.menugroup_id,
                data.menu_name,
                data.menuname_active,
                data.menuname_id
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },


    getMenuNameDetails: (data, callBack) => {
        pool.query(
            `select  ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SlNo,menuname_id,menuname_details.module_id,
            menuname_details.menugroup_id, menugroup_master.menugroup_name,menu_name from menuname_details
            left join menugroup_master on menugroup_master.menugroup_id=menuname_details.menugroup_id
            where menuname_details.module_id = ? and menugroup_master.menugroup_id = ? and 
            menuname_details.menuname_active=1 order by menugroup_master.menugroup_name`,
            [
                data.module_id,
                data.menugroup_id
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

}