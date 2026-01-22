const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  GetIPPatientList: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT
                       IP_NO,IPD_DATE,PT_NO,PTC_PTNAME,PTC_TYPE,PTC_SEX,PTN_YEARAGE,PTN_MONTHAGE,PTN_DAYAGE,PTC_LOADD1,
                       PTC_LOADD2,PTC_MOBILE,IPADMISS.BD_CODE,BDC_NO,IPADMISS.DO_CODE,IPD_DISC,IPC_STATUS,DOC_NAME
                 FROM 
                       IPADMISS
                       LEFT JOIN BED ON BED.BD_CODE=IPADMISS.BD_CODE 
                       LEFT JOIN DOCTOR ON DOCTOR.DO_CODE=IPADMISS.DO_CODE
                 WHERE
                       IPD_DATE >= TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss') AND 
                       IPD_DATE <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss') AND
                       IPC_PTFLAG='N'AND
                       BED.NS_CODE=:nsCode`,
        {
          date1: data.from,
          date2: data.to,
          nsCode: data.nsCode,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const hisData = result.rows;
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },
};
