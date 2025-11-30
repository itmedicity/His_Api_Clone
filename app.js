require("dotenv").config();

const express = require("express");

const app = express();

//IMPORT MODULES
const emplyeeRoutes = require("./api/employee/emp.router");
const usgroup = require("./api/newUsergroup/newgroup.router");
const menugroup = require("./api/MenuGroup/menugroup.router");
const userright = require("./api/userRights/userRights.router");
const oracleUserTable = require("./api/Reports/oraUsers/user.router");

//QMT
const collection = require("./api/Reports/misReport/collectionPart/collection.router");
const patientTypeDiscount = require("./api/Reports/misReport/PatientType/patientType.router");
const pharmacy = require("./api/Reports/misReport/incomePart/pharmacyincome/pharmacy.router");
const income = require("./api/Reports/misReport/incomePart/procedureIncome/proincome.router");
// QMT income part details
const incomeDetlPart = require("./api/Reports/misReport/MisDetlRpt/incomePart/income.router");
const collectionDetlPart = require("./api/Reports/misReport/MisDetlRpt/collectionPart/misCollectonPart.router");

//QMT TYPE
const collectionQmt = require("./api/Reports/misReportType/collectionPart/collection.router");
const patientTypeDiscountQmt = require("./api/Reports/misReportType/PatientType/patientType.router");
const pharmacyQmt = require("./api/Reports/misReportType/incomePart/pharmacyincome/pharmacy.router");
const incomeQmt = require("./api/Reports/misReportType/incomePart/procedureIncome/proincome.router");
// QMT TYPE income part details
const incomeDetlPartQmt = require("./api/Reports/misReportType/MisDetlRpt/incomePart/income.router");
const collectionDetlPartQmt = require("./api/Reports/misReportType/MisDetlRpt/collectionPart/misCollectonPart.router");

//TSSH
const collectionTssh = require("./api/Reports/misReportTssh/collectionPart/collectionTssh.router");
const patientTypeDiscountTssh = require("./api/Reports/misReportTssh/PatientType/patientTypeTssh.router");
const pharmacyTssh = require("./api/Reports/misReportTssh/incomePart/pharmacyincome/pharmacyTssh.router");
const incomeTssh = require("./api/Reports/misReportTssh/incomePart/procedureincome/proincomeTssh.router");
// TSSH income part details
const incomeDetlPartTssh = require("./api/Reports/misReportTssh/MisDetlRpt/incomePart/income.router");
const collectionDetlPartTssh = require("./api/Reports/misReportTssh/MisDetlRpt/collectionPart/misCollectonPart.router");
//TMCH
const collectionTmch = require("./api/Reports/misReportTmch/collectionPart/collectionTmch.router");
const patientTypeDiscountTmch = require("./api/Reports/misReportTmch/PatientType/patientTypeTmch.router");
const pharmacyTmch = require("./api/Reports/misReportTmch/incomePart/pharmacyincome/pharmacyTmch.router");
const incomeTmch = require("./api/Reports/misReportTmch/incomePart/procedureIncome/proincomeTmch.router");
// TMCH income part details
const incomeDetlPartTmch = require("./api/Reports/misReportTmch/MisDetlRpt/incomePart/income.router");
const collectionDetlPartTmch = require("./api/Reports/misReportTmch/MisDetlRpt/collectionPart/misCollectonPart.router");
//GENERAL PURPOSE
const admissionList = require("./api/Reports/InpatientList/admissionList.router");
//ROL SETTING
const importMedicine = require("./api/MedicineDescription/medicine.router");
const storerequest = require("./api/StoreRequisition/storereq.router");
const rolprocess = require("./api/process/rolProcess/rolProcess.router");
//REPORT
const gstTaxPharmacy = require("./api/Reports/GstReportTaxAndPharmacy/taxAndPharmacy.router");
// count
const opcount = require("./api/OPCount/opcount.router");
const ipcount = require("./api/IPCount/ipcount.router");
const dashboard = require("./api/DashBoard/dashBoard.router");
// TO MELIORA
const elliderData = require("./api/MelioraEllider/elliderData.router");
const censusData = require("./api/DailyCensusReport/censusreport.router");
const qiPatientList = require("./api/QIPatientList/getPatientList.router");
// supplier
const supplier = require("./api/SupplierDetails/supplier.router");
const procedure = require("./api/ProcedureList/procedure.router");
//CRF Purchase
const crfpo = require("./api/CRFPurchase/purchase.router");
const bisElliderData = require("./api/Version_1/BIS/bis_ellider_datas/bis_ellider_datas.router");
const bisQuotationData = require("./api/Version_1/BIS/bis_quotation/bis_quotation.router");

