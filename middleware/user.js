import jwt from "jsonwebtoken";
import { jwtUserSecret } from "../config";

function userMiddlerware(req, res, next) {

    const authHeader = req.body.token;

    if (!authHeader || !authHeader.startWith('Bearer')) {
        return res.status(401).json({ msg: "missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, jwtUserSecret);
        req.userId = decoded.id;
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(401).json({msg: "You need to log in"});
    }
}

export default userMiddlerware;