
const router = require("express").Router();
const { checkToken } = require('../../auth/jwtValidation');
const { getAntibiotic } = require('./Ams.controller');

router.post("/getAntibiotic", checkToken, getAntibiotic);


// router.post("/getAntibioticPatientDetails", checkToken, getAntibioticPatientDetails);



module.exports = router;