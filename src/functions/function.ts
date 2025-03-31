import { IPurchase } from "@/types/purchase";
import fs from "fs";
import jwt from "jsonwebtoken";
import nodemailer, { Transporter } from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import PDFDocument from "pdfkit";

export const generateToken = (userId: string): string => {
  const token = jwt.sign(
    {
      sub: userId,
    },
    process.env.SECRET || "",
    {
      expiresIn: "48h",
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

export function bindMethods(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(proto).filter(
    (name) => typeof instance[name] === "function" && name !== "constructor"
  );

  for (const name of methodNames) {
    instance[name] = instance[name].bind(instance);
  }
}

export const generatePurchasePDFForB2B = async (orderData: IPurchase) => {
  const outputPath = `./pdf/${orderData.id}.pdf`;
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  const logo = orderData?.receiptSettings?.logo || "";

  // Extract necessary data
  const {
    orderNo,
    totalAmount,
    user,
    seller,
    productsPurchased,
    createdAt,
    organization,
  } = orderData;
  const sellerInfo = seller.businessSeller;

  // Header Section
  doc.fontSize(20).font("Helvetica-Bold").text("Order Confirmation", 50, 50);
  doc.image(logo, 450, 40, { width: 100 });
  // doc
  //   .fontSize(16)
  //   .font("Helvetica-Bold")
  //   .text("Miljøpall", 450, 50, { align: "right" });

  // Order details
  doc.fontSize(10).font("Helvetica-Bold").text("Order No:", 50, 90);
  doc.font("Helvetica").text(orderNo, 120, 90);

  doc.fontSize(10).font("Helvetica-Bold").text("Date:", 50, 105);
  doc
    .font("Helvetica")
    .text(new Date(createdAt).toLocaleDateString(), 120, 105);

  doc.fontSize(10).font("Helvetica-Bold").text("Buyer:", 50, 120);
  doc.font("Helvetica").text(user?.name || "", 120, 120);

  // Seller and Buyer info
  doc.fontSize(10).font("Helvetica-Bold").text("Seller:", 50, 150);
  doc
    .font("Helvetica")
    .text(
      `${sellerInfo?.companyName}\n${seller.address}\n${seller.city}\n${seller.phone}`,
      50,
      165
    );

  doc.fontSize(10).font("Helvetica-Bold").text("Buyer:", 300, 150);
  doc
    .font("Helvetica")
    .text(`${user.name}\n${user.email}\n${user.phone}`, 300, 165);

  // Table Header
  doc.moveDown(2);
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Product", 50, 250);
  doc.text("Units", 300, 250);
  doc.text("Price", 400, 250);
  doc.moveTo(50, 265).lineTo(550, 265).stroke();

  // Table Data
  let y = 280;
  doc.font("Helvetica").fontSize(10);
  productsPurchased.forEach((item, index) => {
    const { product, quantity, price } = item;
    doc.text(product.name, 50, y);
    doc.text(quantity.toString(), 300, y);
    doc.text(`${price.mul(quantity)} kr`, 400, y);
    doc.fillColor("#818181").text(`${quantity} × ${price} kr`, 400, y + 15);
    doc.fillColor("#000");
    y += 30;
    if (index !== productsPurchased.length - 1) {
      doc.moveTo(50, y).lineTo(550, y).stroke("#818181");
      y += 15;
    }
  });

  doc.moveTo(50, y).lineTo(550, y).stroke("#000");
  y += 20;

  // Total Price
  doc.font("Helvetica-Bold").text("Total", 300, y);
  doc.text(`${totalAmount} kr`, 400, y).font("Helvetica").fillColor("#818181");
  doc.fillColor("#000");
  doc
    .moveTo(300, y + 15)
    .lineTo(550, y + 15)
    .stroke();

  doc.fontSize(8).text("All prices are exclusive of VAT.", 50, y + 40);

  y += 250;
  // Footer
  doc.fontSize(10).text(organization.companyName || "", 50, y + 70);
  doc.text(organization.organizationNumber, 50, y + 85);
  doc.fillColor("blue").text(organization?.email || "", 50, y + 100);
  doc.fillColor("black").text(organization?.phone || "", 50, y + 115);

  doc.end();
  console.log(`PDF saved to ${outputPath}`);

  return outputPath;
};

export const removeFile = (path: string) => fs.unlinkSync(path);
