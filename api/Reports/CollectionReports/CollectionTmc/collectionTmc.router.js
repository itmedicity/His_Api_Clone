const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const {getUnsettledAmountUserWise, collectionReports001} = require("./collectionTmc.controller");

router.get("/getUnsettledAmountUserWise", checkToken, getUnsettledAmountUserWise);
// router.post("/collection", checkToken, collectionReports);

module.exports = router;
