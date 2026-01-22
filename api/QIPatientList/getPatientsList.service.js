const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  GetElliderPatientList: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
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
          depCode: data.depCode,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const hisData = result.rows;
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) {
        await conn_ora.close();
        // await pool_ora.close();
      }
    }
  },

  GetEndoscopyIPInfo: async (id, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT
                       IP_NO,IPD_DATE,PT_NO,PTC_PTNAME,PTC_TYPE,PTC_SEX,PTN_YEARAGE,PTN_MONTHAGE,PTN_DAYAGE,
                       PTC_LOADD1,PTC_LOADD2,PTC_LOADD3,PTC_LOADD4,PTC_MOBILE,IPADMISS.BD_CODE,BDC_NO,IPADMISS.DO_CODE,
                       IPD_DISC,IPC_STATUS,DOC_NAME,BED.NS_CODE,NSC_DESC
                 FROM 
                       IPADMISS
                    LEFT JOIN BED ON BED.BD_CODE=IPADMISS.BD_CODE 
                    LEFT JOIN NURSTATION ON NURSTATION.NS_CODE=BED.NS_CODE
                    LEFT JOIN DOCTOR ON DOCTOR.DO_CODE=IPADMISS.DO_CODE
                 WHERE
                       IPC_PTFLAG='N' AND IPD_DISC IS NULL AND IP_NO=:ipno`,
        {
          ipno: id,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const hisData = result.rows;
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },

  GetInitialAssessmentDetails: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT
                      VISITMAST.VSC_SLNO,VISITMAST.VSD_DATE,VISITDETL.PT_NO,PATIENT.PTC_PTNAME,PATIENT.PTC_MOBILE,
                      MIN(NURSE_ASSESSMENT.ENT_DATE) AS ASSESS_START_DATE,MAX(NURSE_ASSESSMENT.EDT_DATE) AS ASSESS_END_DATE,
                      ROUND((MAX(NURSE_ASSESSMENT.EDT_DATE)- MIN(NURSE_ASSESSMENT.ENT_DATE)) * 24 * 60) AS SERVICE_TIME,
                      DOCTOR.DOC_NAME,(OPPATIENTCONSULT.CONSULT_START_DATE) AS CONSULT_START_DATE,(COMPLAINTEXAM.ED_DATE) AS COMP_DATE,
                      (OPPATIENTINVGST.EDT_DATE) AS INVESTIGATION_DATE,MAX(PATDRGREQDET.DRD_ENTDATE) AS PRESCRIPTION_DATE,
                      (VISITREQMAST.VRD_DATE) AS VRD_DATE
                FROM  
                      VISITDETL
                     LEFT JOIN VISITMAST ON VISITMAST.VSC_SLNO=VISITDETL.VSC_SLNO
                     LEFT JOIN DOCTOR ON VISITDETL.DO_CODE=DOCTOR.DO_CODE
                     LEFT JOIN SPECIALITY ON DOCTOR.SP_CODE=SPECIALITY.SP_CODE
                     LEFT JOIN PATIENT ON PATIENT.PT_NO=VISITDETL.PT_NO
                     LEFT JOIN CLINICAL.NURSE_ASSESSMENT ON VISITMAST.VSC_SLNO=CLINICAL.NURSE_ASSESSMENT.VSC_SLNO
                     LEFT JOIN CLINICAL.OPPATIENTCONSULT ON VISITMAST.VSC_SLNO=CLINICAL.OPPATIENTCONSULT.VSC_SLNO
                     LEFT JOIN CLINICAL.COMPLAINTEXAM ON CLINICAL.COMPLAINTEXAM.OPN_KEY=OPPATIENTCONSULT.OPN_KEY
                     LEFT JOIN CLINICAL.OPPATIENTINVGST ON CLINICAL.OPPATIENTINVGST.OPN_KEY=OPPATIENTCONSULT.OPN_KEY
                     LEFT JOIN PATDRGREQMST ON PATDRGREQMST.VSC_SLNO=VISITMAST.VSC_SLNO
                     LEFT JOIN PATDRGREQDET ON PATDRGREQDET.DR_SLNO=PATDRGREQMST.DR_SLNO
                     LEFT JOIN VISITREQMAST ON VISITREQMAST.REQ_VISITSLNO=VISITMAST.VSC_SLNO
                WHERE 
                      VISITMAST.VSD_DATE>=TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSD_DATE<=TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss')
                      AND VISITMAST.VSC_PTFLAG = 'N' 
                      AND VISITDETL.VSC_CANCEL IS NULL
                      AND VISITREQMAST.VRC_CANCEL IS NULL  
                      AND SPECIALITY.DP_CODE=:depCode 

                GROUP BY
                      VISITMAST.VSC_SLNO,VISITMAST.VSD_DATE,VISITDETL.PT_NO,PATIENT.PTC_PTNAME,PATIENT.PTC_SEX,
                      PATIENT.PTN_DAYAGE,PATIENT.PTN_MONTHAGE,PATIENT.PTN_YEARAGE,PATIENT.PTC_LOADD1,PATIENT.PTC_LOADD3,
                      PATIENT.PTC_MOBILE,DOCTOR.DOC_NAME,OPPATIENTCONSULT.CONSULT_START_DATE,COMPLAINTEXAM.ED_DATE,
                      OPPATIENTINVGST.EDT_DATE,VISITREQMAST.VRD_DATE`,
        {
          date1: data.from,
          date2: data.to,
          depCode: data.depCode,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const hisData = result.rows;
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },

  GetEndoscopyPatientsQI: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT
                       NURSE_ASSESSMENT.VSC_SLNO,
                       VISITMAST.VSD_DATE,
                       NURSE_ASSESSMENT.PT_NO,
                       MIN(NURSE_ASSESSMENT.ENT_DATE) AS START_DATE,
                       MAX(NURSE_ASSESSMENT.EDT_DATE) AS END_DATE,
                       ROUND((MAX(NURSE_ASSESSMENT.EDT_DATE) - MIN(NURSE_ASSESSMENT.ENT_DATE)) * 24 * 60) AS SERVICE_TIME
                FROM
                       CLINICAL.NURSE_ASSESSMENT
                       LEFT JOIN VISITMAST ON VISITMAST.VSC_SLNO = NURSE_ASSESSMENT.VSC_SLNO
                       LEFT JOIN DOCTOR ON DOCTOR.DO_CODE = NURSE_ASSESSMENT.DO_CODE
                       LEFT JOIN SPECIALITY ON DOCTOR.SP_CODE = SPECIALITY.SP_CODE
                WHERE
                       VISITMAST.VSD_DATE =TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss')
                       AND SPECIALITY.DP_CODE = :depCode
                       AND NURSE_ASSESSMENT.PT_NO =:ptno
                GROUP BY
                       NURSE_ASSESSMENT.VSC_SLNO,
                       VISITMAST.VSD_DATE,
                       NURSE_ASSESSMENT.PT_NO`,
        {
          date1: data.from,
          depCode: data.depCode,
          ptno: data.ptno,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      const hisData = await result.rows;
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },

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
      if (conn_ora) {
        await conn_ora.close();
      }
    }
  },
};
