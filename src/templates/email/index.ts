import { sendMail, stringToHex } from "@/functions/function";
import ejs from "ejs";

export const sendWelcomeMail = async (
  userID: string,
  email: string,
  name: string
) => {
  const body = {
    userID,
    email,
    name,
    type: "INVITE_USER",
  };
  const link = `${process.env.CLIENT_URL}/reset-password?code=${stringToHex(
    JSON.stringify(body)
  )}`;

  const templateBody = {
    name,
    link,
  };

  const data = await ejs.renderFile(
    `${__dirname}/ejs/welcome-email.ejs`,
    templateBody
  );

  const response = {
    to: email,
    body: data,
    subject: `Welcome Email!`,
  };

  await sendMail(response.to, response.subject, "", response.body);
};
export const sendResetPasswordMail = async (
  userID: string,
  email: string,
  otp: string
) => {
  const body = {
    userID,
    email,
    otp,
    type: "RESET_PASSWORD",
  };
  const link = `${process.env.CLIENT_URL}/reset-password?code=${stringToHex(
    JSON.stringify(body)
  )}`;

  const templateBody = {
    link,
  };

  const data = await ejs.renderFile(
    `${__dirname}/ejs/reset-password-email.ejs`,
    templateBody
  );

  const response = {
    to: email,
    body: data,
    subject: `Reset Password!`,
  };

  await sendMail(response.to, response.subject, "", response.body);
};
