const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getCollectionAndIncomeMisReportQMT = require("./misReportQmt.controller");

router.post("/getMisReportQMT", checkToken, getCollectionAndIncomeMisReportQMT);

module.exports = router;
