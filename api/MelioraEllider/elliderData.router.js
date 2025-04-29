const { checkToken } = require('../../auth/jwtValidation');
const router = require('express').Router();

const { getOutlet,
    getNursingStation,
    getRoomType,
    getRoomCategory,
    getRoomDetails,
    getInpatientDetails,
    getPatientDetails,
    getNursingBed,
    getCurrentPatient
} = require('./elliderData.controller')

// router.get('/outlet', checkToken, getOutlet);
// router.get('/nurse', checkToken, getNursingStation);
router.get('/roomtype', checkToken, getRoomType);
router.get('/roomcat', checkToken, getRoomCategory);
router.get('/rooms', checkToken, getRoomDetails);
// router.post('/ip', checkToken, getInpatientDetails);
router.get('/patient', checkToken, getPatientDetails);

//feedback dummy
router.get('/nurse', getNursingStation);
router.post('/ip', getInpatientDetails);
router.get('/outlet', getOutlet);
//new api for bed 
router.post('/getbed', getNursingBed)
router.post('/inpatientdetil', getCurrentPatient)

module.exports = router;