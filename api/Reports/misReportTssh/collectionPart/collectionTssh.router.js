const { checkToken } = require('../../../../auth/jwtValidation');
const {
    advanceCollectionTssh
} = require('./collectionTssh.controller')

const router = require('express').Router();

router.post('/advanceCollectionTssh', advanceCollectionTssh);

module.exports = router;