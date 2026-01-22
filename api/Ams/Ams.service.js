const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  getAntibiotic: async (data, callBack) => {
    let conn_ora = await getTmcConnection();
    const sql = `select meddesc.it_code,
         meddesc.itc_desc,
         meddesc.itc_alias,
         meddesc.itn_strip,
         meddesc.itn_originalmrp,
         medcategory.mcc_desc,
         medgroup.mgc_desc,
         medgencomb.cmc_desc,
         medmanuf.mfc_desc
        from meddesc
        left join medstore on meddesc.it_code=medstore.it_code     
        left join medcategory on meddesc.mc_code=medcategory.mc_code
        left join medgroup on meddesc.mg_code=medgroup.mg_code
        left join medgencomb on meddesc.cm_code=medgencomb.cm_code
        left join medmanuf on meddesc.mf_code=medmanuf.mf_code
        where meddesc.itc_status='Y' AND medstore.st_code='0124' and meddesc.itc_desc like:itc_desc
        GROUP BY meddesc.it_code,
         meddesc.itc_desc,
         meddesc.itc_alias,
         meddesc.itn_strip,
         meddesc.itn_originalmrp,
         medcategory.mcc_desc,
         medgroup.mgc_desc,
         medgencomb.cmc_desc,
         medmanuf.mfc_desc`;
    try {
      const result = await conn_ora.execute(
        sql,
        {
          itc_desc: "%" + data.itc_desc + "%",
        },
        {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      await result.resultSet?.getRows((err, rows) => {
        callBack(err, rows);
      });
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },

  getAntibioticItemCode: (callback) => {
    pool.query(`SELECT item_code FROM ams_antibiotic_master where status = 1 `, [], (error, results, feilds) => {
      if (error) {
        return callback(error);
      }
      return callback(null, results);
    });
  },

  getMicrobiologyTest: async (id, callBack) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        `SELECT B.PT_NO "PT_NO",
                B.PTC_NAME,
                D.DOC_NAME "DOCTOR", 
                C.MIC_DESC "INVESTIGATION",
                SM.SMC_DESC "SAMPLE_TYPE",
                R.MRC_LABNO "LABNO", 
                R.MRC_FLUIDTYPE "FLUIDTYPE",
                S.SMC_DESC "SPECIMEN", 
                W.GRC_DESC "GROWTH",
                R.GR_CODE1_REMARKS "GROWTH_REMARKS_1", 
                R.GR_CODE2_REMARKS "GROWTH_REMARKS_2",
                R.GR_CODE3_REMARKS "GROWTH_REMARKS_3",
                O1.ORC_DESC "ORGANISM_1", 
                O2.ORC_DESC "ORGANISM_2",
                R.MRC_REMARKS "REMARKS",
                T.TSD_CHECKDATE"VERIFY_DATE"
            FROM BILLMAST B
                LEFT JOIN DOCTOR D ON B.DO_CODE = D.DO_CODE
                LEFT JOIN USERS U ON B.US_CODE = U.US_CODE
                LEFT JOIN MICROMAST R ON B.BMC_SLNO = R.BMC_SLNO
                LEFT JOIN TESTRESULT T ON B.BMC_SLNO=T.BMC_SLNO AND T.PD_CODE=R.PD_CODE
                LEFT JOIN SAMPLETYPE SM ON R.SM_CODE = SM.SM_CODE
                LEFT JOIN SPECIMEN S ON R.SM_CODE = S.SM_CODE
                LEFT JOIN MICROINVGST C ON R.MI_CODE = C.MI_CODE
                LEFT JOIN ORGANISM O1 ON R.OR_CODE1 = O1.OR_CODE 
                LEFT JOIN ORGANISM O2 ON R.OR_CODE2 = O2.OR_CODE
                LEFT JOIN GROWTH W ON R.GR_CODE1 = W.GR_CODE  
            WHERE B.PT_NO = :mrdNo
                AND R.MR_NO IS NOT NULL
            GROUP BY 
                B.PT_NO, B.PTC_NAME, D.DOC_NAME, C.MIC_DESC, SM.SMC_DESC,
                S.SMC_DESC, R.MRC_LABNO, R.MRC_FLUIDTYPE, W.GRC_DESC,
                R.GR_CODE1_REMARKS, R.GR_CODE2_REMARKS, R.GR_CODE3_REMARKS,
                O1.ORC_DESC, O2.ORC_DESC, R.MRC_REMARKS,T.TSD_CHECKDATE`,
        {mrdNo: id},
        {resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT},
      );

      const hisData = await result.resultSet?.getRows();
      return callBack(null, hisData);
    } catch (error) {
      return callBack(error);
    } finally {
      await conn_ora.close();
    }
  },
};
