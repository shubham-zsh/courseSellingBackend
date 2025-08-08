import { Router } from 'express';
import { userModel, purchaseModel, courseModel } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { userSaltRounds, jwtUserSecret } from '../config.js'
import z from "zod";
import { userMiddleware } from "../middleware/user.js"


const userRouter = Router();

const signupBody = z.object({
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().min(3),
    lastName: z.string().min(3)
});

const signinBody = z.object({
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

    const parsedBody = signinBody.safeParse(req.body);

    if (!parsedBody) {
        return res.status(400).json({ msg: "invalid input" })
    }

    const { email, password } = parsedBody.data;

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

userRouter.get("/purchased", userMiddleware, async function (req, res) {

    const userId = req.userId;

    try {

        const purchases = await purchaseModel.find({ userId });

        if (purchases.length == 0) {
            return res.status(404).json({ msg: "No courses available" });
        };

        let purchasedCourseIds = [];

        for (var i = 0; i < purchases.length; i++) {
            purchasedCourseIds.push(purchases[i].courseId)
        }

        const coursesData = await courseModel.find({
            _id: { $in: purchasedCourseIds }
        }).select("-__v");

        res.status(200).json({ courses: coursesData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }

})

export default userRouter;