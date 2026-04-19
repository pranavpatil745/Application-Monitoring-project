const express = require("express");
const client = require("prom-client");
const { doSomeHeavyTask } = require("./util");
const { createLogger } = require("winston");
const LokiTransport = require("winston-loki");

const app = express();
const PORT = process.env.PORT || 8000;

// Logger setup (Loki)
const logger = createLogger({
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100",
      labels: { app: "node-app" },
      json: true,
      format: require("winston").format.combine(
        require("winston").format((info) => {
          info.labels = { level: info.level }; // 👈 KEY LINE
          return info;
        })(),
        require("winston").format.json()
      )
    })
  ]
});

// Prometheus default metrics
client.collectDefaultMetrics();

app.get("/", (req, res) => {
  logger.info("Request received on /Normal route");
  res.send("Hello! Server is running.");
});

app.get("/slow", async (req, res) => {
  try {
    logger.info("Request received on /slow route");
    const result = await doSomeHeavyTask();
    res.send(`Heavy task done: ${result}`);
  } catch (err) {
    logger.error("Error in /slow route", { error: err.message });
    res.status(500).send("Internal Server Error");
  }
});

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});