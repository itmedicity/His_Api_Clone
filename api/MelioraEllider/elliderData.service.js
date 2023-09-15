const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {

    getOutlet: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           OU_CODE,
                           OUC_DESC,
                           OUC_ALIAS
                     FROM 
                           OUTLET 
                     WHERE 
                           OUC_STATUS='Y'
                     ORDER BY OUC_DESC    `;
        try {
            const result = await conn_ora.execute(
                sql,
                [],
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )

            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
            // const outletFromOra = await result.resultSet?.getRows();
            // console.log(outletFromOra);
            // return callBack(null, outletFromOra)
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

    getNursingStation: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           NS_CODE,
                           NSC_DESC,
                           NSC_ALIAS
                     FROM 
                           NURSTATION
                     WHERE 
                           NSC_STATUS='Y'
                     ORDER BY NSC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                [],
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

    getRoomType: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           RT_CODE,
                           RTC_DESC,
                           RTC_ALIAS
                     FROM 
                           ROOMTYPE
                     WHERE 
                           RTC_STATUS='Y'
                     ORDER BY RTC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                [],
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


    getRoomCategory: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           RC_CODE,
                           RCC_DESC,
                           RCC_ALIAS
                     FROM 
                           ROOMCATEGORY
                     WHERE 
                           RCC_STATUS='Y'
                     ORDER BY RCC_DESC      `;
        try {
            const result = await conn_ora.execute(
                sql,
                [],
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

    getRoomDetails: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           RM_CODE,
                           RMC_DESC,
                           RMC_ALIAS
                     FROM 
                           ROOMMASTER
                     WHERE 
                           RMC_STATUS='Y'
                     ORDER BY RMC_DESC`;
        try {
            const result = await conn_ora.execute(
                sql,
                [],
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


    getInpatientDetails: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           IP_NO,                      
                           IPD_DATE,                   
                           PT_NO,                        
                           PTC_PTNAME,               
                           PTC_TYPE,                     
                           PTC_SEX,                     
                           PTD_DOB,                     
                           PTN_DAYAGE,                   
                           PTN_MONTHAGE,                
                           PTN_YEARAGE,                  
                           SA_CODE,                      
                           PTC_LOADD1,                   
                           PTC_LOADD2,                   
                           PTC_LOADD3,                   
                           PTC_LOADD4,                  
                           PTC_LOPIN,                   
                           PTC_LOPHONE,                  
                           RE_CODE,                     
                           PTC_RELATION,                 
                           RC_CODE,                      
                           IPADMISS.BD_CODE,                     
                           IPADMISS.DO_CODE,                      
                           RS_CODE,                      
                           IPD_PART,                    
                           IPD_DISC,                    
                           IPC_STATUS,                  
                           PTC_PETNAME,                 
                           DMC_CACR,                     
                           DMC_SLNO,                    
                           DMD_DATE,                    
                           IPADMISS.US_CODE,                      
                           CU_CODE,                     
                           PT_CODE,                     
                           IPC_DISSUMM,                  
                           IPC_PASS,                     
                           PTC_REFDOCTOR,                
                           DIS_USCODE,                   
                           IP_REMARKS,                  
                           IP_CUREF,                     
                           IPD_DISCSUMM,                 
                           IP_STAY,                     
                           IPD_APPROXIMATE,              
                           SC_CODE,                     
                           IPC_ICDCODE,                  
                           IPC_DICREQSTATUS,            
                           CN_CODE,                      
                           INS_SLNO,                    
                           IPC_INSCLAIM,                
                           IPC_EMPCODE,                  
                           IPC_REFHOSNAME,               
                           IPC_HOSADD1,                 
                           IPC_HOSADD2,                 
                           PTC_LANGUAGE,                 
                           PTC_CARETYPE,                
                           PTC_CARETAKERPHONE,           
                           IP_REFDATE,                  
                           IP_CARDNO,                    
                           IPC_RECAL,                   
                           IPC_DISBILLPROCESS_USCODE,   
                           PTC_MOBILE,                  
                           IPC_DISBILLPROS_USRTERMINAL,  
                           IPC_DISBILLPROS_OSUSER,       
                           IPC_ORASID,                   
                           IPC_ORASERIAL,                
                           IPD_PROCESSEDDATE,           
                           IPC_INSPPROVALCODE,           
                           PK_CODE,                     
                           PK_STDATE,                   
                           PK_ADDEDON,                   
                           PK_ADDEDBY,                   
                           IPC_COPAYDED_SPLIT,           
                           IPC_PTFLAG,                     
                           IPC_MHCODE,                   
                           IPC_ADMITDOCODE,              
                           IPC_ECCODE,                   
                           IPC_ECCODE_START,             
                           IPC_ECCODE_END,              
                           IPC_CURSTATUS,                
                           IPC_IDNO,                    
                           IPD_REFWEFDT,                
                           IPC_OPERSTATUS,               
                           IPD_ACTRELEASE,              
                           DT_CODE,                      
                           IPC_CURRCCODE,                
                           IPC_DONOR,                    
                           IPN_RMCODE,                   
                           IPD_VERIFIEDUPTO,            
                           HIC_SLNO,                     
                           IPC_ADMPLAN,                  
                           IPC_WEBSESSIONID,             
                           IPC_DISSUMSTATUS,             
                           IPN_CASHCOLLECTED,            
                           IPN_TOTTCSAPPLIEDAMT,         
                           IPC_PTTYPE,                   
                           IPC_MOTHERNAME,               
                           IPC_GUARDIAN,                 
                           IPC_GUARD_RECODE,             
                           IPC_PTQUALIFICATION,          
                           IPC_SPOUSEQUALIFIATION,       
                           IPN_MARRIAGEAGE,             
                           OC_CODE,                      
                           IPC_PRADD1,                   
                           IPC_PRADD2,                   
                           IPC_PRADD3,                   
                           IPC_PRADD4,                   
                           ST_CODE,                      
                           IPC_ADMITTYPCODE,             
                           IPC_DIAGNOSIS,                
                           RL_CODE,                      
                           IPC_IPBILLREMARK,             
                           IPC_BLREMARKUSER,           
                           IPC_FATHERNAME,              
                           RG_CODE,                      
                           IPC_MLC,                      
                           IPC_INHOUSE,                  
                           UT_CODE,                      
                           MS_CODE,                      
                           ID_CODE,                      
                           IPC_IDNUMBER,                 
                           IPC_RTCODE,                   
                           PTN_SLNO,                    
                           IPC_IDPROOFATTACHED,          
                           IPC_CUSTAPPROVALNO,           
                           IPD_CUSTAPPROVALDT,          
                           IPD_CALCRENTFROM,             
                           IN_NO,                        
                           IPC_EXTRARENT,               
                           IPC_DISCDAYRENT,              
                           IPC_KINCONTACTNO,             
                           IPC_TAXREQ,                  
                           INSPRE_SLNO,                  
                           IPC_BLOCKIPCREDITBL,          
                           IPC_BLOCKIPCREDITPH,          
                           IPC_REFDOCODE ,               
                           IPC_REFHOCODE,                
                           PKC_STATUS,                  
                           VRQ_SLNO                     
                    FROM 
                           IPADMISS,BED,NURSTATION
                    WHERE 
                           BED.BD_CODE=IPADMISS.BD_CODE
                       AND NURSTATION.NS_CODE=BED.NS_CODE
                       AND IPADMISS.IPC_PTFLAG = 'N'
                       AND IPADMISS.IPC_STATUS IS NULL
                       AND NURSTATION.NS_CODE =:NS_CODE
                       ORDER BY IPADMISS.IP_NO`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    NS_CODE: data.NS_CODE
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },


    getPatientDetails: async (callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
                           PT_NO,                 
                           PTD_DATE,             
                           PTC_PTNAME,            
                           PTC_TYPE,              
                           PTC_SEX,                
                           PTD_DOB,               
                           PTN_DAYAGE,            
                           PTN_MONTHAGE,          
                           PTN_YEARAGE,            
                           SA_CODE,               
                           PTC_LOADD1,            
                           PTC_LOADD2,              
                           PTC_LOADD3,             
                           PTC_LOADD4 ,           
                           PTC_LOPIN ,            
                           PTC_LOPHONE ,           
                           PTC_PRADD1,             
                           PTC_PRADD2 ,            
                           PTC_PRADD3 ,             
                           PTC_PRADD4,              
                           PTC_PRPIN ,             
                           PTC_PRPHONE,             
                           PTC_PETNAME,            
                           BG_CODE,              
                           OC_CODE,              
                           OR_CODE,              
                           RL_CODE,              
                           MS_CODE,              
                           RG_CODE,              
                           RE_CODE,              
                           PTC_RELATION,         
                           PTD_RENW ,            
                           PTD_OLDRNW ,          
                           PTC_SERVNO,           
                           DO_CODE,              
                           PTC_LADOCODE,         
                           PTC_PATIENT,          
                           PT_GRPNO,              
                           RK_CODE,                
                           VSC_SLNO,               
                           RPC_SLNO,               
                           VSD_DATE ,              
                           PTN_REGFEE,           
                           PTN_TOTAL ,            
                           PTC_ENT,               
                           CU_CODE ,                
                           US_CODE,               
                           PT_CODE,                 
                           PTC_CHAR,               
                           CT_CODE,               
                           PTC_BLOODGROUP,         
                           PTC_BLOODRHTYPE,         
                           PTC_FILETYPE ,        
                           PTN_RELAGE,            
                           PTC_OCCODE,            
                           PTC_DOCNAME ,            
                           PTC_HOSNAME,             
                           PTC_HOSADD1 ,          
                           PTC_HOSADD2 ,            
                           PTC_FLAG,               
                           PTD_EDDATE ,           
                           PTC_EMPID,           
                           PTC_DESIG,             
                           PTC_INSURANCE,         
                           PTC_INSURANCECOMPANY ,   
                           PTC_FOREIGNER ,          
                           PTN_DEPOSIT,            
                           SC_CODE,                
                           IN_CODE ,                
                           PTC_NATIONALITY,         
                           PTC_PRADD5,             
                           SRM_ED_VC_RELATION,      
                           SRM_ED_C_PHY_HANDI,     
                           BARCODE_PRINTED,        
                           PTC_MOBILE,              
                           DISC_BAL,               
                           DISC_MODIDT,           
                           PTC_IPNUMBER,            
                           PTC_EMAIL,               
                           PTC_PRECAUTIONALERT,    
                           IPBARCODE_PRINTED,       
                           PTC_FAX ,                
                           CHS_NO,                 
                           PTC_KIOSKVIEW,           
                           PTC_RECORDPRINT,      
                           PTC_LANGUAGE,           
                           PTC_CARETYPE,           
                           PTC_ALERT,             
                           PTC_ALERTREM,            
                           PTC_MLC ,                
                           PTC_SPOUSE,              
                           PTC_CIVILCARDNO ,        
                           IS_CODE,                
                           NC_CODE,                
                           LASTNAME ,               
                           MIDDLENAME ,             
                           FIRSTNAME,              
                           PTC_KINCONTACTNO,        
                           PTC_PATIENTIMAGEPATH,    
                           PTC_PATIENTIMAGENAME,  
                           PTC_SCANNED,            
                           EMPID ,                  
                           CREDITFACILITY,         
                           PTD_ADDDATE,             
                           TC_CODE,                
                           CONSENTSIGNAME,         
                           CONSENTSIGPATH ,        
                           PTC_CONSENDPRINTED,     
                           PTC_CONSINTERPRETLANG,  
                           CONSENTSIGDATE,        
                           PTC_CONSENT_USCODE,    
                           PTC_PTFLAG,              
                           CARD_PRINTED ,           
                           PTC_MRDSERNO,          
                           PTC_CNCODE ,            
                           ST_CODE  ,              
                           PTC_FATHERNAME  ,       
                           PTC_MOTHERNAME ,        
                           PTC_INHOUSE,           
                           PTC_PTTYPE,              
                           PTN_SFNPATHID,         
                           PTC_GUARDIAN ,           
                           PTC_IDENTIFICATIONMARK,  
                           PTC_UNKNOWN ,            
                           PTC_CRLIMITPTNO,        
                           PTC_SPOUSEPTNO,         
                           PTC_SPOUSERELATION,     
                           PTC_PAN ,                
                           PTC_DATATRANSFER  ,      
                           EMP_SLNO  ,            
                           DEPPENDUNIQ  ,          
                           PTC_PDO ,               
                           PTN_DISCLIMIT ,         
                           PTC_GUARD_RECODE,        
                           PTC_QUALIFICATION  ,    
                           PTC_SPOUSEQUALIFIATION , 
                           PTC_SPOUSEOCCODE,       
                           PTC_SPOUSEBGCODE,       
                           PTN_MARRIAGEAGE,        
                           PTN_SPOUSEMARRIAGEAGE,   
                           PTC_RHSTATUS,           
                           PTC_SPOUSERHSTATUS,     
                           PTC_OFFEMPID ,          
                           PTC_CUSTAPPROVALNO,      
                           PTD_CUSTAPPROVALDT,   
                           PTC_RELSEX ,           
                           PTN_ANNINCOME ,        
                           AG_CODE,                
                           PTC_RETIRED,             
                           TK_CODE,                 
                           PTC_DTCODE,              
                           PTC_PRTKCODE,           
                           PTC_PRDTCODE,          
                           PTC_PRSTCODE,           
                           PTC_PRRGCODE,           
                           PTC_OFFPHONE,           
                           PTC_ALERTFOR           
                           PTC_MHCODE                
                    FROM 
                           PATIENT
                    WHERE 
                           PTC_PTFLAG='N'
                       ORDER BY PTD_DATE`;
        try {
            const result = await conn_ora.execute(
                sql,
                {},
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT },
            )
            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows)
            })
        }
        catch (error) {
            console.log(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },




}
