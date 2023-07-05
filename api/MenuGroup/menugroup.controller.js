const { getModuleList, getMenuList, menuGroupInsert, menugroupAlreadyExist, getGroupMapDetails, menuGroupUpdate, getMenuNameDetails } = require('./menugroup.service')

module.exports = {
    getModuleList: (req, res) => {
        getModuleList((err, results) => {
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

    getMenuList: (req, res) => {
        const body = req.body;
        getMenuList(body, (err, results) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: err
                });
            }
            if (results.length === 0) {
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


    menuGroupInsert: (req, res) => {
        const body = req.body;
        menugroupAlreadyExist(body, (err, results) => {
            const value = JSON.parse(JSON.stringify(results))
            if (Object.keys(value).length === 0) {
                menuGroupInsert(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: err.message
                        });
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "MenuGroup Created Successfully"
                    })
                })

            }
            else {
                return res.status(200).json({
                    success: 7,
                    message: "MenuGroup Already Exist"
                })
            }
        })
    },


    getGroupMapDetails: (req, res) => {
        getGroupMapDetails((err, results) => {
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

    menuGroupUpdate: (req, res) => {
        const body = req.body;
        menuGroupUpdate(body, (err, results) => {
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

    getMenuNameDetails: (req, res) => {
        const body = req.body;
        getMenuNameDetails(body, (err, results) => {
            if (err) {
                return res.status(400).json({
                    success: 0,
                    message: err
                })
            }
            if (results.length === 0) {
                return res.status(200).json({
                    success: 1,
                });
            }
            return res.status(200).json({
                success: 2,
                data: results
            })
        })

    },


}
