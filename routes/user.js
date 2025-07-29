import { Router } from 'express';
import { userModel } from "../db.js";
const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
    const {email, password, firstName, lastName } = req.body;

    userModel.create({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
    });

    res.json({
        msg: "signup successful..."
    })
})

export default userRouter;