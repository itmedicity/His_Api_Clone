const {pools, query, transaction} = require("../../config/mysqldbconfig");

const employeeInsert = async (data) => {
  await query(
    "ellider",
    `
    INSERT INTO hrm_employee
    (us_code, usc_name, usc_pass, usc_alias, usc_first_name, usc_active, user_group_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [data.us_code ?? null, data.usc_name ?? null, data.usc_pass ?? null, data.usc_alias ?? null, data.usc_first_name ?? null, data.usc_active ?? 1, data.user_group_id ?? null],
  );
};

const employeeAlreadyExist = async (data) => {
  return query("ellider", "SELECT usc_name FROM hrm_employee WHERE usc_name = ?", [data.usc_name]);
};

const getEmployee = async () => {
  return query(
    "ellider",
    `
    SELECT 
      emp_slno,
      us_code,
      usc_name,
      usc_pass,
      usc_alias,
      usc_first_name,
      usc_active,
      ug.user_group_name,
      e.user_group_id
    FROM hrm_employee e
    LEFT JOIN user_group ug 
      ON ug.user_group_id = e.user_group_id
    ORDER BY e.usc_name
    `,
  );
};

const viewEmployee = async () => {
  return query(
    "ellider",
    `
    SELECT 
      emp_slno,
      usc_name,
      usc_alias,
      usc_first_name,
      usc_active,
      ug.user_group_name
    FROM hrm_employee e
    LEFT JOIN user_group ug 
      ON ug.user_group_id = e.user_group_id
    `,
  );
};

const searchEmployee = async (data) => {
  return query(
    "ellider",
    `
    SELECT 
      emp_slno,
      us_code,
      usc_name,
      usc_pass,
      usc_alias,
      usc_first_name,
      usc_active,
      ug.user_group_name
    FROM hrm_employee e
    LEFT JOIN user_group ug 
      ON ug.user_group_id = e.user_group_id
    WHERE e.usc_name LIKE ?
      AND e.usc_alias LIKE ?
      AND e.usc_first_name LIKE ?
    ORDER BY e.usc_name
    `,
    [`%${data.usc_name ?? ""}%`, `%${data.usc_alias ?? ""}%`, `%${data.usc_first_name ?? ""}%`],
  );
};

const employeeResetPass = async (data) => {
  await query(
    "ellider",
    `
    UPDATE hrm_employee
    SET 
      usc_name = ?,
      usc_pass = ?,
      usc_alias = ?,
      usc_first_name = ?,
      usc_active = ?,
      user_group_id = ?
    WHERE emp_slno = ?
    `,
    [data.usc_name, data.usc_pass, data.usc_alias, data.usc_first_name, data.usc_active, data.user_group_id, data.emp_slno],
  );
};

const employeeUpdate = async (data) => {
  await query(
    "ellider",
    `
    UPDATE hrm_employee
    SET 
      usc_name = ?,
      usc_alias = ?,
      usc_first_name = ?,
      usc_active = ?,
      user_group_id = ?
    WHERE emp_slno = ?
    `,
    [data.usc_name, data.usc_alias, data.usc_first_name, data.usc_active, data.user_group_id, data.emp_slno],
  );
};

const employeeGetById = async (id) => {
  const rows = await query(
    "ellider",
    `
    SELECT 
      emp_slno,
      us_code,
      usc_name,
      usc_pass,
      usc_alias,
      usc_first_name,
      usc_active
    FROM hrm_employee
    WHERE emp_slno = ?
    `,
    [id],
  );

  return rows[0] ?? null;
};

const employeeDelete = async (data) => {
  await query("ellider", "UPDATE hrm_employee SET usc_active = 0 WHERE emp_slno = ?", [data.emp_slno]);
};

const getEmployeeByUserName = async (userName) => {
  const rows = await query(
    "ellider",
    `
    SELECT *
    FROM hrm_employee
    WHERE usc_name = ?
      AND usc_active = 1
    `,
    [userName],
  );
  return rows[0] ?? null;
};

const getMenuRights = async (id) => {
  const rows = await query("ellider", "CALL GET_MENULIST(?)", [id]);
  return rows[0];
};

module.exports = {
  employeeInsert,
  employeeAlreadyExist,
  getEmployee,
  viewEmployee,
  searchEmployee,
  employeeResetPass,
  employeeUpdate,
  employeeGetById,
  employeeDelete,
  getEmployeeByUserName,
  getMenuRights,
};

// module.exports = {
//   employeeInsert: async (data) => {
//     await query("ellider", "INSERT INTO hrm_employee (us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group_id) VALUES (?,?,?,?,?,?,?)", [
//       data.us_code ?? null,
//       data.usc_name ?? null,
//       data.usc_pass ?? null,
//       data.usc_alias ?? null,
//       data.usc_first_name ?? null,
//       data.usc_active ?? null,
//       data.user_group_id ?? null,
//     ]);
//   },
//   // pool.query(
//   //   `INSERT INTO hrm_employee
//   //             (us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group_id)
//   //         VALUES
//   //             (?,?,?,?,?,?,?)`,
//   //   [data.us_code, data.usc_name, data.usc_pass, data.usc_alias, data.usc_first_name, data.usc_active, data.user_group_id],
//   //   (error, results, feilds) => {
//   //     if (error) {
//   //       return callBack(error);
//   //     }
//   //     return callBack(null, results);
//   //   },
//   // );

//   EmployeeAlreadyExist: async (data) => {
//     return await query("ellider", `select usc_name from hrm_employee where usc_name = ?`, [data.usc_name]);
//     // pool.query(`select usc_name from hrm_employee where usc_name = ?`, [data.usc_name], (err, results, feilds) => {
//     //   if (err) {
//     //     return callBack(err);
//     //   }
//     //   return callBack(null, results);
//     // });
//   },
//   getEmployee: (callBack) => {
//     pool.query(
//       `SELECT emp_slno,us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group.user_group_name,hrm_employee.user_group_id FROM medi_ellider.hrm_employee
//             left join user_group on user_group.user_group_id=hrm_employee.user_group_id order by hrm_employee.usc_name`,
//       [],
//       (error, results, feilds) => {
//         if (error) {
//           return callBack(error);
//         }
//         return callBack(null, results);
//       },
//     );
//   },

//   viewEmployee: (callBack) => {
//     pool.query(
//       `SELECT emp_slno,usc_name,usc_alias,usc_first_name,usc_active,user_group.user_group_name FROM medi_ellider.hrm_employee
//             left join user_group on user_group.user_group_id=hrm_employee.user_group_id`,
//       [],
//       (error, results, feilds) => {
//         if (error) {
//           return callBack(error);
//         }
//         return callBack(null, results);
//       },
//     );
//   },

//   searchEmployee: (data, callBack) => {
//     pool.query(
//       `select emp_slno,us_code,usc_name,usc_pass,usc_alias,usc_first_name,usc_active,user_group.user_group_name from medi_ellider.hrm_employee
//         left join user_group on user_group.user_group_id=hrm_employee.user_group_id
//         where usc_name like ? and usc_alias like ? and usc_first_name like ? order by usc_name`,
//       ["%" + data.usc_name + "%", "%" + data.usc_alias + "%", "%" + data.usc_first_name + "%"],
//       (err, results, feilds) => {
//         if (err) {
//           return callBack(err);
//         }
//         return callBack(null, results);
//       },
//     );
//   },

//   employeeResetPass: (data, callBack) => {
//     pool.query(
//       `UPDATE hrm_employee
//                 SET
//                    usc_name = ?,
//                     usc_pass = ?,
//                     usc_alias = ?,
//                     usc_first_name = ?,
//                     usc_active = ?,
//                     user_group_id=?
//                 WHERE emp_slno = ?`,
//       [data.usc_name, data.usc_pass, data.usc_alias, data.usc_first_name, data.usc_active, data.user_group_id, data.emp_slno],
//       (error, results, feilds) => {
//         if (error) {
//           return callBack(error);
//         }
//         return callBack(null, results);
//       },
//     );
//   },

//   employeeUpdate: (data, callBack) => {
//     pool.query(
//       `UPDATE hrm_employee
//                 SET
//                     usc_name = ?,
//                     usc_alias = ?,
//                     usc_first_name = ?,
//                     usc_active = ?,
//                     user_group_id=?
//                 WHERE emp_slno = ?`,
//       [data.usc_name, data.usc_alias, data.usc_first_name, data.usc_active, data.user_group_id, data.emp_slno],
//       (error, results, feilds) => {
//         if (error) {
//           return callBack(error);
//         }
//         return callBack(null, results);
//       },
//     );
//   },

//   employeeGetById: (id, callBack) => {
//     pool.query(
//       `SELECT
//                 emp_slno,
//                 us_code,
//                 usc_name,
//                 usc_pass,
//                 usc_alias,
//                 usc_first_name,
//                 usc_active
//             FROM medi_ellider.hrm_employee
//             WHERE emp_slno = ?`,
//       [id],
//       (error, results, feilds) => {
//         if (error) {
//           return callBack(error);
//         }

//         return callBack(null, results[0]);
//       },
//     );
//   },
//   employeeDelete: (data, callBack) => {
//     pool.query(`UPDATE hrm_employee SET usc_active = 0 WHERE emp_slno = ?`, [data.emp_slno], (error, results, feilds) => {
//       if (error) {
//         return callBack(error);
//       }
//       return callBack(null, results);
//     });
//   },
//   getEmployeeByUserName: (userName, callBack) => {
//     pool.query(`SELECT * FROM medi_ellider.hrm_employee WHERE usc_name = ?  AND usc_active = 1`, [userName], (error, results, fields) => {
//       if (error) {
//         callBack(error);
//         console.log(error);
//       }
//       return callBack(null, results[0]);
//     });
//   },
//   getMenuRights: (id, callBack) => {
//     pool.query(`call GET_MENULIST(?) `, [id], (error, results, feilds) => {
//       if (error) {
//         return callBack(error);
//       }

//       return callBack(null, results[0]);
//     });
//   },
// };
