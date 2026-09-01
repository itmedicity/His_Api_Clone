
const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { userRightsInsert, getUserRights, userRightsUpdate } = require('./userRights.controller')

router.post('/insert', checkToken, userRightsInsert);
router.post('/select', checkToken, getUserRights);
router.post('/update', checkToken, userRightsUpdate);


module.exports = router;