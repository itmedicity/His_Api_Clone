const pool = require('../../config/dbconfig');

module.exports = {
    employeeInsert: (data, callBack) => {

        pool.query(
            `INSERT INTO hrm_employee 
                (us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group_id) 
            VALUES 
                (?,?,?,?,?,?,?)`,
            [
                data.us_code,
                data.usc_name,
                data.usc_pass,
                data.usc_alias,
                data.usc_first_name,
                data.usc_active,
                data.user_group_id
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },

    EmployeeAlreadyExist: (data, callBack) => {
        pool.query(
            `select usc_name from hrm_employee where usc_name = ?`,
            [
                data.usc_name,
            ],
            (err, results, feilds) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },
    getEmployee: (callBack) => {
        pool.query(
            `SELECT emp_slno,us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group.user_group_name,hrm_employee.user_group_id FROM medi_ellider.hrm_employee
            left join user_group on user_group.user_group_id=hrm_employee.user_group_id order by hrm_employee.usc_name`,
            [],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    viewEmployee: (callBack) => {
        pool.query(
            `SELECT emp_slno,usc_name,usc_alias,usc_first_name,usc_active,user_group.user_group_name FROM medi_ellider.hrm_employee
            left join user_group on user_group.user_group_id=hrm_employee.user_group_id`,
            [],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },


    searchEmployee: (data, callBack) => {
        pool.query(`select emp_slno,us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group.user_group_name from medi_ellider.hrm_employee 
        left join user_group on user_group.user_group_id=hrm_employee.user_group_id
        where usc_name like ? and usc_alias like ? and usc_first_name like ? order by usc_name`,
            [
                '%' + data.usc_name + '%',
                '%' + data.usc_alias + '%',
                '%' + data.usc_first_name + '%',
            ],
            (err, results, feilds) => {
                if (err) {
                    return callBack(err)
                }
                return callBack(null, results)
            }
        )
    },

    employeeResetPass: (data, callBack) => {
        pool.query(
            `UPDATE hrm_employee
                SET 
                   usc_name = ?,
                    usc_pass = ?,
                    usc_alias = ?,
                    usc_first_name = ?,
                    usc_active = ?,
                    user_group_id=?
                WHERE emp_slno = ?`,
            [
                data.usc_name,
                data.usc_pass,
                data.usc_alias,
                data.usc_first_name,
                data.usc_active,
                data.user_group_id,
                data.emp_slno
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },


    employeeUpdate: (data, callBack) => {
        pool.query(
            `UPDATE hrm_employee
                SET 
                    usc_name = ?,
                    usc_alias = ?,
                    usc_first_name = ?,
                    usc_active = ?,
                    user_group_id=?
                WHERE emp_slno = ?`,
            [
                data.usc_name,
                data.usc_alias,
                data.usc_first_name,
                data.usc_active,
                data.user_group_id,
                data.emp_slno
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    employeeGetById: (id, callBack) => {
        pool.query(
            `SELECT 
                emp_slno,
                us_code,
                usc_name,
                usc_pass,
                usc_alias,
                usc_first_name,
                usc_active
            FROM medi_ellider.hrm_employee 
            WHERE emp_slno = ?`,
            [id],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }

                return callBack(null, results[0]);
            }
        );
    },
    employeeDelete: (data, callBack) => {
        pool.query(
            `UPDATE hrm_employee SET usc_active = 0 WHERE emp_slno = ?`,
            [
                data.emp_slno
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    getEmployeeByUserName: (userName, callBack) => {
        pool.query(
            `SELECT * FROM medi_ellider.hrm_employee WHERE usc_name = ?  AND usc_active = 1`,
            [userName],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                    console.log(error)
                }
                return callBack(null, results[0]);
            }
        );
    },
    getMenuRights: (id, callBack) => {

        pool.query(
            `call GET_MENULIST(?) `,
            [id],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }

                return callBack(null, results[0]);
            }
        );

    },

}