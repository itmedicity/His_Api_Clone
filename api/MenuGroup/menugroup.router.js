const router = require("express").Router();
const {checkToken} = require("../../auth/jwtValidation");
const {getModuleList, getMenuList, menuGroupInsert, getGroupMapDetails, menuGroupUpdate, getMenuNameDetails} = require("./menugroup.controller");

router.get("/selectmodule", checkToken, getModuleList);
router.post("/selectmenu", checkToken, getMenuList);
router.post("/insert", checkToken, menuGroupInsert);
router.get("/select", checkToken, getGroupMapDetails);
router.patch("/update", checkToken, menuGroupUpdate);
router.post("/getmenu", checkToken, getMenuNameDetails);

module.exports = router;
