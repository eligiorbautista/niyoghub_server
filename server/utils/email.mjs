import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendResetEmail = async (to, resetURL, mobileResetURL) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    /*       <p style="text-align: center; margin-top: 15px;">
              <a href="${mobileResetURL}" style="display: inline-block; background-color: #FFA500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password in App</a>
            </p>
             */
    const mailOptions = {
      from: `"NiyogHub Support" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
          <header style="padding: 10px 20px; text-align: center;">
            <img src="cid:logo" alt="NiyogHub Banner" style="max-width: 100%; height: auto;" />
          </header>
          <main style="padding: 20px;">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. If you didn’t make this request, just ignore this email. Otherwise, you can reset your password by clicking one of the options below:</p>
            <p style="text-align: center;">
              <a href="${resetURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password on Website</a>
            </p>
            <p>This link is valid for <strong>5 minutes</strong>.</p>
            <p>If you need help, contact our support team at <a href="mailto:niyoghub.assistance@gmail.com" style="color: #4CAF50;">niyoghub.assistance@gmail.com</a>.</p>
            <p>Best, <br>The NiyogHub Support Team</p>
          </main>
          <footer style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p>NiyogHub | Lucena City, Quezon Province, Philippines</p>
            <p>If you didn’t request this email, please <a href="mailto:niyoghub.assistance@gmail.com" style="color: #4CAF50;">contact us</a> right away.</p>
          </footer>
        </div>
      `,
      attachments: [
        {
          filename: "niyoghub.png", // Displayed as an attachment in the email
          path: path.join(__dirname, "../assets/niyoghub_banner_1.png"),
          cid: "logo", // Identifier for the logo image in the email
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending reset email: ${error.message}`);
    throw new Error("Failed to send password reset email.");
  }
};

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"NiyogHub Support" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject: "Two-Factor Authentication Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
          <header style="padding: 10px 20px; text-align: center;">
            <img src="cid:logo" alt="NiyogHub Banner" style="max-width: 100%; height: auto;" />
          </header>
          <main style="padding: 20px;">
            <h2>Two-Factor Authentication</h2>
            <p>Hello,</p>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>Please enter this code to complete your login process. This code is valid for <strong>5 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>If you need help, contact our support team at <a href="mailto:niyoghub.assistance@gmail.com" style="color: #4CAF50;">niyoghub.assistance@gmail.com</a>.</p>
            <p>Best, <br>The NiyogHub Support Team</p>
          </main>
          <footer style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            <p>NiyogHub | Lucena City, Quezon Province, Philippines</p>
            <p>If you didn’t request this email, please <a href="mailto:niyoghub.assistance@gmail.com" style="color: #4CAF50;">contact us</a> right away.</p>
          </footer>
        </div>
      `,
      attachments: [
        {
          filename: "niyoghub.png",
          path: path.join(__dirname, "../assets/niyoghub_banner_1.png"),
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending two-factor email: ${error.message}`);
    throw new Error("Failed to send two-factor authentication email.");
  }
};
