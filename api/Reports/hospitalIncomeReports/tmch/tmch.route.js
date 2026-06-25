const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const {getTmchReport, getCeditInsuranceBillCollection, getCreditInsuranceBillDetail, getUnsettledAmountDetails, getAdvanceCollection_TMCH, getProcedureDetails_TMCH} = require("./tmch.controller");

router.post("/getTmchReport", checkToken, getTmchReport);
router.post("/getCreditInsuranceBillCollection", checkToken, getCeditInsuranceBillCollection);
router.post("/getCreditInsuranceBills", checkToken, getCreditInsuranceBillDetail);
router.post("/getUnsettledAmountBills", checkToken, getUnsettledAmountDetails);
router.post("/getAdvanceCollection", checkToken, getAdvanceCollection_TMCH);
router.post("/getProcedureDetails", checkToken, getProcedureDetails_TMCH);

module.exports = router;
