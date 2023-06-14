const router = require('express').Router();
// const { checkToken } = require("../../auth/jwtValidation");
const { employeeDelete, employeeGetById, employeeInsert, employeeUpdate, employeeResetPass, getEmployee, login, searchEmployee, viewEmployee } = require('../employee/emp.controller');

router.post('/login', login);
router.post('/insert', employeeInsert);
router.patch('/resetpass', employeeResetPass);
router.patch('/update', employeeUpdate);
router.get('/select', getEmployee);
router.get('/view', viewEmployee);
router.get('/:id', employeeGetById);
router.delete('/', employeeDelete);
router.post('/search', searchEmployee)
module.exports = router;