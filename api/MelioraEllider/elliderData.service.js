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
        const sql = `
SELECT  IPADMISS.IP_NO, 
             IPADMISS.IPD_DATE, 
             IPADMISS.PT_NO,
             IPADMISS.PTC_PTNAME,
             IPADMISS.SA_CODE,         
             IPADMISS.PTC_TYPE,                            
             IPADMISS.BD_CODE,
             IPADMISS.DO_CODE,
             IPADMISS.PTC_SEX,
             IPADMISS.PTD_DOB,
             IPADMISS.PTN_DAYAGE,
             IPADMISS.PTN_MONTHAGE,
             IPADMISS.PTN_YEARAGE,
             IPADMISS.PTC_LOADD1,
             IPADMISS.PTC_LOADD2,
             IPADMISS.PTC_LOADD3,
             IPADMISS.PTC_LOADD4,
             IPADMISS.PTC_LOPIN,
             IPADMISS.BD_CODE,
             IPADMISS.PTC_LOPHONE,
             IPADMISS.PTC_MOBILE,
             IPADMISS.RC_CODE,
             IPADMISS.RS_CODE,
             IPADMISS.IPD_DISC,
             IPADMISS.IPC_STATUS,
             IPADMISS.DMC_SLNO,
             IPADMISS.DMD_DATE,
             IPADMISS.CU_CODE,
             IPADMISS.DIS_USCODE,
             IPADMISS.SC_CODE,
             (select scc_desc from schememast where sc_code=ipadmiss.SC_CODE) SCHEME_NAME,    
             IPADMISS.IPC_DICREQSTATUS,
             IPADMISS.IPC_MHCODE,
             IPADMISS.IPC_ADMITDOCODE,
             IPADMISS.IPC_CURSTATUS,
             IPADMISS.IPD_ACTRELEASE,
             IPADMISS.IPC_CURRCCODE,
             IPADMISS.IPC_DISSUMSTATUS,
             IPADMISS.RG_CODE,
             (SELECT REGION.RGC_DESC FROM REGION WHERE RG_CODE=IPADMISS.RG_CODE) REGION_NAME,
             DOCTOR.DO_CODE,
             DOCTOR.DOC_NAME,
             DOCTOR.DT_CODE,
             DOCTOR.SP_CODE,
             DOCTOR.DOC_QUAL,
             DOCTOR.DOC_REGNO,
             DOCTOR.DOC_STATUS,
             BED.BDC_NO,
             BED.NS_CODE,
             BED.RT_CODE,
             BED.BDC_OCCUP,
             BED.BDN_OCCNO,
             BED.BDC_STATUS,
             BED.HKD_CLEANINGREQ,
             BED.RM_CODE,
             BED.BDC_MHCODE,
             BED.BDC_VIPBED,
             ADMNREASON.RS_CODE,
             ADMNREASON.RSC_DESC,
             ADMNREASON.RSC_ALIAS,
             ADMNREASON.RSC_STATUS,
             CUSTOMER.CUC_NAME,
             ROOMMASTER.RM_CODE,
             ROOMMASTER.RMC_DESC,
             ROOMMASTER.RMC_ALIAS,
             ROOMMASTER.RMC_STATUS,
             ROOMMASTER.RMC_MHCODE,
             ROOMCATEGORY.RC_CODE,
             ROOMCATEGORY.RCC_DESC,
             ROOMCATEGORY.RCC_ALIAS,
             ROOMCATEGORY.RCC_STATUS,
             ROOMCATEGORY.RCC_MHCODE,
             ROOMTYPE.RT_CODE,
             ROOMTYPE.RTC_DESC,
             ROOMTYPE.RTC_ALIAS,
             ROOMTYPE.RTC_STATUS,
             ROOMTYPE.ICU,
             ROOMTYPE.RTC_MHCODE,
             (SELECT department.DPC_DESC
                     FROM department,   speciality
                     WHERE ipadmiss.do_code = doctor.do_code 
                     AND doctor.SP_CODE         =speciality.SP_CODE(+) 
                     AND speciality.DP_CODE=department.DP_CODE(+) ) DPC_DESC,                   
             (select IRC_MARK from IPPATIENTRELEASEREQ where  IPPATIENTRELEASEREQ.IP_NO=ipadmiss.IP_NO and 
                      NVL(IPPATIENTRELEASEREQ.IRC_CANCEL,'N')='N') CHECK_OUT
          FROM IPADMISS,
    patient,
    doctor,
    admnreason,
    rmall, 
    roommaster,
    bed,
    nurstation,
    Salutation,
    customer,
    roomcategory ,
    roomtype 
           where  patient.pt_no = ipadmiss.pt_no 
           and  ipadmiss.ip_no = rmall.ip_no
            and ipadmiss.ipc_currccode=roomcategory.rc_code 
           and  ipadmiss.do_code = doctor.do_code 
           and  ipadmiss.rs_code = admnreason.rs_code 
           and  rmall.bd_code = bed.bd_code 
           and  bed.ns_code = nurstation.ns_Code 
           and  ipadmiss.cu_code = customer.cu_code(+) 
           and  ipadmiss.IPC_MHCODE = '00' 
           and  nurstation.NS_CODE = :NS_CODE
and((IPADMISS.IPC_STATUS IS NULL AND rmall.rmc_relesetype IS NULL)   OR(ipd_disc IS NOT NULL AND rmall.rmc_relesetype = 'D'   
           AND(IPADMISS.IPD_ACTRELEASE IS NULL   OR IPADMISS.IPD_ACTRELEASE >= to_date(:TO_DATE, 'dd/MM/yyyy')))) AND        NVL(IPD_DISC, SYSDATE) >= TO_DATE('24/04/2025 10:10:32 AM', 'dd/MM/yyyy hh:mi:ss am') 
           AND  rmall.rmc_occupby In('P')             
           and roommaster.RM_CODE(+) = BED.RM_CODE             
           and patient.SA_CODE = Salutation.sa_code(+) 
           and ipadmiss.rc_code=roomtype.rc_code ORDER BY bdc_no
           `;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    NS_CODE: data.NS_CODE,
                    TO_DATE: data.TO_DATE
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
    getNursingBed: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT 
         N.NS_CODE,  
         N.NSC_DESC,
         N.NSC_STATUS,
         BD.BDC_NO,
         BD.BD_CODE,
         BD.BDC_OCCUP,
         BD.BDC_VIPBED,
         BD.RT_CODE,
         BD.BDC_STATUS,
         BD.HKD_CLEANINGREQ,
         BD.RM_CODE,
         BD.BDC_MHCODE,
         R.RTC_DESC,
         R.RC_CODE,
         R.RTC_STATUS,
         C.RCC_DESC,
         R.ICU,
         R.RTC_MHCODE,
         SUM(BD.BDN_OCCNO) "OCCU",
         DECODE(R.ICU,'Y','ICU')"ICU_STATUS"
     FROM   MEDIWARE.BED BD
     LEFT JOIN  NURSTATION N ON  BD.NS_CODE = N.NS_CODE
     LEFT JOIN ROOMTYPE R ON BD.RT_CODE=R.RT_CODE
     LEFT JOIN ROOMCATEGORY C ON R.RC_CODE=C.RC_CODE
     WHERE N.NSC_STATUS='Y' AND BD.BDC_STATUS='Y' AND R.RTC_STATUS='Y' AND N.NS_CODE=:NS_CODE
     GROUP BY N.NS_CODE,N.NSC_DESC,N.NSC_STATUS,BD.BDC_NO,BD.BDC_OCCUP,BD.BD_CODE,BD.BDC_VIPBED,R.RTC_DESC,C.RCC_DESC,R.ICU,BD.RT_CODE,BD.BDC_STATUS,BD.HKD_CLEANINGREQ,BD.RM_CODE,BD.BDC_MHCODE,R.RC_CODE,R.RTC_STATUS,R.ICU,R.RTC_MHCODE
     ORDER BY BD.BDC_NO `
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
            return callBack(error)
        } finally {
            if (conn_ora) {
                await conn_ora.close();
                await pool_ora.close();
            }
        }
    },
    getCurrentPatient: async (data, callBack) => {
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
                       AND IPADMISS.BD_CODE =:BD_CODE
                       ORDER BY IPADMISS.IP_NO`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    NS_CODE: data.NS_CODE,
                    BD_CODE: data.BD_CODE
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

}
