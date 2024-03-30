const pool = require('../../config/dbconfig');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {
    GetElliderPatientList: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        try {
            const result = await conn_ora.execute(
                `SELECT
                       VISITDETL.PT_NO,PATIENT.PTC_PTNAME,PATIENT.PTC_SEX,PATIENT.PTN_DAYAGE,PATIENT.PTN_MONTHAGE,PATIENT.PTN_YEARAGE,
                       PATIENT.PTC_LOADD1,PATIENT.PTC_LOADD2,PATIENT.PTC_LOADD3,PATIENT.PTC_LOADD4,PATIENT.PTC_MOBILE, VISITMAST.VSD_DATE,
                       DOCTOR.DO_CODE,DOCTOR.DOC_NAME,SPECIALITY.DP_CODE,VISITDETL.VSN_TOKEN  
                FROM 
                       VISITDETL,VISITMAST,DOCTOR,SPECIALITY,PATIENT
                WHERE 
                      VISITDETL.VSC_SLNO=VISITMAST.VSC_SLNO 
                      AND VISITMAST.VSD_DATE >= TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSD_DATE <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSC_PTFLAG = 'N' 
                      AND VISITDETL.VSC_CANCEL IS NULL
                      AND VISITDETL.DO_CODE=DOCTOR.DO_CODE
                      AND DOCTOR.SP_CODE= SPECIALITY.SP_CODE
                      AND SPECIALITY.DP_CODE=:depCode
                      AND PATIENT.PT_NO=VISITDETL.PT_NO`,
                {
                    date1: data.from,
                    date2: data.to,
                    depCode: data.depCode
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            )
            const hisData = await result.resultSet?.getRows();
            return callBack(null, hisData)
        }
        catch (error) {
            return callBack(error)
        }
        finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }

    },
}