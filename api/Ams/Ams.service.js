
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {
    getAntibiotic: async (data, callBack) => {  
                 
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql =  

        `select meddesc.it_code,
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
         medmanuf.mfc_desc`
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    itc_desc: '%' + data.itc_desc + '%'
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    
// getAntibioticPatientDetails: (data, callback) => {
//     const { IT_CODE } = data;
//     console.log("Received IT_CODE:", IT_CODE);
//     if (!Array.isArray(IT_CODE) || IT_CODE.length === 0) {
//         return 
//     }
//     const itemCodes = IT_CODE.map(() => '?').join(',');
//     const query = `
//     SELECT P.BMD_DATE,
//             P.BM_NO,
//             P.PT_NO,
//             PT.PTC_PTNAME,
//             DECODE(PT.PTC_SEX,'M','Male','F','Female') AS GENEDER,
//             PT.PTN_YEARAGE,
//             P.IP_NO,
//             N.NSC_DESC,
//             B.BDC_NO,
//             D.DOC_NAME,
//             DP.DPC_DESC,
//             M.ITC_DESC,
//             G.CMC_DESC
//     FROM PBILLMAST P
//         LEFT JOIN PBILLDETL PL ON P.BMC_SLNO=PL.BMC_SLNO
//         LEFT JOIN PATIENT PT ON P.PT_NO=PT.PT_NO
//         LEFT JOIN IPADMISS I ON P.IP_NO=I.IP_NO
//         LEFT JOIN BED B ON I.BD_CODE=B.BD_CODE
//         LEFT JOIN NURSTATION N ON B.NS_CODE=N.NS_CODE
//         LEFT JOIN DOCTOR D ON P.DO_CODE=D.DO_CODE
//         LEFT JOIN SPECIALITY S ON D.SP_CODE=S.SP_CODE
//         LEFT JOIN DEPARTMENT DP ON S.DP_CODE=DP.DP_CODE
//         LEFT JOIN MEDDESC M ON PL.IT_CODE=M.IT_CODE
//         LEFT JOIN MEDGENCOMB G ON M.CM_CODE=G.CM_CODE
//     WHERE PL.IT_CODE IN (${itemCodes})   
//                 AND (P.BMD_DATE) >= TO_DATE('01/05/2025 00:00:00', 'dd/MM/yyyy hh24:mi:ss')
//             AND (P.BMD_DATE) <= TO_DATE('26/05/2025 23:59:00', 'dd/MM/yyyy hh24:mi:ss')         
//             GROUP BY P.BMD_DATE,P.BM_NO,P.PT_NO, PT.PTC_PTNAME,PT.PTC_SEX,PT.PTN_YEARAGE,
//                             P.IP_NO, N.NSC_DESC, B.BDC_NO,D.DOC_NAME, DP.DPC_DESC

//     `;

//     pool.query(query, IT_CODE, (error, results) => {
//         if (error) {
//             return callback(error);
//         }
//         return callback(null, results);
//     });
// }

}














