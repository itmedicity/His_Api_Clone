const {getAntibiotic, getAntibioticItemCode, getMicrobiologyTest} = require("./Ams.service");
module.exports = {
  getAntibiotic: async (req, res) => {
    try {
      const body = req.body;
      const data = await getAntibiotic(body);
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
  getAntibioticItemCode: async (res) => {
    try {
      const data = await getAntibioticItemCode();
      if (!data) {
        return res.status(200).json({
          success: 1,
          message: "No Records",
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

  getMicrobiologyTest: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await getMicrobiologyTest(id);
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
