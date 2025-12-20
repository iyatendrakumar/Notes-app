import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../utils/verifyEmail.js";
import 'dotenv/config'

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
        { id:newUser._id}, 
        process.env.SECRET_KEY, 
        {expiresIn:"10m"}
    );
    
    verifyEmail(token, email)
    newUser.token = token;
    await newUser.save();
    // if (!emailResult.success) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "User created but email failed",
    //   });
    // }

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        id:newUser._id,
        username: newUser.username,
        email:newUser.email
    }
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
