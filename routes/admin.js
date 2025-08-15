import { Router } from "express";
import { adminModel, courseModel } from "../db.js";
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { adminSaltRounds, jwtAdminSecret } from "../config.js";
import adminMiddleware from '../middleware/admin.js';

const adminRouter = Router();

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

const courseBody = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
});

const updateCourseBody = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    imageUrl: z.string().optional()
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
        return res.status(201).json({ msg: "signup successful" })

    } catch (err) {
        return res.status(500).json({ msg: "Internal server error" });
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

        return res.status(200).json({
            msg: "Signin successful",
            token: token,
        });
    } catch (err) {
        return res.status(401).json({ msg: "something went wrong ", err })
    }
});

adminRouter.post("/create", adminMiddleware, async function (req, res) {

    const adminId = req.adminId;

    try {
        const parsedBody = courseBody.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(401).json("wrong course details");
        }

        const { title, description, price, imageUrl } = parsedBody.data;

        const existing = await courseModel.findOne({
            title,
            description,
            price,
            imageUrl,
            creatorId: adminId
        });
        if (existing) {
            return res.status(409).json({ msg: "Identical course already exists" });
        }

        const newCourse = await courseModel.create({
            title, description, price, imageUrl, creatorId: adminId
        });

        return res.status(200).json({
            msg: "course added successfully",
            courseId: newCourse._id
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ msg: "something went wrong" });
    }

})

adminRouter.put("/update", adminMiddleware, async (req, res) => {

    const adminId = req.adminId;

    try {
        const parsedBody = updateCourseBody.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(401).json({ msg: "invalid update information" });
        }

        const courseId = req.body.courseId;
        const updateData = parsedBody.data;

        if (!courseId) {
            return res.status(400).json({ msg: "courseId missing in request" });
        }

        const updatedCourse = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            $set: updateData
        })

        if (updatedCourse.matchedCount === 0) {
            return res.status(404).json({ msg: "Course not found or not owned by admin" });
        }

        if (updatedCourse.modifiedCount == 0) {
            return res.status(401).json({ msg: "error updating course" });
        }

        return res.status(201).json({ msg: "course updated successfully" })
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ msg: "something went wrong" })
    }
})

adminRouter.get("/courses/bulk", adminMiddleware, async (req, res) => {

    const creatorId = req.adminId;

    try {

        const courses = await courseModel.find({
            creatorId
        })

        return res.json({
            msg: "courses fecthed",
            courses
        })
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ msg: "something went wrong" })
    }
})

export default adminRouter;