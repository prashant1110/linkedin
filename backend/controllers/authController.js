import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exits" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be of atleast 6 Characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      password: hashPassword,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("linkdin-token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 60 * 24 * 1000,
      samesite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error in signup: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please fill all the field" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  await res.cookie("linkdin-token", token, {
    httpOnly: true,
    maxAge: 3 * 60 * 60 * 24 * 1000,
    samesite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Sign in successfully" });
};

export const signOut = (req, res) => {
  res.clearCookie("linkdin-token");
  res.status(200).json({ message: "Logged out successfull" });
};

export const getUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
