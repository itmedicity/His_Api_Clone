const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getTmchReport, getCeditInsuranceBillCollection, getCreditInsuranceBillDetail} = require("./tmch.controller");

router.post("/getTmchReport", checkToken, getTmchReport);
router.post("/getCreditInsuranceBillCollection", checkToken, getCeditInsuranceBillCollection);
router.post("/getCreditInsuranceBills", checkToken, getCreditInsuranceBillDetail);

module.exports = router;
