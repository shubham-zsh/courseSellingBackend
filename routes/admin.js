import { Router } from "express";
import { adminModel } from "../db.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
dotenv.config();

const adminRouter = Router();

adminRouter.post("/signup", async function (req, res) {

    const { email, password, firstName, lastName } = req.body;

    try {
        const admin = await adminModel.findOne({ email });

        if (admin) {
            return res.status(401).json({ msg: "user already exists" });
        }

        const hashedPass = await bcrypt.hash(password, Number(process.env.adminSaltRound));

        await adminModel.create({
            email,
            password: hashedPass,
            firstName,
            lastName
        })
        res.status(201).json({ msg: "signup successful" })

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal server error" });
    }
})

export default adminRouter;