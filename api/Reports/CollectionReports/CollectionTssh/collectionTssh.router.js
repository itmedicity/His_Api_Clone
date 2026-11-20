const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const {getCollectionReports, getUserWiseCollectionSummary} = require("./collectionTssh.controller");

router.get("/getUnsettledAmountUserWise", checkToken, getCollectionReports);
router.post("/getUserWiseCollectionSummary", checkToken, getUserWiseCollectionSummary);
// router.post("/collection", checkToken, collectionReports);

module.exports = router;
