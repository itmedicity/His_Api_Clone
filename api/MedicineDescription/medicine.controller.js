
const { getMedicinesFromOracle, getMedicinesForUpdates,
    medicineImportedDateUpdate,
    getImportedDate,
    getMedicinesFromMysql,
    searchMedicines,
    medicineDetailsUpdate } = require('./medicine.service')

module.exports = {
    getMedicinesFromOracle: (req, res) => {
        const body = req.body;
        getMedicinesFromMysql((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            const value = JSON.parse(JSON.stringify(results))
            if (Object.keys(value).length === 0) {
                getMedicinesFromOracle(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err
                        })
                    }
                    return res.status(200).json({
                        success: 2,
                        message: 'Medicines are Imported',
                    })
                });
            }
            else {
                getMedicinesForUpdates(body, (errr, results) => {
                    if (errr) {
                        return res.status(200).json({
                            success: 0,
                            message: errr
                        })
                    }
                    return res.status(200).json({
                        success: 2,
                        message: 'Medicines are Imported'
                    })
                });
            }
        });
    },
    medicineImportedDateUpdate: (req, res) => {
        const body = req.body;
        medicineImportedDateUpdate(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            return res.status(200).json({
                success: 2,
            });
        });
    },

    getImportedDate: (req, res) => {
        getImportedDate((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

    getMedicinesFromMysql: (req, res) => {
        getMedicinesFromMysql((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: "No Data Found"
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

    searchMedicines: (req, res) => {
        const body = req.body;
        searchMedicines(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (results.length === 0) {

                return res.status(200).json({
                    success: 1,
                    message: 'No data found'
                })
            }
            return res.status(200).json({
                success: 2,
                data: results
            })
        })
    },

    medicineDetailsUpdate: (req, res) => {
        const body = req.body;
        medicineDetailsUpdate(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (!results) {
                return res.status(200).json({
                    success: 1,
                    message: "Failed to Update"
                });
            }
            else {
                return res.status(200).json({
                    success: 2,
                    message: "Data Updated Successfully"
                });
            }

        });

        // updateOracleMedicine(body, (err, results) => {
        //     if (err) {
        //         return res.status(200).json({
        //             success: 0,
        //             message: err
        //         });
        //     }
        //     if (!results) {
        //         return res.status(200).json({
        //             success: 1,
        //         });
        //     }
        //     return res.status(200).json({
        //         success: 2,

        //     });
        // });

    },




}