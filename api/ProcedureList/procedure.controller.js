const {GetProcedureList} = require("./procedure.service");
module.exports = {
  GetProcedureList: async (req, res) => {
    try {
      const body = req.body;
      const data = await GetProcedureList(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "Procedure Not Found",
        });
      }

      return res.status(200).json({
        success: 1,
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
