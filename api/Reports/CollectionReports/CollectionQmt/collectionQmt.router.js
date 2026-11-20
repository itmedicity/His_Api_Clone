const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const {getCollectionReports, getUserWiseCollectionSummary} = require("./collectionQmt.controller");

router.get("/getUnsettledAmountUserWise", checkToken, getCollectionReports);
router.get("/getUserWiseCollectionSummary", checkToken, getUserWiseCollectionSummary);
// router.post("/collection", checkToken, collectionReports);

module.exports = router;
