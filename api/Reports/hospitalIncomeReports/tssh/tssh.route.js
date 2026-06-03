const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getTsshReport, getTsshCeditInsuranceBillCollection, getTsshCreditInsuranceBillDetail, getTssh_UnsettledAmount, getTssh_AdvanceCollection} = require("./tssh.controller");

router.post("/getTsshReport", checkToken, getTsshReport);
router.post("/getTsshCreditInsuranceBillCollection", checkToken, getTsshCeditInsuranceBillCollection);
router.post("/getTsshCreditInsuranceBills", checkToken, getTsshCreditInsuranceBillDetail);
router.post("/getTssh_UnsettledAmount", checkToken, getTssh_UnsettledAmount);
router.post("/getTssh_AdvanceCollection", checkToken, getTssh_AdvanceCollection);

module.exports = router;
