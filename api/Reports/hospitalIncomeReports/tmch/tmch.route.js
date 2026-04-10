const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getTmchReport = require("./tmch.controller");

router.post("/getTmchReport", checkToken, getTmchReport);

module.exports = router;
