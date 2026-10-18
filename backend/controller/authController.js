import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const payload = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, token: sign(u._id) });

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (await User.findOne({ email: email.toLowerCase() })) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }
  const user = await User.create({ name, email, password });
  res.status(201).json(payload(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await user.matchPassword(password || ""))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  res.json(payload(user));
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await user.matchPassword(password || ""))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }
  if (user.role !== "admin") return res.status(403).json({ message: "This account is not an admin" });
  res.json(payload(user));
};

export const getProfile = (req, res) => res.json(req.user);

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, email, password } = req.body;
  if (name) user.name = name;
  if (email && email.toLowerCase() !== user.email) {
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: "That email is already in use" });
    }
    user.email = email;
  }
  if (password) {
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    user.password = password;
  }
  await user.save();
  res.json(payload(user));
};
