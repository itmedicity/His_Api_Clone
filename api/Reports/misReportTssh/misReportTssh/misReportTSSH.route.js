const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getCollectionAndIncomeMisReportTSSH = require("./misReportTSSH.controller");

router.post("/getMisIncomeCollectionReportTSSH", checkToken, getCollectionAndIncomeMisReportTSSH);

module.exports = router;
