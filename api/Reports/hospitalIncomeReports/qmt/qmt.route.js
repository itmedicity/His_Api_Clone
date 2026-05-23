const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getQmtReport, getTsshCeditInsuranceBillCollection, getTsshCreditInsuranceBillDetail} = require("./qmt.controller");

router.post("/getQmtReport", checkToken, getQmtReport);
router.post("/getQmtCreditInsuranceBillCollection", checkToken, getTsshCeditInsuranceBillCollection);
router.post("/getQmtCreditInsuranceBills", checkToken, getTsshCreditInsuranceBillDetail);

module.exports = router;
