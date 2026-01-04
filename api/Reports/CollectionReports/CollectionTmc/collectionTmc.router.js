const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const {getUnsettledAmountUserWise} = require("./collectionTmc.controller");

router.get("/getUnsettledAmountUserWise", checkToken, getUnsettledAmountUserWise);

module.exports = router;
