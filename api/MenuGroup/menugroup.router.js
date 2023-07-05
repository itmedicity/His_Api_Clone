const router = require('express').Router();
const { getModuleList, getMenuList, menuGroupInsert, getGroupMapDetails, menuGroupUpdate, getMenuNameDetails } = require('./menugroup.controller')

router.get('/selectmodule', getModuleList);
router.post('/selectmenu', getMenuList);
router.post('/insert', menuGroupInsert);
router.get('/select', getGroupMapDetails);
router.patch('/update', menuGroupUpdate);
router.post('/getmenu', getMenuNameDetails);

module.exports = router;