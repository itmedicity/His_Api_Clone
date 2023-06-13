const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { employeeDelete, employeeGetById, employeeInsert, employeeUpdate, getEmployee, getEmployeeByUserName } = require("../employee/emp.service");
const { add } = require("date-fns");

module.exports = {
    //Test
    employeeInsert: (req, res) => {
        const body = req.body;
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
                message: "Data Inserted Successfully"
            });
        })
    },
    employeeUpdate: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        let usc_pass = body.usc_pass;
        body.usc_pass = hashSync(usc_pass, salt);
        employeeUpdate(body, (err, results) => {

            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Failed to Update"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Data Updated Successfully"
            });
        });
    },
    getEmployee: (req, res) => {
        getEmployee((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 10,
                    message: err
                });
            }

            if (!results) {
                return res.status(200).json({
                    success: 0,
                    message: "No Results Found"
                });
            }

            return res.status(200).json({
                success: 1,
                data: results
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
                return res.status(400).json({
                    success: 0,
                    message: res.err
                });
            }

            if (!results) {
                return res.status(400).json({
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
        console.log(body)
        getEmployeeByUserName(body.usc_name, (err, results) => {
            if (!results) {
                return res.json({
                    success: 0,
                    data: "Invalid user Name  or password"
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
                    success: 0,
                    message: "error"
                });
            }
        });
    },
}