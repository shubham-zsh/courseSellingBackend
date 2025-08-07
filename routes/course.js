import { Router } from 'express';
import { courseModel, purchaseModel } from '../db.js';
import { z } from 'zod';
import userMiddlerware from '../middleware/user.js';
const courseRouter = Router();

const purchaseBody = z.object({
    courseId: z.string().length(24),
    amountPaid: z.number()
});

courseRouter.get("/all-courses", async (req, res) => {

    try {

        const courses = await courseModel.find({});
        if (courses != null) {
            return res.status(201).json({ msg: "courses fetched" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({ msg: "no courses available" });
    }
});

courseRouter.post("/purchase", userMiddlerware, async (req, res) => {

    const userId = req.userId;
    const { courseId, amountPaid } = req.body;

    try {

        const parsedBody = purchaseBody.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ msg: "Invalid input" });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: "course not found" });
        }

        if (amountPaid !== course.price) {
            return res.status(400).json({ msg: "incorrect amount" })
        }

        const alreadyPurchased = await purchaseModel.findOne({ courseId, userId });
        if (alreadyPurchased) {
            return res.status(409).json({ msg: "course already purchased" });
        }

        const purchased = await purchaseModel.create({
            courseId, userId
        });

        if (!purchased) {
            return res.status(500).json({ msg: "unable to purchase course" });
        }

        res.status(201).send({
            msg: "course purchased successfully",
            purchased, course
        })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "something went wrong" });
    }
});

courseRouter.get("/course-info/:courseId", async (req, res) => {

    try {
        const courseId = req.params.courseId;

        const courseInfo = await courseModel.findById(courseId).select("-__v");

        if (!courseInfo) {
            return res.status(404).json({ msg: "Course not found" });
        }

        res.status(200).json({
            msg: "Course preview fetched successfully",
            course,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Something went wrong while fetching course preview" });
    }
})

export default courseRouter;