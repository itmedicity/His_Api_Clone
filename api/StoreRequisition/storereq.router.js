const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getPharmacyList, searchRequestFromOra, updateReqQntyToOracle, insertToRolSetting } = require('./store.req.controller')

router.get('/select', checkToken, getPharmacyList);
router.post('/getmed', checkToken, searchRequestFromOra);
router.patch('/update', checkToken, updateReqQntyToOracle);
router.post('/insert', checkToken, insertToRolSetting);
module.exports = router;