
const pool = require('../../config/dbconfig');
module.exports = {

    userGroupInsert: (data, callBack) => {
        pool.query('insert into medi_ellider.user_group (user_group_name, pass_expiry_days, user_group_active) values (?,?,?)',
            [
                data.user_group_name,
                data.pass_expiry_days,
                data.group_active
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )

    },
    groupAlreadyExist: (data, callBack) => {
        pool.query(
            `select user_group_name from medi_ellider.user_group where user_group_name = ?`,
            [
                data.user_group_name,
            ],
            (err, results, fields) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },

    getUserGroup: (callBack) => {
        pool.query(
            `select * from medi_ellider.user_group order by user_group_name`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    userGroupUpdate: (data, callBack) => {
        pool.query(
            `update medi_ellider.user_group set user_group_name = ?, pass_expiry_days = ?, user_group_active = ? where user_group_id = ?`,
            [
                data.user_group_name,
                data.pass_expiry_days,
                data.user_group_active,
                data.user_group_id,
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    searchUserGroup: (data, callBack) => {

        pool.query(`select * from user_group where user_group_name like ? order by user_group_name`,
            [
                '%' + data.user_group_name + '%',
            ],
            (err, results, feilds) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },


    activetUserGroup: (callBack) => {
        pool.query(
            `select * from medi_ellider.user_group where user_group_active=1`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

}