const bcrypt = require("bcryptjs");
const User = require("../models/User");

/**
 * Makes sure an admin account exists (created once, only if no admin is in the database).
 * Credentials come from backend/.env: ADMIN_EMAIL and ADMIN_PASSWORD.
 */
const ensureAdminUser = async () => {
  try {
    if (await User.findOne({ role: "admin" })) return;

    const email = (process.env.ADMIN_EMAIL || "admin.01@presidencyuniversity.in").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      _id: "admin-1",
      email,
      passwordHash,
      role: "admin",
      status: "active",
      profile: {
        id: "admin-1",
        fullName: "CampusCart Admin",
        email,
        phone: "9000000000",
        university: "Presidency University, Bangalore",
        campusLocation: "Admin Block",
        role: "admin",
        verified: false,
        memberSince: "Nov 2026",
        rating: 5,
        reviewCount: 0,
        soldCount: 0,
        status: "active",
        preferences: {
          notifyMessages: true,
          notifyInterest: true,
          notifyListingUpdates: true,
          notifySystem: true,
          showPhoneOnProfile: false,
          showOnlineStatus: true,
          campusOnlyVisibility: false,
        },
      },
    });
    console.log(`Admin account created: ${email}`);
  } catch (error) {
    console.error(`Could not create the admin account: ${error.message}`);
  }
};

module.exports = ensureAdminUser;
