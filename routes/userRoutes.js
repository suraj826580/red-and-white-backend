import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { tokenVerify } from "../middlewares/token-verify.js";
const router = express.Router();

router.get("/get-user", tokenVerify, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      res.status(404).send({ msg: "User not found" });
    } else {
      res
        .status(200)
        .send({ msg: "User details retrieved successfully", user });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/update-user/:id", tokenVerify, async (req, res) => {
  try {
    const _id = req.params.id;
    const data = req.body;
    const userData = await User.findOne({ _id });
    const dbOldPassword = userData.password;

    const checkPassword = bcrypt.compareSync(data.old_password, dbOldPassword);
    if (!checkPassword) {
      return res.status(401).send({ msg: "Incorrect Password" });
    } else {
      const { _id, old_password, userId, ...newData } = data;
      const hash = bcrypt.hashSync(newData.password, 3);
      if (hash) {
        newData.password = hash;
        const result = await User.findOneAndUpdate({ _id }, newData, {
          new: true,
        });
        if (result) {
          res.status(200).send({ msg: "Profile Updated Sucessfully" });
        } else {
          return res.status(401).send({ msg: "Something went wrong" });
        }
      } else {
        res.status(401).send({ msg: "Something went wrong" });
      }
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

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
      expiresIn: "1d",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
