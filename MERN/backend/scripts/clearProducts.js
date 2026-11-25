const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

(async () => {
  try {
    await connectDB();
    const result = await Product.deleteMany({});
    console.log(`CampusCart products cleared: ${result.deletedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Could not clear CampusCart products:', error.message);
    process.exit(1);
  }
})();
