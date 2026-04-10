const router = require("express").Router();
// // const { checkToken } = require("../../auth/jwtValidation");
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
router.post("/insert", createEmployee);
router.patch("/resetpass", resetEmployeePassword);
router.patch("/update", updateEmployee);
router.get("/select", getAllEmployees);
router.get("/view", viewEmployees);
router.get("/:id", getEmployeeByIdCtrl);
router.delete("/", deleteEmployee);
router.post("/search", searchEmployees);

/* ---------------- MENU RIGHTS ---------------- */
router.get("/getmenu/:id", menuRights);

module.exports = router;
