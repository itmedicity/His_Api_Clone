require("dotenv").config();

const express = require("express");

const app = express();

//IMPORT MODULES
const emplyeeRoutes = require("./api/employee/emp.router");
const usgroup = require("./api/newUsergroup/newgroup.router");
const menugroup = require("./api/MenuGroup/menugroup.router");
const userright = require("./api/userRights/userRights.router");
const oracleUserTable = require("./api/Reports/oraUsers/user.router")
//QMT
const collection = require("./api/Reports/misReport/collectionPart/collection.router")
const patientTypeDiscount = require("./api/Reports/misReport/PatientType/patientType.router")
const pharmacy = require("./api/Reports/misReport/incomePart/pharmacyincome/pharmacy.router")
const income = require("./api/Reports/misReport/incomePart/procedureIncome/proincome.router")
//TSSH
const collectionTssh = require('./api/Reports/misReportTssh/collectionPart/collectionTssh.router')

//GENERAL PURPOSE
const admissionList = require("./api/Reports/InpatientList/admissionList.router")

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


// MELIORA
const elliderData = require("./api/MelioraEllider/elliderData.router");

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

//MAP ROUTES
app.use("/api/employee", emplyeeRoutes)
// app.use("/api/oraUser", oracleUserTable)
//QMT
app.use("/api/collection", collection)
app.use("/api/patientType", patientTypeDiscount)
app.use("/api/pharmacy", pharmacy)
app.use("/api/income", income)
//TSSH
app.use("/api/collectionTssh", collectionTssh)
//GENERAL
app.use("/api/admission", admissionList)
app.use("/api/usergroup", usgroup)
app.use("/api/menugroups", menugroup)
app.use("/api/userrights", userright)
// ROL
app.use("/api/importMedicines", importMedicine)
app.use("/api/storerequest", storerequest)
app.use("/api/rolprocess", rolprocess)

//REPORT
app.use("/api/pharmacytax", gstTaxPharmacy)

// count
app.use("/api/opcount", opcount)
app.use("/api/ipcount", ipcount)
app.use("/api/dashboard", dashboard)

// MELIORA
app.use("/api/melioraEllider", elliderData)

app.listen(process.env.APP_PORT, (val) => {
    console.log(`Server Up and Running ${process.env.APP_PORT}`)
})