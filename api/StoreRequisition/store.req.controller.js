const {getPharmacyList, searchRequestFromOra, updateReqQntyToOracle, insertToRolSetting, truncateRolSetting} = require("./storereq.service");

module.exports = {
  getPharmacyList: async (res) => {
    try {
      const data = await getPharmacyList();

      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
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

  searchRequestFromOra: async (req, res) => {
    try {
      const body = req.body;
      const data = await searchRequestFromOra(body);
      if (data.length === 0) {
        return res.status(200).json({
          success: 1,
          message: "No Data Found",
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

  insertToRolSetting: async (req, res) => {
    try {
      await truncateRolSetting();
      const body = req.body;

      const data = body.map((val) => {
        return {
          OU_CODE: val.OU_CODE,
          IT_CODE: val.IT_CODE,
          ITN_NAME: val.ITN_NAME,
          ITN_MAXQTY: val.ITN_MAXQTY,
          ITN_MINQTY: val.ITN_MINQTY,
          ITN_MINLVL: val.ITN_MINLVL,
          ITN_MEDLVL: val.ITN_MEDLVL,
          ITN_MAXLVL: val.ITN_MAXLVL,
          STATUS: val.STATUS,
        };
      });

      await insertToRolSetting(data);

      return res.status(200).json({
        success: 1,
        message: "Data Inserted",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },

  updateReqQntyToOracle: async (req, res) => {
    try {
      const body = req.body;
      await updateReqQntyToOracle(body);
      return res.status(200).json({
        success: 1,
        message: "Data Updated",
      });
    } catch (error) {
      return res.status(200).json({
        success: 0,
        message: error.message,
      });
    }
  },
};
