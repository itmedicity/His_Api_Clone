const router = require('express').Router();
const { checkToken } = require("../../auth/jwtValidation");
const { employeeDelete, employeeGetById, employeeInsert, employeeUpdate, getEmployee, login } = require('../employee/emp.controller');

router.post("/login", login);
router.post('/', checkToken, employeeInsert);
router.patch('/', checkToken, employeeUpdate);
router.get('/', checkToken, getEmployee);
router.get('/:id', checkToken, employeeGetById);
router.delete('/', checkToken, employeeDelete);

module.exports = router;