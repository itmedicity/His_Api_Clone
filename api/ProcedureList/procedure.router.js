const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { GetProcedureList } = require('./procedure.controller');
router.post('/procedure', checkToken, GetProcedureList);

module.exports = router;