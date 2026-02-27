const {oraUsers} = require("../oraUsers/user.service");
module.exports = {
  getOrauser: async (req, res) => {
    try {
      const data = await oraUsers();

      return res.status(200).json({
        success: 1,
        message: "Data Fetched",
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
