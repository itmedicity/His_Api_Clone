const {
  bedIncome,
  nsIncome,
  roomRentIncome,
  otherIncome,
  consultingIncome,
  anesthetiaIncome,
  surgeonIncome,
  theaterIncome,
  cardiologyIncome,
  disPosibleItemIncome,
  icuIncome,
  icuprocedureIncome,
  radiologyIncome,
  laboratoryIncome,
  mriIncome,
  dietIncome,
  pharmacyIncomePart1,
  pharmacyIncomePart2,
  pharmacyIncomePart3,
  pharmacyIncomePart4,
} = require("../incomePart/income.service");

module.exports = {
  bedIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await bedIncome(body);
      if (Array.isArray(data) && data.length > 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "bedIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  nsIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await nsIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "nsIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  roomRentIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await roomRentIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "roomRentIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  otherIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await otherIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "otherIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  consultingIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await consultingIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "consultingIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  anesthetiaIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await anesthetiaIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "anesthetiaIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  surgeonIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await surgeonIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: "surgeonIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  theaterIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await theaterIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "theaterIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  cardiologyIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await cardiologyIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "cardiologyIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  disPosibleItemIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await disPosibleItemIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "disPosibleItemIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  icuIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await icuIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "icuIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  icuprocedureIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await icuprocedureIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "icuprocedureIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  radiologyIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await radiologyIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "radiologyIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  laboratoryIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await laboratoryIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "laboratoryIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  mriIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await mriIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "mriIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  dietIncome: async (req, res) => {
    try {
      const body = req.body;
      const data = await dietIncome(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "dietIncome",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  pharmacyIncomePart1: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacyIncomePart1(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "pharmacyIncomePart1",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  pharmacyIncomePart2: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacyIncomePart2(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "pharmacyIncomePart2",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  pharmacyIncomePart3: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacyIncomePart3(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "pharmacyIncomePart3",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
  pharmacyIncomePart4: async (req, res) => {
    try {
      const body = req.body;
      const data = await pharmacyIncomePart4(body);
      if (Array.isArray(data) && data.length === 0) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: "pharmacyIncomePart4",
        data: data,
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
};
