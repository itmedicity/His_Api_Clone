const router = require('express').Router();
// const { checkToken } = require("../../auth/jwtValidation");
const { employeeDelete, employeeGetById, employeeInsert, employeeUpdate, getEmployee, login } = require('../employee/emp.controller');

router.post('/login', login);
router.post('/', employeeInsert);
router.patch('/', employeeUpdate);
router.get('/', getEmployee);
router.get('/:id', employeeGetById);
router.delete('/', employeeDelete);

module.exports = router;