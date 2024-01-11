import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    bcrypt.hash(password, 3).then(async (hash) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      } else {
        if (hash) {
          const user = new User({
            firstName,
            lastName,
            email,
            password: hash,
          });
          await user.save();
          res.status(200).send({ msg: "Registration Successfull", user });
        } else {
          res.status(400).send(err);
        }
      }
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "red-and-white", {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
