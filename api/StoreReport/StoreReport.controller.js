const {getPurchaseMastDatas, getGrmDetails, getpendingApprovalQtn, getPurchaseDetails, getItemDetails} = require("./StoreReport.service");

module.exports = {
  getPurchaseMastDatas: async (req, res) => {
    try {
      const body = req.body;
      const data = await getPurchaseMastDatas(body);
      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }
      return res.status(200).json({
        success: 2,
        message: "Fetched Purchase Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getGrmDetails: async (req, res) => {
    try {
      const body = req.body;
      const data = await getGrmDetails(body);
      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
        });
      }

      return res.status(200).json({
        success: 2,
        message: "Fetched GRN Datas",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },

  getpendingApprovalQtn: async (req, res) => {
    try {
      const data = await getpendingApprovalQtn();
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
  getPurchaseDetails: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getPurchaseDetails(id);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "Purchase Details",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getItemDetails: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getItemDetails(id);
      if (!data) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "PItem Details",
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
