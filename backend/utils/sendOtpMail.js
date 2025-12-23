// utils/sendOtpMail.js
import sgMail from "@sendgrid/mail";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOtpMail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be verified in SendGrid
      subject: "Password Reset OTP",
      html: `
  <div style="background-color:#f5f7fa;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="padding:24px 32px;border-bottom:1px solid #eaeaea;">
          <h1 style="margin:0;font-size:20px;color:#111;">
            Notes App
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="font-size:15px;color:#333;margin-bottom:16px;">
            Hello,
          </p>

          <p style="font-size:15px;color:#333;margin-bottom:24px;">
            We received a request to reset the password for your account.
            Use the verification code below to proceed.
          </p>

          <div style="margin:32px 0;text-align:center;">
            <span style="
              display:inline-block;
              font-size:28px;
              font-weight:600;
              letter-spacing:6px;
              color:#111;
              padding:12px 24px;
              border:1px solid #e0e0e0;
              border-radius:6px;
              background:#fafafa;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size:14px;color:#555;margin-bottom:8px;">
            This code will expire in <strong>10 minutes</strong>.
          </p>

          <p style="font-size:14px;color:#555;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 32px;border-top:1px solid #eaeaea;font-size:12px;color:#888;">
          <p style="margin:0;">
            © ${new Date().getFullYear()} Notes App Built by Yatendra Kumar.
          </p>
          <p style="margin:4px 0 0;">
            This is an automated message. Please do not reply.
          </p>
        </td>
      </tr>

    </table>
  </div>
`

    };

    await sgMail.send(msg);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("Send OTP Mail Error:", error);

    return {
      success: false,
      message: "Failed to send OTP email",
    };
  }
};
