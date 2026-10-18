// Run once:  node seedAdmin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const email = "admin@recipefinder.com";
const password = "admin123";

let admin = await User.findOne({ email });
if (admin) {
  admin.role = "admin";
  await admin.save();
  console.log("Admin already existed, role confirmed.");
} else {
  await User.create({ name: "Admin", email, password, role: "admin" });
  console.log(`Admin created. Email: ${email}  Password: ${password}`);
}
await mongoose.disconnect();
