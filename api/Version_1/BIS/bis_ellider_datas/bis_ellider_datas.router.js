const router = require('express').Router();
// const { checkToken } = require('../../../../auth/jwtValidation');
const { getOpdatas, getCashcredit, getIpAddmissionCount, getDischargeCount } = require('./bis_ellider_datas.controller')

router.post('/opcount', getOpdatas);
router.post('/cashcredit', getCashcredit);
router.post('/ipAddmissioncount', getIpAddmissionCount);
router.post('/getDischargeCount', getDischargeCount);


module.exports = router;


