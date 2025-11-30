const { getAllPatientLabResults, getAllIcuBeds } = require('./medlab.service');

module.exports = {
    getAllPatientLabResults: (req, res) => {
        getAllPatientLabResults((err, results) => {
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
    getAllIcuBeds: (req, res) => {
        getAllIcuBeds((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                })
            }
            if (Object.keys(results).length === 0) {
                return res.status(200).json({
                    success: 2,
                    message: 'No Data Found',
                    data: []
                })
            }

            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    }



}
