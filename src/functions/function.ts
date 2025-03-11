import jwt from "jsonwebtoken";
import nodemailer, { Transporter } from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";

export const generateToken = (userId: string): string => {
  const token = jwt.sign(
    {
      sub: userId,
    },
    process.env.SECRET || "",
    {
      expiresIn: "2h",
    }
  );
  return token;
};

export const sendMail = async (
  emailTo: string,
  subject: string,
  text: string,
  html: string,
  file: unknown[] = []
): Promise<unknown> => {
  try {
    if (!process.env.SEND_GRID_KEY) {
      throw new Error("SendGrid API Key is missing");
    }

    if (process.env.NODE_ENV && process.env.NODE_ENV.trim() !== "PROD") {
      subject = `[TEST] ${subject}`;
    }

    const defaultMailOption = {
      from: process.env.SMTP_FROM,
      to: emailTo,
      subject,
      text: text || "",
      html: html || "",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mailOption: any = {};
    if (file.length) {
      mailOption = {
        ...defaultMailOption,
        attachments: [...file],
      };
    } else {
      mailOption = {
        ...defaultMailOption,
      };
    }

    const transporter: Transporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          api_key: process.env.SEND_GRID_KEY || "",
        },
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sendMailResponse: any = await transporter.sendMail(mailOption);
    sendMailResponse.response = sendMailResponse.message || null;
    sendMailResponse =
      sendMailResponse && sendMailResponse.response
        ? sendMailResponse.response
        : "Send Mail Error";
    return sendMailResponse;
  } catch (err: unknown) {
    console.log(err);
  }
};

export const stringToHex = (str: string): string => {
  return Buffer.from(str).toString("hex");
};

export const hexToString = (hex: string): string => {
  return Buffer.from(hex, "hex").toString();
};

export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};
