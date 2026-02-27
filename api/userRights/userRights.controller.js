const {userRightsInsert, getUserRights, userRightsUpdate} = require("./userRights.service");

module.exports = {
  userRightsInsert: async (req, res) => {
    try {
      const body = req.body;
      if (!Array.isArray(body) || body.length === 0) {
        return res.status(200).json({
          success: 0,
          message: "Invalid payload",
        });
      }

      const rows = body.map((val) => {
        return [val.user_group_id ?? null, val.module_id ?? null, val.menugroup_id ?? null, val.menuname_id ?? null, val.view_menu ?? 0, val.pdf_view ?? 0, val.excel_view ?? 0];
      });

      await userRightsInsert(rows);

      return res.status(200).json({
        success: 1,
        message: "User Rights Updated",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  getUserRights: async (req, res) => {
    try {
      const body = req.body;
      const data = await getUserRights(body);

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

  userRightsUpdate: async (req, res) => {
    try {
      const body = req.body;

      if (!Array.isArray(body) || body.length === 0) {
        return res.status(200).json({
          success: 0,
          message: "Invalid payload",
        });
      }

      await userRightsUpdate(body);

      return res.status(200).json({
        success: 1,
        message: "User Rights Updated",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: "Error Occured",
      });
    }
  },
};
