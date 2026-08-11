
const router = require('express').Router();
const { checkToken } = require('../../auth/jwtValidation');
const { userGroupInsert, getUserGroup, userGroupUpdate, searchUserGroup, activetUserGroup } = require('./newgroup.controller')

router.post('/insertgroup', checkToken, userGroupInsert);
router.get('/select', checkToken, getUserGroup);
router.patch('/update', checkToken, userGroupUpdate);
router.post('/search', checkToken, searchUserGroup);
router.get('/active', checkToken, activetUserGroup);

module.exports = router;