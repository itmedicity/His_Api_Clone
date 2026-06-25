const {getTmcConnection, oracleConnectionClose} = require("../../../../../config/oradbconfig");
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

const bedIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await bedIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const nsIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await nsIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const roomRentIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await roomRentIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const otherIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await otherIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const consultingIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await consultingIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const anesthetiaIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await anesthetiaIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const surgeonIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await surgeonIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const theaterIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await theaterIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const cardiologyIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await cardiologyIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const disPosibleItemIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await disPosibleItemIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const icuIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await icuIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const icuprocedureIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await icuprocedureIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const radiologyIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await radiologyIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const laboratoryIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await laboratoryIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const mriIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await mriIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const dietIncomes = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await dietIncome(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const pharmacyIncomesPart1 = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await pharmacyIncomePart1(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const pharmacyIncomesPart2 = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await pharmacyIncomePart2(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const pharmacyIncomesPart3 = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await pharmacyIncomePart3(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

const pharmacyIncomesPart4 = async (req, res) => {
  const body = req.body;
  let conn;
  try {
    conn = await getTmcConnection();
    const result = await pharmacyIncomePart4(conn, body);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(200).json({
        success: 2,
        message: "No Result",
        data: [],
      });
    }
    return res.status(200).json({
      success: 1,
      message: "Success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (conn) {
      await conn.commit();
      await oracleConnectionClose(conn);
    }
  }
};

module.exports = {
  bedIncomes,
  nsIncomes,
  roomRentIncomes,
  otherIncomes,
  consultingIncomes,
  anesthetiaIncomes,
  surgeonIncomes,
  theaterIncomes,
  cardiologyIncomes,
  disPosibleItemIncomes,
  icuIncomes,
  icuprocedureIncomes,
  radiologyIncomes,
  laboratoryIncomes,
  mriIncomes,
  dietIncomes,
  pharmacyIncomesPart1,
  pharmacyIncomesPart2,
  pharmacyIncomesPart3,
  pharmacyIncomesPart4,
};
