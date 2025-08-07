import { Router } from 'express';
import { courseModel, purchaseModel } from '../db.js';
import { z } from 'zod';
import userMiddlerware from '../middleware/user.js';
const courseRouter = Router();

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
    const courseId = req.body.courseId;

    try {

        if(userId.price < courseId.price || userId.price > courseId.price) {
            return res.status(401).json({msg: "incorrect amount"})
        }

        const purchased = await purchaseModel.create({
            courseId, userId
        });

        if (!purchaseModel) {
            return res.status(401).json({ msg: "unable to purchase course" });
        }

        res.send({
            msg: "course purchased successfully",
            purchased
        })
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ msg: "something went wrong" });
    }
});

courseRouter.get("/course-info", async (req, res) => {
    
})

export default courseRouter;