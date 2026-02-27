const {getSupplierList, getActiveSupplierList} = require("./supplier.service");
module.exports = {
  getSupplierList: async (req, res) => {
    try {
      const body = req.body;
      const data = await getSupplierList(body);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Data Found",
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
  getActiveSupplierList: async (req, res) => {
    try {
      const data = await getActiveSupplierList();
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Data Found",
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
