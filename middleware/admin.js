import jwt from "jsonwebtoken";
import { jwtAdminSecret } from "../config.js";

function adminMiddleware(req, res, next) {

    const authHeader = req.headers.token;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ msg: "missing or invalid auth header" });
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, jwtAdminSecret);
        req.adminId = decoded.id;
        next();

    } catch (err) {

        console.error(err);
        return res.status(401).json({ msg: "Invalid token" })
    }
}

export default adminMiddleware;