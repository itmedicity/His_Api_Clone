const router = require('express').Router();
// const { checkToken } = require('../../../../auth/jwtValidation');
const { getOpdatas, getCashcredit } = require('./bis_ellider_datas.controller')

router.post('/opcount', getOpdatas);
router.post('/cashcredit', getCashcredit);
module.exports = router;