//AMS Antibiotic
const amsAntibioticData = require("./api/Ams/Ams.router");

//MEDLAB patient Lab result

const medlab = require("./api/Medlab/medlab.router");

// CRON JOB FUNCTION
const cronjob = require("./cron-jobs/cron.router");

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//MAP ROUTES
app.use("/api/employee", emplyeeRoutes);
app.use("/api/oraUser", oracleUserTable);

//QMT
app.use("/api/collection", collection);
app.use("/api/patientType", patientTypeDiscount);
app.use("/api/pharmacy", pharmacy);
app.use("/api/income", income);
app.use("/api/incomeDetl", incomeDetlPart);
app.use("/api/collectionDetlPart", collectionDetlPart);

//QMT TYPE
app.use("/api/collectionQmt", collectionQmt);
app.use("/api/patientTypeQmt", patientTypeDiscountQmt);
app.use("/api/pharmacyQmt", pharmacyQmt);
app.use("/api/incomeQmt", incomeQmt);
app.use("/api/incomeDetlQmt", incomeDetlPartQmt);
app.use("/api/collectionDetlPartQmt", collectionDetlPartQmt);

//TSSH
app.use("/api/collectionTssh", collectionTssh);
app.use("/api/patientTypeTssh", patientTypeDiscountTssh);
app.use("/api/pharmacyTssh", pharmacyTssh);
app.use("/api/incomeTssh", incomeTssh);
app.use("/api/incomeDetlTssh", incomeDetlPartTssh);
app.use("/api/collectionDetlPartTssh", collectionDetlPartTssh);

//TMCH
app.use("/api/collectionTmch", collectionTmch);
app.use("/api/patientTypeTmch", patientTypeDiscountTmch);
app.use("/api/pharmacyTmch", pharmacyTmch);
app.use("/api/incomeTmch", incomeTmch);
app.use("/api/incomeDetlTmch", incomeDetlPartTmch);
app.use("/api/collectionDetlPartTmch", collectionDetlPartTmch);

//GENERAL
app.use("/api/admission", admissionList);
app.use("/api/usergroup", usgroup);
app.use("/api/menugroups", menugroup);
app.use("/api/userrights", userright);

// ROL
app.use("/api/importMedicines", importMedicine);
app.use("/api/storerequest", storerequest);
app.use("/api/rolprocess", rolprocess);

//REPORT
app.use("/api/pharmacytax", gstTaxPharmacy);

// count
app.use("/api/opcount", opcount);
app.use("/api/ipcount", ipcount);
app.use("/api/dashboard", dashboard);

// MELIORA
app.use("/api/melioraEllider", elliderData);
app.use("/api/dailyCensus", censusData);
app.use("/api/qualityIndicator", qiPatientList);
app.use("/api/supplierList", supplier);
app.use("/api/procedureList", procedure);
app.use("/api/crfpurchase", crfpo);

//BIS_ELLIDER_API
app.use("/api/bisElliderData", bisElliderData);
app.use("/api/bisQuotationData", bisQuotationData);

//Ams _Antibiotic Data Collection
app.use("/api/amsAntibiotic", amsAntibioticData);

//MedLab Patient Lab Result and Pharmacy
app.use("/api/medlab", medlab);

// CRON JOB FUNCTION
app.use("/api/cronjob", cronjob);

app.listen(process.env.APP_PORT, (val) => {
  console.log(`Server Up and Running ${process.env.APP_PORT}`);
});
