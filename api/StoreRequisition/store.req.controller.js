const { getPharmacyList, searchRequestFromOra, updateReqQntyToOracle, insertToRolSetting, truncateRolSetting } = require('./storereq.service')

module.exports = {
    getPharmacyList: (req, res) => {
        getPharmacyList((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

    searchRequestFromOra: (req, res) => {
        const body = req.body;

        searchRequestFromOra(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: 'No Data Found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },


    insertToRolSetting: (req, res) => {

        truncateRolSetting((err, results) => {

            const body = req.body;
            const data = body.map((val) => {
                return {
                    OU_CODE: val.OU_CODE,
                    IT_CODE: val.IT_CODE,
                    ITN_NAME: val.ITN_NAME,
                    ITN_MAXQTY: val.ITN_MAXQTY,
                    ITN_MINQTY: val.ITN_MINQTY,
                    ITN_MINLVL: val.ITN_MINLVL,
                    ITN_MEDLVL: val.ITN_MEDLVL,
                    ITN_MAXLVL: val.ITN_MAXLVL,
                    STATUS: val.STATUS
                }
            })
            insertToRolSetting(data, (err, results) => {
                if (err) {
                    return res.status(200).json({
                        success: 0,
                        message: err.message
                    });
                }
                return res.status(200).json({
                    success: 1,
                    message: "Data Inserted"
                })
            })
        })
    },

    updateReqQntyToOracle: (req, res) => {
        const body = req.body;
        updateReqQntyToOracle(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err.message
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Data Updated"
            })
        })
    },
}
