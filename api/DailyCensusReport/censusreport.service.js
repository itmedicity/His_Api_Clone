const {pools} = require("../../config/mysqldbconfig");
const {getTmcConnection, oracledb} = require("../../config/oradbconfig");
module.exports = {
  GetElliderCensusCount: async (data) => {
    let conn_ora = await getTmcConnection();
    try {
      const result = await conn_ora.execute(
        ` SELECT NS_CODE, SUM(AD) AD,SUM(DC) DC,SUM(DT) DT,SUM(ACTIVE) ACTIVE,SUM(NIP) NIP,SUM(NDIS) NDIS,SUM(DAMA) DAMA,SUM(LAMA) LAMA FROM (
            SELECT 
                  B.NS_CODE,COUNT(IP.IP_NO) AD,0 DC,0 DT,0 ACTIVE,0 NIP,0 NDIS,0 DAMA,0 LAMA 
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DATE >= TO_DATE (:date1,'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DATE <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss') 
                  AND B.NS_CODE in (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,COUNT(IP.IP_NO) DC,0 DT,0 ACTIVE,0 NIP,0 NDIS,0 DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE(:date1,'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss') AND IPC_STATUS NOT IN('E','Q','H')
                  AND B.NS_CODE in  (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,COUNT(IP.IP_NO) DT,0 ACTIVE,0 NIP,0 NDIS,0 DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE (:date1, 'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE(:date2, 'dd/MM/yyyy hh24:mi:ss') AND IPC_STATUS = 'E' 
                  AND B.NS_CODE in  (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
       UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,COUNT(IP.IP_NO) ACTIVE,0 NIP,0 NDIS,0 DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE 
                  AND  IPC_STATUS IS NULL
                  AND B.NS_CODE in (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE    
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,0 ACTIVE,COUNT(IP.IP_NO) NIP,0 NDIS,0 DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND
                  IPD_DATE > TO_DATE (:date2,'dd/MM/yyyy hh24:mi:ss')
                  AND IPC_STATUS IS NULL
                  AND B.NS_CODE in (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,0 ACTIVE,0 NIP,COUNT(IP.IP_NO) NDIS,0 DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND
                  IPD_DISC > TO_DATE (:date2,'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DATE < TO_DATE (:date2,'dd/MM/yyyy hh24:mi:ss')
                  AND IPC_STATUS IS NOT NULL
                  AND B.NS_CODE in (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE  
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,0 ACTIVE,0 NIP,0 NDIS,COUNT(IP.IP_NO) DAMA,0 LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE (:date1,'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss') AND IPC_STATUS = 'Q'
                  AND B.NS_CODE in  (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
        UNION ALL
            SELECT 
                  B.NS_CODE,0 AD,0 DC,0 DT,0 ACTIVE,0 NIP,0 NDIS,0 DAMA,COUNT(IP.IP_NO) LAMA
            FROM  ipadmiss IP,BED B
            WHERE B.BD_CODE=IP.BD_CODE AND 
                  IPD_DISC >= TO_DATE (:date1,'dd/MM/yyyy hh24:mi:ss')
                  AND IPD_DISC <= TO_DATE(:date2,'dd/MM/yyyy hh24:mi:ss') AND IPC_STATUS = 'H'
                  AND B.NS_CODE in  (SELECT NS_CODE FROM NURSTATION WHERE NSC_STATUS='Y') AND IPC_PTFLAG = 'N'
              GROUP BY B.NS_CODE
        ) M GROUP BY NS_CODE`,
        {
          date1: data.from,
          date2: data.to,
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT},
      );
      return await result.rows;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      await conn_ora.close();
    }
  },
};
