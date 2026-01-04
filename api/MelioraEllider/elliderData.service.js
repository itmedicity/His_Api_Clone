const mysqlpool = require('../../config/dbconfigmeliora');
const { oraConnection, oracledb } = require('../../config/oradbconfig');
module.exports = {

    //using
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
    //using
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
    //using
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
                            IPADMISS.IPC_PTFLAG,
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
                        AND(IPADMISS.IPD_ACTRELEASE IS NULL   OR IPADMISS.IPD_ACTRELEASE >= to_date(:TO_DATE, 'dd/MM/yyyy')))) AND        
                        NVL(IPD_DISC, SYSDATE) >= TO_DATE(:TO_DATE, 'dd/MM/yyyy hh:mi:ss') 
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

    //not using
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
    //using
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
    //using
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
    //using
    getDisChargedPatient: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `
        SELECT Row_Number( ) Over (Partition By 1 Order By  Ipadmiss.ipd_disc,Nurstation.nsc_alias) "Slno", 
       Ipadmiss.ipd_date"Admission_Date", 
       Ipadmiss.ipd_disc"Discharge_Date", 
       Ipadmiss.IP_NO"Admn. Number", 
       patient.PT_NO"Patient_No#", 
       Decode(nvl(Salutation.sac_alias,'N'),'N',Initcap(Patient.ptc_ptname),Salutation.sac_alias||' '|| Initcap(Patient.ptc_ptname))"Patient_Name", 
       decode(Nvl(patient.ptn_yearage,0),0,decode(Nvl(Patient.ptn_monthage,0),0,Nvl(patient.ptn_dayage,0) || ' Day',Patient.ptn_monthage || ' Mon'  ),Patient.Ptn_yearage ||' Yr.' )"Age_year", 
       Decode(Patient.ptc_sex,'M','Male','F','Female')"Gender", 
       Initcap(Patient.Ptc_loadd1)"Address 1", 
       Initcap(Patient.Ptc_loadd2)"Address 2", 
       Initcap(Patient.Ptc_loadd3)"Address 3", 
       Initcap(Department.Dpc_desc)"Department", 
       Initcap(Doctor.DOC_NAME)"Doctor", 
       CUSTOMER.CUC_NAME"CUSTOMER", 
       Nurstation.nsc_alias"Ward", 
       Bed.bdc_no"Bed", 
       patient.ptc_mobile"Mobile No", 
       decode(ipadmiss.ipc_status,'E','Expired','Q','Discharge on Request','U','Unchanged','D','Diagnosis Only','A','Absconded','T','Autopsy','H','Transfer to Other Hospital','O','Others','R','Recovered')"Discharge_Status"
     FROM   Doctor,Salutation,Speciality,Department,Patient,Ipadmiss,Bed,Nurstation,CUSTOMER,Disbillmast
     Where Ipadmiss.Pt_no = Patient.Pt_no and 
          Disbillmast.Ip_no = Ipadmiss.Ip_no and 
          ipadmiss.ipc_ptflag in ('N','Y ') and
          Ipadmiss.bd_code = Bed.bd_code and 
          Disbillmast.do_code = doctor.do_code and  
          Bed.Ns_code = Nurstation.Ns_code and  
          CUSTOMER.CU_CODE(+) = IPADMISS.CU_CODE AND 
          Patient.Sa_code =  Salutation.Sa_code(+) and 
          Doctor.Sp_code = Speciality.Sp_code and 
          Speciality.Dp_code=Department.DP_code and
          Department.DP_code in(select DP_CODE from DEPARTMENT) and 
          Patient.ptc_ptflag in ('N       ') and 
          Nvl(Disbillmast.Dmc_cancel,'N') ='N' and  
          Trunc(Ipadmiss.ipd_disc)  between to_date(:FROM_DATE,'dd/MM/yyyy hh24:mi:ss') and to_date(:TO_DATE,'dd/MM/yyyy hh24:mi:ss')`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    TO_DATE: data.TO_DATE,
                    FROM_DATE: data.FROM_DATE
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
    getInpatientFollowUp: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `SELECT DSC_DESCRIPTION 
                     FROM CLINICAL.DISCHARGESUMMARYHTML DS
                     LEFT JOIN CLINICAL.DISCHARGESUMMARY D ON DS.DS_SLNO=D.DS_SLNO
                     WHERE D.DSC_APPROVAL='Y' AND DS.DSC_HEAD = 'DSC_FOLLOWUP' AND  DS.IP_NO = :IP_NO`;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    IP_NO: data.IP_NO,
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
    getPatientByIpNumber: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `
        select ipadmiss.IP_NO,
                    ipadmiss.IPD_DATE,
                    ipadmiss.PT_NO,
                    ipadmiss.PTC_PTNAME,
                    ipadmiss.PTC_SEX,
                    ipadmiss.PTD_DOB,
                    ipadmiss.PTN_DAYAGE,
                    ipadmiss.PTN_MONTHAGE,
                    ipadmiss.PTN_YEARAGE,
                    ipadmiss.PTC_LOADD1,
                    ipadmiss.PTC_LOADD2,
                    ipadmiss.PTC_LOADD3,
                    ipadmiss.PTC_LOADD4,
                    ipadmiss.PTC_LOPIN,
                    ipadmiss.RC_CODE,
                    ipadmiss.BD_CODE,
                    ipadmiss.DO_CODE,
                    ipadmiss.RS_CODE,
                    ipadmiss.IPC_CURSTATUS,
                    ipadmiss.PTC_MOBILE,
                    ipadmiss.IPC_MHCODE,
                    doctor.DOC_NAME,
                    ipadmiss.IPD_DISC,
                    ipadmiss.IPC_STATUS,
                    ipadmiss.DMC_SLNO,
                    ipadmiss.DMD_DATE,
                    department.dpc_desc
         from ipadmiss
               LEFT JOIN doctor ON doctor.do_code = ipadmiss.do_code 
               LEFT JOIN speciality ON doctor.SP_CODE=speciality.SP_CODE 
               LEFT JOIN department ON speciality.DP_CODE=department.DP_CODE
                    WHERE ipadmiss.ip_no=:IP_NO and ipc_ptflag='N' `;
        try {
            const result = await conn_ora.execute(
                sql,
                {
                    IP_NO: data.ipnumber,
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
    getPatientDetail: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();

        const column = data.type === 1 ? "IPD_DATE" : "IPD_DISC";
        
        const sql = `
            SELECT 
                IP.IP_NO,
                IP.IPD_DATE,
                IP.PT_NO,
                IP.PTC_PTNAME,
                IP.PTC_SEX,
                IP.PTD_DOB,
                IP.PTN_DAYAGE,
                IP.PTN_MONTHAGE,
                IP.PTN_YEARAGE,
                IP.PTC_LOADD1,
                IP.PTC_LOADD2,
                IP.PTC_LOADD3,
                IP.PTC_LOADD4,
                IP.PTC_LOPIN,
                IP.RC_CODE,
                IP.BD_CODE,
                IP.DO_CODE,
                IP.RS_CODE,
                IP.IPC_CURSTATUS,
                IP.PTC_MOBILE,
                IP.IPC_MHCODE,
                DO.DOC_NAME,
                IP.IPD_DISC,
                IP.IPC_STATUS,
                IP.DMC_SLNO,
                IP.DMD_DATE,
                DP.DPC_DESC
            FROM ipadmiss IP
            JOIN doctor DO ON DO.DO_CODE = IP.DO_CODE
            JOIN speciality SP ON SP.SP_CODE = DO.SP_CODE
            JOIN department DP ON DP.DP_CODE = SP.DP_CODE
            WHERE IP.${column}  >= TO_DATE (:FROM_DATE,'YYYY-MM-DD HH24:MI:SS')
            AND IP.${column}  <TO_DATE (:TO_DATE, 'YYYY-MM-DD HH24:MI:SS') AND IPC_PTFLAG='N'
        `;


        try {
            const result = await conn_ora.execute(
                sql,
                {
                    FROM_DATE: data.fromDate,
                    TO_DATE: data.toDate,
                },
                { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            await result.resultSet?.getRows((err, rows) => {
                callBack(err, rows);
            });
        } catch (error) {
            return callBack(error);
        } finally {
            if (conn_ora) await conn_ora.close();
        }
    },
    getBedMasterDetail: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `
        SELECT
            B.BD_CODE,
            B.BDC_NO,
            B.NS_CODE AS BED_NS_CODE,
            B.RT_CODE AS BED_RT_CODE,
            RT.RT_CODE AS ROOMTYPE_RT_CODE,
            RT.RTC_DESC,
            RT.RTC_ALIAS,
            RT.RC_CODE AS ROOMTYPE_RC_CODE,
            RT.RTC_STATUS,
            RT.ICU,
            RT.RTC_MHCODE,
            B.BDC_OCCUP,
            B.BDN_OCCNO,
            B.BDC_STATUS,
            B.HKD_CLEANINGREQ,
            B.RM_CODE AS BED_RM_CODE,
            B.BDC_MHCODE,
            B.BDC_VIPBED,
            RM.RM_CODE AS ROOMMASTER_RM_CODE,
            RM.RMC_DESC,
            RM.RMC_ALIAS,
            RM.RMC_STATUS,
            RM.RMC_MHCODE,
            RM.NS_CODE AS ROOMMASTER_NS_CODE,
            RC.RC_CODE AS ROOMCATEGORY_RC_CODE,
            RC.RCC_DESC,
            RC.RCC_ALIAS,
            RC.RCC_STATUS,
            RC.RCC_MHCODE,
            N.NS_CODE AS NURSTATION_NS_CODE,
            N.NSC_DESC,
            N.BUILD_CODE,
            N.FLOOR_CODE,
            N.NSC_MHCODE
        FROM BED B
            LEFT JOIN roomtype RT ON B.RT_CODE = RT.RT_CODE
            LEFT JOIN roomcategory RC ON RT.RC_CODE = RC.RC_CODE
            LEFT JOIN roommaster RM ON B.RM_CODE = RM.RM_CODE
            LEFT JOIN nurstation N ON B.NS_CODE = N.NS_CODE
        WHERE
            B.BDC_STATUS = 'Y'
            AND TRUNC(N.NSD_EDDATE) >= TO_DATE(:TO_DATE, 'DD-MON-YYYY')
`;


        try {
            const result = await conn_ora.execute(
                sql,
                {
                    TO_DATE: data.lastUpdteDate,
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

    getPatientDetailFromNursingStation: async (data, callBack) => {
        let pool_ora = await oraConnection();
        let conn_ora = await pool_ora.getConnection();
        const sql = `
        SELECT ipadmiss.IP_NO,
       ipadmiss.IPD_DATE,
       ipadmiss.PT_NO,
       ipadmiss.PTC_PTNAME,
       ipadmiss.PTC_SEX,
       ipadmiss.PTD_DOB,
       ipadmiss.PTN_DAYAGE,
       ipadmiss.PTN_MONTHAGE,
       ipadmiss.PTN_YEARAGE,
       ipadmiss.PTC_LOADD1,
       ipadmiss.PTC_LOADD2,
       ipadmiss.PTC_LOADD3,
       ipadmiss.PTC_LOADD4,
       ipadmiss.PTC_LOPIN,
       ipadmiss.RC_CODE,
       ipadmiss.BD_CODE,
       ipadmiss.DO_CODE,
       ipadmiss.RS_CODE,
       ipadmiss.IPC_CURSTATUS,
       ipadmiss.PTC_MOBILE,
       ipadmiss.IPC_MHCODE,
       doctor.DOC_NAME,
       ipadmiss.IPD_DISC,
       ipadmiss.IPC_STATUS,
       ipadmiss.DMC_SLNO,
       ipadmiss.DMD_DATE,
       department.dpc_desc
FROM ipadmiss
LEFT JOIN doctor      ON doctor.do_code = ipadmiss.do_code
LEFT JOIN speciality  ON doctor.SP_CODE = speciality.SP_CODE
LEFT JOIN department  ON speciality.DP_CODE = department.DP_CODE
LEFT JOIN bed         ON ipadmiss.bd_code = bed.bd_code
LEFT JOIN nurstation  ON bed.ns_code = nurstation.ns_code
WHERE bed.ns_code = :NS_CODE
  AND ( ipadmiss.ipd_disc IS NULL 
        OR
        (ipadmiss.ipd_disc IS NOT NULL  AND ipadmiss.ipd_disc >= SYSDATE - INTERVAL '12' HOUR))
  AND ipc_ptflag = 'N'
GROUP BY ipadmiss.IP_NO,
         ipadmiss.IPD_DATE,
         ipadmiss.PT_NO,
         ipadmiss.PTC_PTNAME,
         ipadmiss.PTC_SEX,
         ipadmiss.PTD_DOB,
         ipadmiss.PTN_DAYAGE,
         ipadmiss.PTN_MONTHAGE,
         ipadmiss.PTN_YEARAGE,
         ipadmiss.PTC_LOADD1,
         ipadmiss.PTC_LOADD2,
         ipadmiss.PTC_LOADD3,
         ipadmiss.PTC_LOADD4,
         ipadmiss.PTC_LOPIN,
         ipadmiss.RC_CODE,
         ipadmiss.BD_CODE,
         ipadmiss.DO_CODE,
         ipadmiss.RS_CODE,
         ipadmiss.IPC_CURSTATUS,
         ipadmiss.PTC_MOBILE,
         ipadmiss.IPC_MHCODE,
         doctor.DOC_NAME,
         ipadmiss.IPD_DISC,
         ipadmiss.IPC_STATUS,
         ipadmiss.DMC_SLNO,
         ipadmiss.DMD_DATE,
         department.dpc_desc
`;


        try {
            const result = await conn_ora.execute(
                sql,
                {
                    NS_CODE: data.NS_CODE,
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


    getRoomDetailEllider: async (data, callBack) => {
        let pool_ora;
        let conn_ora;
        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            if (!data || data.length === 0) {
                return callBack(null, []); // no codes to query
            }
            //  Join the codes directly into the query
            const codes = data.map(code => `'${code}'`).join(',');
            const sql = `
            SELECT 
                RT_CODE,
                RTC_DESC,
                RTC_ALIAS,
                RC_CODE,
                RTC_STATUS,
                ICU,
                RTC_MHCODE
            FROM 
                roomtype
            WHERE 
                RT_CODE IN (${codes})
        `;

            const result = await conn_ora.execute(sql, [], {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });

            callBack(null, result.rows);
        } catch (error) {
            console.log("Oracle Error:", error);
            callBack(error);
        } finally {
            if (conn_ora) await conn_ora.close();
            if (pool_ora) await pool_ora.close();
        }
    },
    getRoomCategoryDetailEllider: async (data, callBack) => {
        let pool_ora;
        let conn_ora;
        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            if (!data || data.length === 0) {
                return callBack(null, []); // no codes to query
            }
            //  Join the codes directly into the query
            const codes = data.map(code => `'${code}'`).join(',');
            const sql = `
            SELECT 
                RC_CODE,
                RCC_DESC,
                RCC_ALIAS,
                RCC_STATUS,
                RCC_MHCODE
            FROM 
                roomcategory
            WHERE 
                RC_CODE IN (${codes})
        `;

            const result = await conn_ora.execute(sql, [], {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });

            callBack(null, result.rows);
        } catch (error) {
            console.log("Oracle Error:", error);
            callBack(error);
        } finally {
            if (conn_ora) await conn_ora.close();
            if (pool_ora) await pool_ora.close();
        }
    },
    getRoomMasterDetailEllider: async (data, callBack) => {
        let pool_ora;
        let conn_ora;
        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            if (!data || data.length === 0) {
                return callBack(null, []); // no codes to query
            }
            //  Join the codes directly into the query
            const codes = data.map(code => `'${code}'`).join(',');
            const sql = `
            SELECT 
                RM_CODE,
                RMC_DESC,
                RMC_ALIAS,
                RMC_STATUS,
                RMC_MHCODE,
                NS_CODE
            FROM 
                roommaster
            WHERE 
                RM_CODE IN (${codes})
        `;

            const result = await conn_ora.execute(sql, [], {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });

            callBack(null, result.rows);
        } catch (error) {
            console.log("Oracle Error:", error);
            callBack(error);
        } finally {
            if (conn_ora) await conn_ora.close();
            if (pool_ora) await pool_ora.close();
        }
    },
    getNsDetailEllider: async (data, callBack) => {
        let pool_ora;
        let conn_ora;
        try {
            pool_ora = await oraConnection();
            conn_ora = await pool_ora.getConnection();

            if (!data || data.length === 0) {
                return callBack(null, []); // no codes to query
            }
            //  Join the codes directly into the query
            const codes = data.map(code => `'${code}'`).join(',');
            const sql = `
            SELECT 
                NS_CODE,
                NSC_DESC,
                NSC_ALIAS,
                NSC_STATUS
            FROM 
                nurstation
            WHERE 
                NS_CODE IN (${codes})
        `;

            const result = await conn_ora.execute(sql, [], {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });

            callBack(null, result.rows);
        } catch (error) {
            console.log("Oracle Error:", error);
            callBack(error);
        } finally {
            if (conn_ora) await conn_ora.close();
            if (pool_ora) await pool_ora.close();
        }
    },
    getBedDetailEllider: (data, callBack) => {
        mysqlpool.query(
            ` SELECT 
                fb_bd_code,
                fb_bdc_no
             from 
                fb_bed`,
            [

            ]
            , (error, results, fields) => {
                if (error) {
                    return callBack(error)
                }
                return callBack(null, results)
            })
    },
    insertFbBedMeliora: (data, callBack) => {
        try {
            mysqlpool.query(
                `INSERT INTO fb_bed (
                fb_bd_code,
                fb_bdc_no,
                fb_ns_code,
                fb_rt_code,
                fb_bdc_occup,
                fb_bdn_cccno,
                fb_bdc_status,
                fb_hkd_cleaningreq,
                fb_rm_code,
                fb_bdc_mhcode,
                fb_bdc_vipbed
            ) VALUES ?
            `,
                [
                    data
                ],
                (error, results, fields) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, { insertId: results.insertId });
                }
            );
        } catch (err) {
            return callBack(err);
        }
    },
    processRoomType: (data, callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_rt_code,
                fb_rtc_desc,
                fb_rtc_alias,
                fb_rc_code
            FROM 
                fb_room_type
            WHERE 
                fb_rt_code IN (?)`,
            [
                data
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );

    },
    processRoomCategory: (data, callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_rc_code,
                fb_rcc_desc
            FROM 
                fb_room_category
            WHERE 
                fb_rc_code IN (?)`,
            [
                data
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    processRoomMaster: (data, callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_rm_code,
                fb_rmc_desc
            FROM 
                fb_room_master
            WHERE 
                fb_rm_code IN (?)`,
            [
                data
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    processNursingStation: (data, callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_ns_code,
                fb_ns_name
            FROM 
                fb_nurse_station_master
            WHERE 
                fb_ns_code IN (?)`,
            [
                data
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    processBedDetail: (data, callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_bd_code,
                fb_bdc_no
            FROM 
                fb_bed
            WHERE 
                fb_bd_code IN (?)`,
            [
                data
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    insertRoomTypeMeliora: (data, callBack) => {
        try {
            mysqlpool.query(
                `INSERT INTO fb_room_type (
                fb_rt_code,
                fb_rtc_desc,
                fb_rtc_alias,
                fb_rc_code,
                fb_rtc_status,
                fb_icu,
                fb_rtc_mhcode
            ) VALUES ?
            `,
                [
                    data
                ],
                (error, results, fields) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, { insertId: results.insertId });
                }
            );
        } catch (err) {
            return callBack(err);
        }
    },

    insertRoomCategoryTypeMeliora: (data, callBack) => {
        try {
            mysqlpool.query(
                `INSERT INTO fb_room_category (
                fb_rc_code,
                fb_rcc_desc,
                fb_rcc_alias,
                fb_rcc_status,
                fb_rcc_mhocde
            ) VALUES ?
            `,
                [
                    data
                ],
                (error, results, fields) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, { insertId: results.insertId });
                }
            );
        } catch (err) {
            return callBack(err);
        }
    },
    insertRoomMasterTypeMeliora: (data, callBack) => {
        try {
            mysqlpool.query(
                `INSERT INTO fb_room_master (
                 fb_rm_code,
                fb_rmc_desc,
                fb_rmc_alias,
                fb_rac_status,
                fb_rmc_mhcode,
                fb_ns_code
            ) VALUES ?
            `,
                [
                    data
                ],
                (error, results, fields) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, { insertId: results.insertId });
                }
            );
        } catch (err) {
            return callBack(err);
        }
    },
    insertnurseStationMeliora: (data, callBack) => {
        try {
            mysqlpool.query(
                `INSERT INTO fb_nurse_station_master (
                 fb_ns_code,
                fb_ns_name
            ) VALUES ?
            `,
                [
                    data
                ],
                (error, results, fields) => {
                    if (error) {
                        return callBack(error);
                    }
                    return callBack(null, { insertId: results.insertId });
                }
            );
        } catch (err) {
            return callBack(err);
        }
    },

    getAllRoomTypeDetail: (callBack) => {
        mysqlpool.query(
            `SELECT 
            fb_rt_code,
            fb_rtc_desc,
            fb_rtc_alias,
            fb_rc_code,
            fb_rtc_status,
            fb_icu,
            fb_rtc_mhcode
        FROM
            fb_room_type`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    getAllRoomCategoryDetail: (callBack) => {
        mysqlpool.query(
            `SELECT 
            fb_rc_code,
            fb_rcc_desc,
            fb_rcc_alias,
            fb_rcc_status,
            fb_rcc_mhocde
        FROM
            fb_room_category`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );

    },

    getAllRoomMasterDetail: (callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_rm_code,
                fb_rmc_desc,
                fb_rmc_alias,
                fb_rac_status,
                fb_rmc_mhcode,
                fb_ns_code
            FROM
                fb_room_master`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    getAllBedDetail: (callBack) => {
        mysqlpool.query(
            `SELECT 
                fb_bd_code
            FROM
                fb_bed`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getPatientDetailMeliora: (data, callBack) => {
        mysqlpool.query(
            `SELECT DISTINCT
                fb_ipadmiss.fb_ip_no
                FROM fb_ipadmiss
                LEFT JOIN fb_bed 
                    ON fb_ipadmiss.fb_bd_code = fb_bed.fb_bd_code
                LEFT JOIN fb_nurse_station_master 
                    ON fb_bed.fb_ns_code = fb_nurse_station_master.fb_ns_code
                WHERE fb_bed.fb_ns_code = ?
                AND (
                    fb_ipadmiss.fb_ipd_disc IS NULL
                    OR fb_ipadmiss.fb_ipd_disc >= NOW() - INTERVAL 12 HOUR
                ) and fb_ipadmiss.fb_ipc_curstatus != 'PCO' `,
            [
                data.NS_CODE
            ],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    InsertNsPatientDetailMeliora: (data, callBack) => {
        mysqlpool.query(
            `INSERT INTO fb_ipadmiss (
                fb_ip_no, fb_ipd_date, fb_pt_no, fb_ptc_name, fb_ptc_sex,
                fb_ptd_dob, fb_ptn_dayage, fb_ptn_monthage, fb_ptn_yearage,
                fb_ptc_loadd1, fb_ptc_loadd2, fb_ptc_loadd3, fb_ptc_loadd4,
                fb_ptc_lopin, fb_rc_code, fb_bd_code, fb_do_code, fb_rs_code,
                fb_ipc_curstatus, fb_ptc_mobile, fb_ipc_mhcode, fb_doc_name,
                fb_dep_desc,fb_ipd_disc,fb_ipc_status,fb_dmc_slno,fb_dmd_date
            ) VALUES ? `,
            [data],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    UpdatePatientDetail: (data, callBack) => {
        const values = [...data.slice(1), data[0]];// IP_NO moved to last for WHERE

        mysqlpool.query(
            `UPDATE fb_ipadmiss SET
                fb_ipd_date = ?, fb_pt_no = ?, fb_ptc_name = ?, fb_ptc_sex = ?,
                fb_ptd_dob = ?, fb_ptn_dayage = ?, fb_ptn_monthage = ?, fb_ptn_yearage = ?,
                fb_ptc_loadd1 = ?, fb_ptc_loadd2 = ?, fb_ptc_loadd3 = ?, fb_ptc_loadd4 = ?,
                fb_ptc_lopin = ?, fb_rc_code = ?, fb_bd_code = ?, fb_do_code = ?, fb_rs_code = ?,
                fb_ipc_curstatus = ?, fb_ptc_mobile = ?, fb_ipc_mhcode = ?, fb_doc_name = ?,
                fb_dep_desc = ?, fb_ipd_disc = ?, fb_ipc_status = ?, fb_dmc_slno = ?, fb_dmd_date = ?
            WHERE fb_ip_no = ? `,
            values,
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    }








}
