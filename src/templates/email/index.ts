import { sendMail, stringToHex } from "@/functions/function";
import { Organization } from "@prisma/client";
import ejs from "ejs";

export const sendWelcomeMail = async (
  userID: string,
  email: string,
  name: string,
  organization: Organization
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

    companyName: organization.companyName,
    companyPhone: organization.phone,
    companyEmail: organization.email,
    organizationNumber: organization.organizationNumber,
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
  otp: string,
  organization: Organization
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
    companyName: organization.companyName,
    companyPhone: organization.phone,
    companyEmail: organization.email,
    organizationNumber: organization.organizationNumber,
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

export const sendPurchaseMail = async (
  sellerEmail: string,
  organization: Organization,
  orderConfirmationPdfPath: string
) => {
  const templateBody = {
    companyName: organization.companyName,
    companyPhone: organization.phone,
    companyEmail: organization.email,
    organizationNumber: organization.organizationNumber,
  };

  const data = await ejs.renderFile(
    `${__dirname}/ejs/order-confirmation.ejs`,
    templateBody
  );

  const response = {
    to: sellerEmail,
    body: data,
    subject: `Order Confirmation!`,
  };

  const attachments = [
    {
      filename: "order_confirmation.pdf",
      path: orderConfirmationPdfPath,
      contentType: "application/pdf",
    },
  ];

  await sendMail(response.to, response.subject, "", response.body, attachments);
};
