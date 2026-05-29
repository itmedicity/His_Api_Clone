const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getQmtReport, getTsshCeditInsuranceBillCollection, getTsshCreditInsuranceBillDetail, getQmtUnsettledAmount, getQmtAdvanceCollection} = require("./qmt.controller");

router.post("/getQmtReport", checkToken, getQmtReport);
router.post("/getQmtCreditInsuranceBillCollection", checkToken, getTsshCeditInsuranceBillCollection);
router.post("/getQmtCreditInsuranceBills", checkToken, getTsshCreditInsuranceBillDetail);
router.post("/getQmtUnsettledAmount", checkToken, getQmtUnsettledAmount);
router.post("/getQmtAdvanceCollection", checkToken, getQmtAdvanceCollection);

module.exports = router;
