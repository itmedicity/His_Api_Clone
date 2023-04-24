const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { employeeDelete, employeeGetById, employeeInsert, employeeUpdate, getEmployee } = require("../employee/emp.service");

module.exports = {
    employeeInsert: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        let new_password = body.emp_password;
        body.emp_password = hashSync(new_password, salt);

        employeeInsert(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }

            return res.status(200).json({
                success: 1,
                message: results
            });
        })
    },
    employeeUpdate: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        let new_password = body.emp_password;
        body.emp_password = hashSync(new_password, salt);
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
}