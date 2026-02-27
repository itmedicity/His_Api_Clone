const {getModuleList, getMenuList, menuGroupInsert, menugroupAlreadyExist, getGroupMapDetails, menuGroupUpdate, getMenuNameDetails} = require("./menugroup.service");

module.exports = {
  getModuleList: async (req, res) => {
    try {
      const data = await getModuleList();
      console.log(data);
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

  getMenuList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getMenuList(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
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

  menuGroupInsert: async (req, res) => {
    try {
      const body = req.body;
      const excits = await menugroupAlreadyExist(body);
      if (excits.length > 0) {
        return res.status(200).json({
          success: 7,
          message: "MenuGroup Already Exist",
        });
      }

      await menuGroupInsert(body);
      return res.status(200).json({
        success: 1,
        message: "MenuGroup Created Successfully",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getGroupMapDetails: async (req, res) => {
    try {
      const data = await getGroupMapDetails();
      console.log(data);
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

  menuGroupUpdate: async (req, res) => {
    try {
      const body = req.body;
      await menuGroupUpdate(body);
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
  getMenuNameDetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getMenuNameDetails(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
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
