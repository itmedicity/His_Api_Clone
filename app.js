require("dotenv").config();

const express = require("express");

const app = express();
app.use(express.json());

app.listen(process.env.APP_PORT, (val) => {
    console.log(`Server Up and Running ${process.env.APP_PORT}`)
})