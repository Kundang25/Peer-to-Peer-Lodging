require('dotenv').config();
const mongoose = require('mongoose');

const dbUrl = process.env.ATLASDB_URL;

console.log("🔍 Connecting to:", dbUrl);

mongoose.connect(dbUrl)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas!");
    return mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });
