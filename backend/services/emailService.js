const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()

// Create a transporter using Gmail (You can use SendGrid, AWS SES etc. later)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (NOT regular password)
  },
})

// Generic function to send email
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Anime Stream" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent: " + info.response)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

module.exports = { sendEmail }
