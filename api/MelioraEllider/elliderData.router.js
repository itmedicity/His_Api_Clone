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
    getCurrentPatient,
    getDisChargedPatient,
    getInpatientFollowUp
} = require('./elliderData.controller')

// router.get('/outlet', checkToken, getOutlet);
// router.get('/nurse', checkToken, getNursingStation);
router.get('/roomtype', checkToken, getRoomType);
router.get('/roomcat', checkToken, getRoomCategory);
router.get('/rooms', checkToken, getRoomDetails);
// router.post('/ip', checkToken, getInpatientDetails);
router.get('/patient', checkToken, getPatientDetails);

router.get('/nurse', getNursingStation);
router.post('/ip', getInpatientDetails);
router.get('/outlet', getOutlet);

router.post('/getbed', getNursingBed)
router.post('/inpatientdetil', getCurrentPatient)

router.post('/getdischargepatient', getDisChargedPatient)
router.post('/getipfollowup', getInpatientFollowUp)


module.exports = router;