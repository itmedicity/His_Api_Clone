const pool = require('../../config/dbconfig');

module.exports = {
    employeeInsert: (data, callBack) => {
        pool.query(
            `INSERT INTO hrm_employee 
                (us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active) 
            VALUES 
                (?,?,?,?,?,?)`,
            [
                data.us_code,
                data.usc_name,
                data.usc_pass,
                data.usc_alias,
                data.usc_first_name,
                data.usc_active
            ],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results)
            }
        )
    },
    employeeUpdate: (data, callBack) => {
        pool.query(
            `UPDATE hrm_employee
                SET 
                    us_code = ?,
                    usc_name = ?,
                    usc_pass = ?,
                    usc_alias = ?,
                    usc_first_name = ?,
                    usc_active = ?
                WHERE emp_slno = ?`,
            [
                data.us_code,
                data.usc_name,
                data.usc_pass,
                data.usc_alias,
                data.usc_first_name,
                data.usc_active,
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
    getEmployee: (callBack) => {
        pool.query(
            `SELECT * FROM medi_ellider.hrm_employee`,
            [],
            (error, results, feilds) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
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

}