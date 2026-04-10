const {checkToken} = require("../../../../auth/jwtValidation");
const {getGstreportsPartOne, getGstreportsPartTwo, getGstreportsPartThree, getGstreportsPartFour, getGstreportsPartFive} = require("./gstReports.controller");

const router = require("express").Router();

router.post("/getGstreportsPartOne", checkToken, getGstreportsPartOne);
router.post("/getGstreportsPartTwo", checkToken, getGstreportsPartTwo);
router.post("/getGstreportsPartThree", checkToken, getGstreportsPartThree);
router.post("/getGstreportsPartFour", checkToken, getGstreportsPartFour);
router.post("/getGstreportsPartFive", checkToken, getGstreportsPartFive);

module.exports = router;
