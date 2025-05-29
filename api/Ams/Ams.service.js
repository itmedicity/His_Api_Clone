
const pool = require('../../config/dbconfig');
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


}














