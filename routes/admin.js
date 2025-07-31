import { Router } from "express";
import { adminModel } from "../db.js";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { adminSaltRounds, jwtAdminSecret } from '../config.js';

const adminRouter = Router();

const signupBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(3),
    lastName: z.string().min(3)
});

const signinBody = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

adminRouter.post("/signup", async function (req, res) {

    const parsedBody = signupBody.safeParse(req.body)

    try {
        if (!parsedBody.success) {
            return res.status(401).json({ msg: "invalid credentials" })
        }

        const { email, password, firstName, lastName } = parsedBody.data;

        const admin = await adminModel.findOne({ email });

        if (admin) {
            return res.status(401).json({ msg: "user already exists" });
        }

        const hashedPass = await bcrypt.hash(password, Number(adminSaltRounds));

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

adminRouter.post("/signin", async function (req, res) {

    const parsedBody = signinBody.safeParse(req.body);

    try {

        if (!parsedBody.success) {
            return res.status(401).json({ msg: "invalid credentials" })
        }

        const { email, password } = parsedBody.data;

        const user = await adminModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found..." });
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ msg: "wrong password" });
        }
        const token = jwt.sign({
            id: user._id
        }, jwtAdminSecret)

        res.status(200).json({
            msg: "Signin successful",
            token: token,
        });
    } catch (err) {
        res.status(401).json({ msg: "something went wrong ", err })
    }


});

export default adminRouter;