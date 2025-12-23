import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../utils/verifyEmail.js";
import { Session } from "../models/sessionModel.js";
import "dotenv/config";
import { sendOtpMail } from "../utils/sendOtpMail.js";
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
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    const emailResult = await verifyEmail(token, email, username);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "User created but email failed",
      });
    }
    newUser.token = token;
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fiels are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No user found, Please register before logging, Thankyou!",
      });
    }
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(402).json({
        success: false,
        message: "Incorrect password",
      });
    }
    //check if user is verified or not
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Verify your account then login",
      });
    }
    // check for existing session and delete it
    const existingSession = await Session.findOne({ userId: user._id });
    if (existingSession) {
      await Session.deleteOne({ userId: user._id });
    }
    //create a new session
    await Session.create({ userId: user._id });

    //Generate tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });
    user.isLoggedIn = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.username}`,
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId;
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // ⏳ 2-minute resend cooldown
if (user.otpExpiry) {
  const otpCreatedAt = new Date(user.otpExpiry.getTime() - 10 * 60 * 1000);
  const now = new Date();

  const diffInMinutes = (now - otpCreatedAt) / (1000 * 60);

  if (diffInMinutes < 2) {
    const waitTime = Math.ceil(2 - diffInMinutes);
    return res.status(429).json({
      success: false,
      message: `Please wait ${waitTime} more minute(s) before requesting another OTP.`,
    });
  }
}

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpMail(email, otp);
    return res.status(200).json({
      success:true,
      message:"otp sent successfully, check your spam folder"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async(req, res)=>{
  const {Otp} = req.body;
    const email = req.params.email;
    if(!otp){
      return res.status(400).json({
        success:false,
        message:"OTP is required"
      })
    }
  try{
    const user = await User.findOne({email})
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }
    if(!user.otp || !user.otpExpiry){
      return res.status(400).json({
        success:false,
        message:"Otp not generated or already verified"
      })
    }
    if(user.otpExpiry < new Date()){
      return res.status(400).json({
        success:false,
        message:"OTP has expired. Please request a new one"
      })
    }
    if(otp!=user.otp){
      return res.status(400).json({
        success:false,
        message:"Invalid Otp      "
      })
    }
  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}
