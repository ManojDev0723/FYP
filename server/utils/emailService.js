const nodemailer = require("nodemailer");

// Use placeholders or proper env vars - configure your genuine credentials in .env later
// const EMAIL_USER = process.env.EMAIL_USER || "your-email@gmail.com";
// const EMAIL_PASS = process.env.EMAIL_PASS || "your-app-password";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS ,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"DealHub" <${process.env.EMAIL_USER || 'noreply@dealhub.com'}>`,
    to: email,
    subject: "Verify Your DealHub Account",
    text: `Your OTP for DealHub registration is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to DealHub!</h2>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address:</p>
        <h1 style="font-size: 36px; letter-spacing: 4px; color: #007bff; text-align: center; margin: 30px 0;">${otp}</h1>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DealHub. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    // Suppress error if using placeholders, otherwise throw it
    if (!process.env.EMAIL_USER) {
      console.warn("Email placeholders used. Real email wasn't sent.");
    } else {
      throw new Error("Failed to send OTP email");
    }
  }
};

module.exports = {
  sendOTP,
};
