const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getTsshReport, getTsshCeditInsuranceBillCollection, getTsshCreditInsuranceBillDetail} = require("./tssh.controller");

router.post("/getTsshReport", checkToken, getTsshReport);
router.post("/getTsshCreditInsuranceBillCollection", checkToken, getTsshCeditInsuranceBillCollection);
router.post("/getTsshCreditInsuranceBills", checkToken, getTsshCreditInsuranceBillDetail);

module.exports = router;
