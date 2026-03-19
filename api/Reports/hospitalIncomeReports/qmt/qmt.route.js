const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getQmtReport = require("./qmt.controller");

router.post("/getQmtReport", checkToken, getQmtReport);

module.exports = router;
