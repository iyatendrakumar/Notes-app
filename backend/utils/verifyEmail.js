import sgMail from "@sendgrid/mail";


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const verifyEmail = async (token, email) => {
  try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Verify your email",
        html: `
          <h2>Email Verification</h2>
          <h3>Your verification code:</h3>
          <h1>${token}</h1>
          <h6>This code expires in 10 minutes.</h6>
        `,
      };
      await sgMail.send(msg);
      return {
        success:true,
        message:"Verification email sent successfully",
      };
    } catch (error){
        console.error("SendGrid email error:", {
            message: error.message,
            response: error.response?.body,
        });
        return {
            success:false,
            message:"Failed to send verification email",
        };
    }

};
