import { Router } from 'express';
import { courseModel } from '../db.js';
import { z } from 'zod';
const courseRouter = Router();

const courseBody = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    creatorId: z.string()
})

courseRouter.post("/newcourse", async function (req, res) {

    try {
        const parsedBody = courseBody.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(401).json("wrong course details");
        }

        const { title, description, price, imageUrl, creatorId } = parsedBody.data;
        await courseModel.create({
            title, description, price, imageUrl, creatorId
        });

        return res.status(200).json({ msg: "course added successfully" })
    } catch (err) {
        console.error(err);
        return res.status(400).json({ msg: "something went wrong" })

    }

})

export default courseRouter;