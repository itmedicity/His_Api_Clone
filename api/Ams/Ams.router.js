
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getAntibiotic,getAntibioticItemCode,
    getMicrobiologyTest
 } = require('./Ams.controller');

router.post("/getAntibiotic", checkToken, getAntibiotic);
router.get("/getAntibioticItemCode", checkToken, getAntibioticItemCode);
router.get(`/getMicrobiologyTest/:id`, checkToken, getMicrobiologyTest);




module.exports = router;