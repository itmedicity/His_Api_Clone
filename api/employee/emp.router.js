const router = require("express").Router();
const {checkToken} = require("../../auth/jwtValidation");
// const { employeeDelete,
//     employeeGetById,
//     employeeInsert,
//     employeeUpdate,
//     employeeResetPass,
//     getEmployee,
//     login,
//     searchEmployee,
//     viewEmployee,
//     getMenuRights } = require('./emp.controller');

// router.post('/login', login);
// router.post('/insert', employeeInsert);
// router.patch('/resetpass', employeeResetPass);
// router.patch('/update', employeeUpdate);
// router.get('/select', getEmployee);
// router.get('/view', viewEmployee);
// router.get('/:id', employeeGetById);
// router.delete('/', employeeDelete);
// router.post('/search', searchEmployee);
// router.get('/getmenu/:id', getMenuRights);
// module.exports = router;

const {createEmployee, getAllEmployees, viewEmployees, searchEmployees, resetEmployeePassword, updateEmployee, getEmployeeByIdCtrl, deleteEmployee, login, menuRights} = require("./emp.controller");

/* ---------------- AUTH ---------------- */
router.post("/login", login);

/* ---------------- EMPLOYEE CRUD ---------------- */
router.post("/insert", checkToken, createEmployee);
router.patch("/resetpass", checkToken, resetEmployeePassword);
router.patch("/update", checkToken, updateEmployee);
router.get("/select", checkToken, getAllEmployees);
router.get("/view", checkToken, viewEmployees);
router.get("/:id", checkToken, getEmployeeByIdCtrl);
router.delete("/", checkToken, deleteEmployee);
router.post("/search", checkToken, searchEmployees);

/* ---------------- MENU RIGHTS ---------------- */
router.get("/getmenu/:id", checkToken, menuRights);

module.exports = router;
