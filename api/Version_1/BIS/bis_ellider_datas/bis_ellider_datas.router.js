const router = require('express').Router();
// const { checkToken } = require('../../../../auth/jwtValidation');
const { getOpdatas } = require('./bis_ellider_datas.controller')

router.post('/opcount', getOpdatas);
module.exports = router;