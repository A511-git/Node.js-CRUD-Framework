import express from "express";
import { AsyncHandler } from "../utils/async-handler.js";
import { UserAuth, AllowRoles } from "./middlewares/index.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserService } from "../services/index.js";
import { UserValidator } from "../validation/index.js";

export const admin = () => {
    const router = express.Router();

    const userService = new UserService();
    const userValidator = new UserValidator();

    router.get("/users", UserAuth, AllowRoles(["ADMIN"]), AsyncHandler(async (req, res) => {
        const {
            page,
            limit,
            role="USER",
            status
        } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;

        const result = await userService.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
        });
        res.status(200).json(new ApiResponse(200, result, "Profile fetched"));
    }));

    router.put("/users/:id", UserAuth, AllowRoles(["ADMIN"]), AsyncHandler(async (req, res) => {
        const data = userValidator.update({ ...req.body, id: req.params.id });
        const result = await userService.update(req.params.id, data);
        res.status(200).json(new ApiResponse(200, result, "Profile updated"));
    }));

    return router;
};
