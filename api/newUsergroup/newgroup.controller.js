
const { userGroupInsert, groupAlreadyExist, getUserGroup, userGroupUpdate, searchUserGroup, activetUserGroup } = require('./newgroup.service')

module.exports = {
    userGroupInsert: (req, res) => {
        const body = req.body;
        groupAlreadyExist(body, (err, results) => {
            const value = JSON.parse(JSON.stringify(results))
            if (Object.keys(value).length === 0) {
                userGroupInsert(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        });
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "UserGroup Created Successfully"
                    })
                })

            }
            else {
                return res.status(200).json({
                    success: 7,
                    message: "UserGroup Already Exist"
                })
            }
        })
    },

    getUserGroup: (req, res) => {
        getUserGroup((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: "No Results Found"
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },

    userGroupUpdate: (req, res) => {
        const body = req.body;
        userGroupUpdate(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (!results) {
                return res.json({
                    success: 1,
                    message: "Failed to Update"
                });
            }
            return res.status(200).json({
                success: 2,
                message: "Data Updated Successfully"
            });
        });
    },

    searchUserGroup: (req, res) => {
        const body = req.body;
        searchUserGroup(body, (err, results) => {
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

    activetUserGroup: (req, res) => {
        activetUserGroup((err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                    message: "No Results Found"
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            });
        });
    },
}