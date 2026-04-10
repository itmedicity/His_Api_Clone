const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getCollectionAndIncomeMisReportTMCH = require("./misReportTMCH.controller");

router.post("/getMisIncomeCollectionReportTMCH", checkToken, getCollectionAndIncomeMisReportTMCH);

module.exports = router;
