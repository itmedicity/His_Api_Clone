const {userGroupInsert, groupAlreadyExist, getUserGroup, userGroupUpdate, searchUserGroup, activetUserGroup} = require("./newgroup.service");

module.exports = {
  userGroupInsert: async (req, res) => {
    try {
      const body = req.body;
      const data = await groupAlreadyExist(body);
      if (data.length > 0) {
        return res.status(200).json({
          success: 7,
          message: "UserGroup Already Exist",
        });
      }
      await userGroupInsert(body);
      return res.status(200).json({
        success: 1,
        message: "UserGroup Created Successfully",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getUserGroup: async (res) => {
    try {
      const data = await getUserGroup();
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Results Found",
        });
      }

      return res.status(200).json({
        success: 2,
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  userGroupUpdate: async (req, res) => {
    try {
      const body = req.body;
      const data = await groupAlreadyExist(body);
      if (data.length > 0) {
        return res.status(200).json({
          success: 7,
          message: "UserGroup Already Exist",
        });
      }
      await userGroupUpdate(body);
      return res.status(200).json({
        success: 2,
        message: "Data Updated Successfully",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  searchUserGroup: async (req, res) => {
    try {
      const body = req.body;
      const data = await searchUserGroup(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No data found",
        });
      }
      return res.status(200).json({
        success: 2,
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  activetUserGroup: async (res) => {
    try {
      const data = await activetUserGroup();
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Results Found",
        });
      }
      return res.status(200).json({
        success: 2,
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
};
