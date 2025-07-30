import { Router } from 'express';
import { userModel } from "../db.js";
const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    const { email, password, firstName, lastName } = req.body;

    try {
        const existingUSer = await userModel.findOne({ email });
        if (existingUSer) {
            return res.status(400).json({ msg: "User already exists..." })
        }
        userModel.create({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        });
        res.json({
            msg: "signup successful..."
        })
    } catch(err) {
        console.err()
    }
});

export default userRouter;