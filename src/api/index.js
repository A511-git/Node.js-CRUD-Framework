import { Router } from "express";
import {user} from "./user.js"
import {admin} from "./admin.js"

export const api = () => {
    const router = Router();

    router.get("/ping", (req, res) => {
        res.send("pong");
    })
    router.use("/user", user());
    router.use("/admin", admin());


    return router;
};
