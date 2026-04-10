const router = require("express").Router();
const {checkToken} = require("../../../../auth/jwtValidation");

const getTsshReport = require("./tssh.controller");

router.post("/getTsshReport", checkToken, getTsshReport);

module.exports = router;
