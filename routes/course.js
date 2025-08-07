import { Router } from 'express';
import { courseModel } from '../db.js';
import { z } from 'zod';
import userMiddlerware from '../middleware/user.js';
const courseRouter = Router();

courseRouter.get("/purchase", userMiddlerware, async (req, res) => {

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
})

export default courseRouter;