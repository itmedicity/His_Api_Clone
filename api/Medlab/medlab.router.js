const router = require('express').Router();

const { checkToken } = require('../../auth/jwtValidation');
const { getAllPatientLabResults, getAllIcuBeds } = require('./medlab.controller');


router.get('/getpatientlabresult', getAllPatientLabResults);
router.get('/geticubeds',checkToken, getAllIcuBeds);


module.exports = router;