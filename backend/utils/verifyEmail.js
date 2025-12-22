import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyEmail = async (token, email, username) => {
  try {
    const templatePath = path.join(
      __dirname,
      "template.hbs"
    );
    const source = fs.readFileSync(templatePath, "utf-8");

    const template = Handlebars.compile(source);

    const html = template({
      appName: "Notes App",
      username: username || "user",
      token,
      expiryMinutes: 10,
    });

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Verify your email",
      html,
    };
    await sgMail.send(msg);
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("SendGrid email error:", {
      message: error.message,
      response: error.response?.body,
    });
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
};
