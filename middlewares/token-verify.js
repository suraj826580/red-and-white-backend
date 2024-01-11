import jwt from "jsonwebtoken";
import "dotenv/config";
export const tokenVerify = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token missing" });
  }
  try {
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }
    let decoded = jwt.verify(token, process.env.secretKey);
    if (decoded) {
      const data = req.body;
      data.userId = decoded.userId;
      next();
    } else {
      return res.status(401).json({ msg: "Invalid Token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "You are not Authorized" });
  }
};
