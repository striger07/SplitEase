import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// const SALT_ROUNDS = 10;
// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    const existingEmail = await userModel.findOne({ email });
    const existingUsername = await userModel.findOne({ username });

    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists." });
    }

    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import userModel from "../models/userModel.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const validateRequiredFields = (fields) => {
  return fields.every((field) => field && field.trim() !== "");
};

export const checkExistingUser = async (email, username) => {
  const [emailExists, usernameExists] = await Promise.all([
    userModel.findOne({ email }),
    userModel.findOne({ username }),
  ]);
  return { emailExists, usernameExists };
};

export const hashPassword = (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = (inputPassword, storedHash) => {
  return bcrypt.compare(inputPassword, storedHash);
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};
