const {pools, query, transaction} = require("../../config/mysqldbconfig");
const {getTmcConnection, oracledb} = require("../../config/oradbconfig");

module.exports = {
  getPharmacyList: async () => {
    const result = await query(`select * from medi_ellider.outlet`, []);
    return result;
  },

  searchRequestFromOra: async (data) => {
    let conn_ora = await getTmcConnection();

    try {
      const result = await conn_ora.execute(
        `
        SELECT strmeddetl.IT_CODE,
                MEDCATEGORY.MCC_DESC,
                meddesc.ITC_ALIAS,
                meddesc.ITC_DESC,
                UOM.UNC_ALIAS, 
                strmeddetl.SRN_QTY,
                strmeddetl.SRN_QOH,
                strmedmast.SRD_DATE 
                FROM strmeddetl,meddesc,MEDCATEGORY,uom,strmedmast
        WHERE meddesc.IT_CODE=strmeddetl.IT_CODE
            AND MEDCATEGORY.MC_CODE=MEDDESC.MC_CODE
            AND UOM.UN_CODE=MEDDESC.UN_CODE
            AND strmedmast.SRC_SLNO=strmeddetl.SRC_SLNO
            AND strmeddetl.SR_NO =:SR_NO 
            AND strmedmast.OU_CODE=:OU_CODE
            AND strmedmast.SRD_DATE >= TO_DATE (:date0, 'dd/MM/yyyy hh24:mi:ss') 
            AND strmedmast.SRD_DATE <= TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss') 
            AND strmeddetl.SRC_CANCEL is null order by  MEDCATEGORY.MCC_DESC`,
        {
          SR_NO: data.SR_NO,
          OU_CODE: data.OU_CODE,
          date0: data.from,
          date1: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },

  insertToRolSetting: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const sql = `INSERT INTO rol_setting (OU_CODE,IT_CODE,ITN_NAME,ITN_MAXQTY,ITN_MINQTY,ITN_MINLVL,ITN_MEDLVL,
        ITN_MAXLVL,STATUS) VALUES 
                        (
                        :OU_CODE,
                        :IT_CODE,
                        :ITN_NAME,
                        :ITN_MAXQTY,
                        :ITN_MINQTY,
                        :ITN_MINLVL,
                        :ITN_MEDLVL,
                        :ITN_MAXLVL,
                        :STATUS)`;

      const options = {
        autoCommit: true,
        bindDefs: {
          OU_CODE: {type: oracledb.STRING, maxSize: 4},
          IT_CODE: {type: oracledb.STRING, maxSize: 4},
          ITN_NAME: {type: oracledb.STRING, maxSize: 75},
          ITN_MAXQTY: {type: oracledb.NUMBER, maxSize: 10},
          ITN_MINQTY: {type: oracledb.NUMBER, maxSize: 10},
          ITN_MINLVL: {type: oracledb.NUMBER, maxSize: 10},
          ITN_MEDLVL: {type: oracledb.NUMBER, maxSize: 10},
          ITN_MAXLVL: {type: oracledb.NUMBER, maxSize: 10},
          STATUS: {type: oracledb.STRING, maxSize: 1},
        },
      };
      const result = await conn_ora.executeMany(sql, data, options);
      return result;
    } catch (error) {
      throw error;
    } finally {
      if (conn_ora) await conn_ora.close();
    }
  },

  truncateRolSetting: async () => {
    let conn_ora = await getTmcConnection();
    try {
      return await conn_ora.execute(` TRUNCATE TABLE rol_setting`, []);
    } catch (error) {
      throw error;
    } finally {
      await conn_ora.close();
    }
  },

  updateReqQntyToOracle: async (data) => {
    oracledb.autoCommit = true;
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `UPDATE STRMEDDETL S 
                SET S.SRN_QTY = (SELECT R.ITN_MAXQTY FROM ROL_SETTING R WHERE R.IT_CODE = S.IT_CODE )
                WHERE S.IT_CODE IN (SELECT R.IT_CODE FROM ROL_SETTING R WHERE R.IT_CODE = S.IT_CODE)
                AND S.SR_NO = :SR_NO`,

        {
          SR_NO: data.SR_NO,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },
};
