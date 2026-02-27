const {getTmcConnection, oracleConnectionClose, closeConnection} = require("../config/oradbconfig");

const controllerHelper = (serviceFun, successMessage) => {
  return async (req, res) => {
    let conn;
    try {
      const body = req.body;
      conn = await getTmcConnection();

      const result = await serviceFun(conn, body);
      if (!result || (Array.isArray(result) && result.length === 0)) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }
      return res.status(200).json({
        success: 1,
        message: successMessage || "Success",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.message || "Internal Server Error",
      });
    } finally {
      if (conn) {
        await oracleConnectionClose(conn);
      }
    }
  };
};

const controllerGETHelper = (serviceFun, successMessage) => {
  return async (req, res) => {
    let conn;
    try {
      conn = await getTmcConnection();
      const result = await serviceFun(conn);

      if (!result || (Array.isArray(result) && result.length === 0)) {
        return res.status(200).json({
          success: 2,
          message: "No Result",
          data: [],
        });
      }

      return res.status(200).json({
        success: 1,
        message: successMessage,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.message || "Internal Server Error",
      });
    } finally {
      if (conn) {
        await oracleConnectionClose(conn);
      }
    }
  };
};

module.exports = {controllerHelper, controllerGETHelper};
