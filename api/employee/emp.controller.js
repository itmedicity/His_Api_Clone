const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

const { employeeDelete,
    employeeGetById,
    employeeInsert,
    employeeResetPass,
    employeeUpdate,
    getEmployee,
    getEmployeeByUserName,
    EmployeeAlreadyExist,
    searchEmployee,
    viewEmployee,
    getMenuRights }
    = require("../employee/emp.service");

const { add } = require("date-fns");

module.exports = {
    employeeInsert: (req, res) => {
        const body = req.body;
        EmployeeAlreadyExist(body, (err, results) => {
            const value = JSON.parse(JSON.stringify(results))
            if (Object.keys(value).length === 0) {
                const salt = genSaltSync(10);
                let usc_pass = body.usc_pass;
                body.usc_pass = hashSync(usc_pass, salt);

                employeeInsert(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        });
                    }

                    return res.status(200).json({
                        success: 1,
                        message: "User Created Successfully"
                    })
                })
            }
            else {
                return res.status(200).json({
                    success: 7,
                    message: "User Already Exist"
                })
            }
        })
    },

    getEmployee: (req, res) => {
        getEmployee((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }

            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: "No Results Found"
                });
            }

            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

    viewEmployee: (req, res) => {
        viewEmployee((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }

            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: "No Results Found"
                });
            }

            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },


    searchEmployee: (req, res) => {
        const body = req.body;
        searchEmployee(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (results.length === 0) {

                return res.status(200).json({
                    success: 1,
                    message: 'No data found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results
            })
        })
    },

    employeeResetPass: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        let usc_pass = body.usc_pass;
        body.usc_pass = hashSync(usc_pass, salt);
        employeeResetPass(body, (err, results) => {

            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (results.length === 0) {
                return res.json({
                    success: 1,
                    message: "Failed to Update"
                });
            }
            return res.status(200).json({
                success: 2,
                message: "Data Updated Successfully"
            });
        });
    },
    employeeUpdate: (req, res) => {
        const body = req.body;
        employeeUpdate(body, (err, results) => {

            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (!results) {
                return res.json({
                    success: 1,
                    message: "Failed to Update"
                });
            }
            return res.status(200).json({
                success: 2,
                message: "Data Updated Successfully"
            });
        });
    },

    employeeGetById: (req, res) => {
        const id = req.params.id;
        employeeGetById(id, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }

            if (!results) {
                return res.status(200).json({
                    success: 0,
                    message: "No Record Found"
                });
            }

            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    employeeDelete: (req, res) => {
        const body = req.body;
        employeeDelete(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: res.err
                });
            }

            if (!results) {
                return res.status(200).json({
                    success: 1,
                    message: "Record Not Found"
                });
            }

            return res.status(200).json({
                success: 2,
                message: "Record Deleted Successfully"
            });
        });
    },
    login: (req, res) => {
        const body = req.body;
        getEmployeeByUserName(body.usc_name, (err, results) => {
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Invalid user Name  or password"
                });
            }
            const get_password = body.usc_pass.toString();
            const result = compareSync(get_password, results.usc_pass);
            if (result) {
                results.usc_pass = undefined;
                const jsontoken = sign({ result: results }, "@dhj$&$(*)dndkm76$%#jdn(^$6GH%^#73*#*", {
                    expiresIn: "12h"
                });
                return res.json({
                    success: 1,
                    message: "login successfully",
                    token: jsontoken,
                    data: results,
                    expireDate: add(new Date(), { hours: 12 })
                });
            } else {
                return res.json({
                    success: 5,
                    message: "error"
                });
            }
        });
    },

    getMenuRights: (req, res) => {
        const id = req.params.id;
        getMenuRights(id, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }

            if (!results) {
                return res.status(200).json({
                    success: 0,
                    message: "No Record Found"
                });
            }

            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },

}