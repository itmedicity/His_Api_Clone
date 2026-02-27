// const {
//   employeeDelete,
//   employeeGetById,
//   employeeInsert,
//   employeeResetPass,
//   employeeUpdate,
//   getEmployee,
//   getEmployeeByUserName,
//   EmployeeAlreadyExist,
//   searchEmployee,
//   viewEmployee,
//   getMenuRights,
// } = require("../employee/emp.service");

const {
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
} = require("./emp.service");

const {genSaltSync, hashSync, compareSync} = require("bcrypt");
const {sign} = require("jsonwebtoken");
const {add} = require("date-fns");

const createEmployee = async (req, res) => {
  try {
    const body = req.body;

    const existing = await employeeAlreadyExist(body);
    if (existing.length > 0) {
      return res.status(200).json({
        success: 7,
        message: "User Already Exist",
      });
    }

    const salt = genSaltSync(10);
    body.usc_pass = hashSync(body.usc_pass, salt);

    await employeeInsert(body);

    return res.status(200).json({
      success: 1,
      message: "User Created Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const rows = await getEmployee();

    if (!rows.length) {
      return res.status(200).json({
        success: 1,
        message: "No Results Found",
      });
    }

    return res.status(200).json({
      success: 2,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const viewEmployees = async (req, res) => {
  try {
    const rows = await viewEmployee();

    if (!rows.length) {
      return res.status(200).json({
        success: 1,
        message: "No Results Found",
      });
    }

    return res.status(200).json({
      success: 2,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const rows = await searchEmployee(req.body);

    if (!rows.length) {
      return res.status(200).json({
        success: 1,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: 2,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const resetEmployeePassword = async (req, res) => {
  try {
    const body = req.body;

    const salt = genSaltSync(10);
    body.usc_pass = hashSync(body.usc_pass, salt);

    await employeeResetPass(body);

    return res.status(200).json({
      success: 2,
      message: "Password Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    await employeeUpdate(req.body);

    return res.status(200).json({
      success: 2,
      message: "Data Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const getEmployeeByIdCtrl = async (req, res) => {
  try {
    const row = await employeeGetById(req.params.id);

    if (!row) {
      return res.status(200).json({
        success: 0,
        message: "No Record Found",
      });
    }

    return res.status(200).json({
      success: 1,
      data: row,
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    await employeeDelete(req.body);

    return res.status(200).json({
      success: 2,
      message: "Record Deleted Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  //   console.log(req.body);
  try {
    const {usc_name, usc_pass} = req.body;
    // console.log(usc_name, usc_pass);

    const user = await getEmployeeByUserName(usc_name);
    if (!user) {
      return res.json({
        success: 0,
        message: "Invalid username or password",
      });
    }

    const isMatch = compareSync(usc_pass, user.usc_pass);
    if (!isMatch) {
      return res.json({
        success: 5,
        message: "Invalid username or password",
      });
    }

    user.usc_pass = undefined;

    const token = sign({result: user}, "@dhj$&$(*)dndkm76$%#jdn(^$6GH%^#73*#*", {expiresIn: "12h"});

    return res.json({
      success: 1,
      message: "Login successfully",
      token,
      data: user,
      expireDate: add(new Date(), {hours: 12}),
    });
  } catch (err) {
    return res.status(200).json({
      success: 0,
      message: err.message,
    });
  }
};

const menuRights = async (req, res) => {
  try {
    const rows = await getMenuRights(req.params.id);

    if (!rows) {
      return res.status(200).json({
        success: 0,
        message: "No Record Found",
      });
    }

    return res.status(200).json({
      success: 1,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: 0,
      message: err.message,
    });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  viewEmployees,
  searchEmployees,
  resetEmployeePassword,
  updateEmployee,
  getEmployeeByIdCtrl,
  deleteEmployee,
  login,
  menuRights,
};

// module.exports = {
//   employeeInsert: async (req, res) => {
//     try {
//       const body = req.body;
//       const excist = await EmployeeAlreadyExist(body);
//       const value = JSON.parse(JSON.stringify(excist));
//       if (value) {
//         return res.status(200).json({
//           success: 7,
//           message: "User Already Exist",
//         });
//       }

//       if (Object.keys(value).length === 0) {
//         const salt = genSaltSync(10);
//         let usc_pass = body.usc_pass;
//         body.usc_pass = hashSync(usc_pass, salt);
//         // insert employee
//         await employeeInsert(body);
//         return res.status(200).json({
//           success: 1,
//           message: "User Created Successfully",
//         });
//       }
//     } catch (error) {
//       return res.status(200).json({
//         success: 0,
//         message: error.message,
//       });
//     }
//   },
//   // EmployeeAlreadyExist(body, (err, results) => {
//   //   const value = JSON.parse(JSON.stringify(results));
//   //   if (Object.keys(value).length === 0) {
//   //     const salt = genSaltSync(10);
//   //     let usc_pass = body.usc_pass;
//   //     body.usc_pass = hashSync(usc_pass, salt);

//   //     employeeInsert(body, (err, results) => {
//   //       if (err) {
//   //         return res.status(200).json({
//   //           success: 0,
//   //           message: err.message,
//   //         });
//   //       }

//   //       return res.status(200).json({
//   //         success: 1,
//   //         message: "User Created Successfully",
//   //       });
//   //     });
//   //   } else {
//   //     return res.status(200).json({
//   //       success: 7,
//   //       message: "User Already Exist",
//   //     });
//   //   }
//   // });

//   getEmployee: (req, res) => {
//     getEmployee((err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(200).json({
//           success: 1,
//           message: "No Results Found",
//         });
//       }

//       return res.status(200).json({
//         success: 2,
//         data: results,
//       });
//     });
//   },

//   viewEmployee: (req, res) => {
//     viewEmployee((err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(200).json({
//           success: 1,
//           message: "No Results Found",
//         });
//       }

//       return res.status(200).json({
//         success: 2,
//         data: results,
//       });
//     });
//   },

//   searchEmployee: (req, res) => {
//     const body = req.body;
//     searchEmployee(body, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }
//       if (results.length === 0) {
//         return res.status(200).json({
//           success: 1,
//           message: "No data found",
//         });
//       }
//       return res.status(200).json({
//         success: 2,
//         data: results,
//       });
//     });
//   },

//   employeeResetPass: (req, res) => {
//     const body = req.body;
//     const salt = genSaltSync(10);
//     let usc_pass = body.usc_pass;
//     body.usc_pass = hashSync(usc_pass, salt);
//     employeeResetPass(body, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }
//       if (results.length === 0) {
//         return res.json({
//           success: 1,
//           message: "Failed to Update",
//         });
//       }
//       return res.status(200).json({
//         success: 2,
//         message: "Data Updated Successfully",
//       });
//     });
//   },
//   employeeUpdate: (req, res) => {
//     const body = req.body;
//     employeeUpdate(body, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }
//       if (!results) {
//         return res.json({
//           success: 1,
//           message: "Failed to Update",
//         });
//       }
//       return res.status(200).json({
//         success: 2,
//         message: "Data Updated Successfully",
//       });
//     });
//   },

//   employeeGetById: (req, res) => {
//     const id = req.params.id;
//     employeeGetById(id, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }

//       if (!results) {
//         return res.status(200).json({
//           success: 0,
//           message: "No Record Found",
//         });
//       }

//       return res.status(200).json({
//         success: 1,
//         data: results,
//       });
//     });
//   },
//   employeeDelete: (req, res) => {
//     const body = req.body;
//     employeeDelete(body, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: res.err,
//         });
//       }

//       if (!results) {
//         return res.status(200).json({
//           success: 1,
//           message: "Record Not Found",
//         });
//       }

//       return res.status(200).json({
//         success: 2,
//         message: "Record Deleted Successfully",
//       });
//     });
//   },
//   login: (req, res) => {
//     const body = req.body;
//     getEmployeeByUserName(body.usc_name, (err, results) => {
//       if (!results) {
//         return res.json({
//           success: 0,
//           message: "Invalid user Name  or password",
//         });
//       }
//       const get_password = body.usc_pass.toString();
//       const result = compareSync(get_password, results.usc_pass);
//       if (result) {
//         results.usc_pass = undefined;
//         const jsontoken = sign({result: results}, "@dhj$&$(*)dndkm76$%#jdn(^$6GH%^#73*#*", {
//           expiresIn: "12h",
//         });
//         return res.json({
//           success: 1,
//           message: "login successfully",
//           token: jsontoken,
//           data: results,
//           expireDate: add(new Date(), {hours: 12}),
//         });
//       } else {
//         return res.json({
//           success: 5,
//           message: "error",
//         });
//       }
//     });
//   },

//   getMenuRights: (req, res) => {
//     const id = req.params.id;
//     getMenuRights(id, (err, results) => {
//       if (err) {
//         return res.status(200).json({
//           success: 0,
//           message: err,
//         });
//       }

//       if (!results) {
//         return res.status(200).json({
//           success: 0,
//           message: "No Record Found",
//         });
//       }

//       return res.status(200).json({
//         success: 1,
//         data: results,
//       });
//     });
//   },
// };
