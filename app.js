require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const {mysqlExecute} = require("./cron-jobs/CronLogger");
const {initializePools, closePools, restartPools, healthCheck, printPoolStats, scheduleRestart, startHealthMonitor} = require("./config/oradbconfig");
const registerRoutes = require("./routes");

// INITALIZING POOLS
async function bootstrap() {
  try {
    console.log("====================================");
    console.log("Starting Ellider MIS API");
    console.log("====================================");

    await initializePools();
    console.log("Oracle Ready");

    const rows = await mysqlExecute("SELECT 1 AS ok");
    console.log("MySQL Ready:", rows[0].ok);

    startHealthMonitor();

    scheduleRestart(3);

    app.listen(process.env.APP_PORT, () => {
      console.log("====================================");
      console.log(`Server Running : ${process.env.APP_PORT}`);
      console.log("====================================");
    });
  } catch (err) {
    console.error("Bootstrap Failed:", err);
    process.exit(1);
  }
}
const app = express();
// SECURITY HEADERS
app.use(helmet());
// COMPRESSION FOR REDUCE THE BANDWIDTH
app.use(compression());
// CORS CONFIGURATION
app.use(
  cors({
    origin: "*",
    // credentials: true,
    // origin: ["http://localhost:3000", "https://mis.tmchospital.com"],
    credentials: false,
  }),
);
app.use(express.json({limit: "20mb"}));
app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  }),
);
app.disable("x-powered-by");
// REGISTER ROUTES
registerRoutes(app);
/************************************************************* */
// SHUTDOWN
async function shutdown(signal) {
  console.log(`${signal} received`);

  try {
    await closePools();
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
}
/************************************************************* */

// HEALTH CHECK ENDPOINT
app.get("/health", async (req, res) => {
  try {
    const rows = await mysqlExecute("SELECT 1");

    res.json({
      status: "UP",
      mysql: rows.length > 0,
      oracle: true,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      status: "DOWN",
      error: err.message,
    });
  }
});

app.get("/pool", (req, res) => {
  res.json(printPoolStats());
});

app.get("/api/restart", async (req, res) => {
  try {
    await restartPools();
    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

bootstrap();

process.on("SIGINT", async () => shutdown("SIGINT"));
process.on("SIGTERM", async () => shutdown("SIGTERM"));

process.on("uncaughtException", async (err) => {
  console.error(err);
  await shutdown("uncaughtException");
});

process.on("unhandledRejection", async (err) => {
  console.error(err);
  await shutdown("unhandledRejection");
});
