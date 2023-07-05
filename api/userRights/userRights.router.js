
const router = require('express').Router();
const { userRightsInsert, getUserRights, userRightsUpdate } = require('./userRights.controller')

router.post('/insert', userRightsInsert);
router.post('/select', getUserRights);
router.post('/update', userRightsUpdate);


module.exports = router;