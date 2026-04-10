const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const getCollectionReports = require("./collectionTmc.controller");

router.get("/getUnsettledAmountUserWise", checkToken, getCollectionReports);
// router.post("/collection", checkToken, collectionReports);

module.exports = router;
