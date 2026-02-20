const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(MONGODB_URI).then(() => console.log("Analytics service connected to MongoDB"));

// Schemas (mirrors src/lib/models/ABTest.ts)
const ABTestAssignment = mongoose.model(
  "ABTestAssignment",
  new mongoose.Schema(
    { userId: String, testName: String, variation: String, assignedAt: { type: Date, default: Date.now } },
    { collection: "abtestassignments" },
  ),
);

const ABTestEvent = mongoose.model(
  "ABTestEvent",
  new mongoose.Schema(
    {
      userId: String,
      testName: String,
      variation: String,
      eventType: String,
      eventData: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    },
    { collection: "abtestevents" },
  ),
);

// GET /health
app.get("/health", (_, res) => res.json({ status: "ok" }));

// GET /analytics?testName=<name>  — aggregate events & assignments for a test
app.get("/analytics", async (req, res) => {
  try {
    const { testName } = req.query;
    const matchStage = testName ? { testName } : {};

    const [assignments, events] = await Promise.all([
      ABTestAssignment.aggregate([
        { $match: matchStage },
        { $group: { _id: { testName: "$testName", variation: "$variation" }, count: { $sum: 1 } } },
      ]),
      ABTestEvent.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { testName: "$testName", variation: "$variation", eventType: "$eventType" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({ assignments, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /event  — log an A/B test event
app.post("/event", async (req, res) => {
  try {
    const { userId, testName, variation, eventType, eventData } = req.body;
    if (!userId || !testName || !variation || !eventType) {
      return res.status(400).json({ error: "userId, testName, variation, eventType are required" });
    }
    await ABTestEvent.create({ userId, testName, variation, eventType, eventData });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Analytics service listening on port ${PORT}`));
