import { Router } from 'express';
import { userModel } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import  dotenv from "dotenv";
dotenv.config();


const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    const { email, password, firstName, lastName } = req.body;

    try {
        const existingUSer = await userModel.findOne({ email });
        if (existingUSer) {
            return res.status(400).json({ msg: "User already exists..." })
        }
        const hashedPass = await bcrypt.hash(password, Number(process.env.saltRound || 10));

        await userModel.create({
            email: email,
            password: hashedPass,
            firstName: firstName,
            lastName: lastName
        });
        res.status(201).json({
            msg: "signup successful..."
        })
    } catch (err) {
        console.error(err);
        res.status(505).json({ msg: "something went wrong..." });
    }
});

userRouter.post("/signin", async function (req, res) {

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found..." });
        }

        const match = bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ msg: "wrong password" });
        }
        const token = jwt.sign({
            id: user.id
        }, process.env.JWT)
        res.json({
            token: token
        })
    } catch (err) {
        res.status(401).json({ msg: "something went wrong ", err })
    }


});

export default userRouter;