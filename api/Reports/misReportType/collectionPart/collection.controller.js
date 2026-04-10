const {
  advanceCollection,
  advanceRefund,
  advanceSettled,
  collectionAgainstSalePart1,
  collectionAgainstSalePart2,
  complimentory,
  creditInsuranceBillCollection,
  creditInsuranceBill,
  ipConsolidatedDiscount,
  ipPreviousDayDiscount,
  ipPreviousDayCollection,
  unsettledAmount,
  misGroup,
  misGroupMast,
  creditInsuranceBillRefund,
} = require("./collection.service");

module.exports = {
  getadvanceCollection: async (req, res) => {
    try {
      const body = req.body;
      const data = await advanceCollection(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "advance Collection",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  getAdvanceRefund: async (req, res) => {
    try {
      const body = req.body;
      const data = await advanceRefund(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "advance Refund",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getAdvanceSettled: async (req, res) => {
    try {
      const body = req.body;
      const data = await advanceSettled(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "advance Settled",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getcollectionAgainstSaleTotal: async (req, res) => {
    try {
      const body = req.body;
      const data = await collectionAgainstSalePart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "get collection Against Sale Total",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getcollectionAgainstSaleDeduction: async (req, res) => {
    try {
      const body = req.body;
      const data = await collectionAgainstSalePart2(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "get collection Against Sale Deduction",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getComplimentory: async (req, res) => {
    try {
      const body = req.body;
      const data = await complimentory(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "complimentory",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getcreditInsuranceBillCollection: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillCollection(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill Collection",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getcreditInsuranceBill: async (req, res) => {
    try {
      const body = req.body;
      const data = creditInsuranceBill(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getipConsolidatedDiscount: async (req, res) => {
    try {
      const body = req.body;
      const data = await ipConsolidatedDiscount(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "ip Consolidated Discount",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getipPreviousDayDiscount: async (req, res) => {
    try {
      const body = req.body;
      const data = await ipPreviousDayDiscount(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "get ip Previous Day Discount",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getipPreviousDayCollection: async (req, res) => {
    try {
      const body = req.body;
      const data = await ipPreviousDayCollection(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "ip Previous Day Collection",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getunsettledAmount: async (req, res) => {
    try {
      const body = req.body;
      const data = await unsettledAmount(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "Unsettled Amount",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  misGroup: async (req, res) => {
    try {
      const data = await misGroup();
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "mis group master",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  misGroupMast: async (req, res) => {
    try {
      const data = await misGroupMast();
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "mis group master",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error,
      });
    }
  },
  getcreditInsuranceBillRefund: async (req, res) => {
    try {
      const body = req.body;
      const data = await creditInsuranceBillRefund(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "credit Insurance Bill",
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
