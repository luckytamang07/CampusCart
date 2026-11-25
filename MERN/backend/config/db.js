const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (process.env.SKIP_LOCAL_DB === "true") {
      console.log(
        "Skipping localhost MongoDB connection in preview environment."
      );
      return false;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error(
        "MongoDB Connection Error: MONGODB_URI is not defined in backend/.env"
      );
      return false;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
