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



export default courseRouter;