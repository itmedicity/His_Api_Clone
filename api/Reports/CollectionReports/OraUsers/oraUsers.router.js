const {checkToken} = require("../../../../auth/jwtValidation");
const router = require("express").Router();
const {getOraUsers} = require("./oraUsers.controller");

router.get("/", checkToken, getOraUsers);

module.exports = router;
