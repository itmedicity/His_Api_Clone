
const router = require('express').Router();
const { userGroupInsert, getUserGroup, userGroupUpdate, searchUserGroup, activetUserGroup } = require('./newgroup.controller')

router.post('/insertgroup', userGroupInsert);
router.get('/select', getUserGroup);
router.patch('/update', userGroupUpdate);
router.post('/search', searchUserGroup);
router.get('/active', activetUserGroup);

module.exports = router;