import { Router } from 'express';
import { userModel } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { userSaltRounds, jwtUserSecret } from '../config.js'
import z from "zod";


const userRouter = Router();

const signupBody = z.object({
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(3),
    lastName: z.string().min(3)
});

const signIn = z.object({
    email: z.email(),
    password: z.string().min(6)
});

userRouter.post("/signup", async function (req, res) {

    const parsedBody = signupBody.safeParse(req.body);

    try {
        if (!parsedBody.success) {
            return res.status(401).json({ msg: "invalid credentials" })
        }

        const { email, password, firstName, lastName } = parsedBody.data;

        const existingUSer = await userModel.findOne({ email });

        if (existingUSer) {
            return res.status(400).json({ msg: "User already exists..." })
        }
        const hashedPass = await bcrypt.hash(password, Number(userSaltRounds || 10));

        await userModel.create({
            email: email,
            password: hashedPass,
            firstName: firstName,
            lastName: lastName
        });

        return res.status(201).json({
            msg: "signup successful..."
        })
    } catch (err) {
        return res.status(505).json({ msg: "something went wrong..." });
    }
});

userRouter.post("/signin", async function (req, res) {

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found..." });
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ msg: "wrong password" });
        }
        const token = jwt.sign({
            id: user._id
        }, jwtUserSecret)

        return res.status(200).json({
            msg: "Signin successful",
            token: token,
        });
    } catch (err) {
        return res.status(401).json({ msg: "something went wrong ", err })
    }


});

userRouter.get("/purchase", async function (req, res) {

    const userId = req.userId;

    try {

        const purcheses = await findOne({ userId });

        if (!purcheses) {
            return res.json({ msg: "No courses available" });
        };

        let purchasesCourse = [];

        for (var i = 0; i < purcheses.lenght; i++) {
            purchasesCourse.push()
        }


    } catch (err) {

    }

})

export default userRouter;