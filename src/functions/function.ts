import jwt from "jsonwebtoken";

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
