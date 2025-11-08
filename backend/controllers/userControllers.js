import userModel from "../models/userModel.js";

export const checkUserExists = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    const user = await userModel.findOne({ username });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("User check error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
