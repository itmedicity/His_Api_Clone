const { checkToken } = require('../../../auth/jwtValidation');
const {
    getIpAdmissionList
} = require('./admissionList.controller');

const router = require('express').Router();

router.post('/getIpadmissionList', checkToken, getIpAdmissionList);

module.exports = router;