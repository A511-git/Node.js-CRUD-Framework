import express from "express";
import { AsyncHandler } from "../utils/async-handler.js";
import { UserAuth } from "./middlewares/auth.js";
import { ApiResponse } from "../utils/api-response.js";
import { UserService } from "../services/index.js";
import { UserValidator } from "../validation/index.js";

export const user = () => {
    const router = express.Router();

    const userService = new UserService();
    const userValidator = new UserValidator();


    router.post("/register", AsyncHandler(async (req, res) => {
        const data = userValidator.register(req.body);
        const result = await userService.register(data);
        res.status(201).json(new ApiResponse(201, result, "User registered successfully"));
    }));

    router.post("/login", AsyncHandler(async (req, res) => {
        const data = userValidator.login(req.body);
        const { user, accessToken, refreshToken } = await userService.login(data);

        res.set("Authorization", `Bearer ${accessToken}`);
        res.set("Access-Control-Expose-Headers", "Authorization");

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        res.status(200).json(new ApiResponse(200, user, "Login successful"));
    }));

    router.get("/refresh", UserAuth, AsyncHandler(async (req, res) => {
        console.log(req.cookies?.refreshToken);

        const data = userValidator.refresh({ token: req.cookies?.refreshToken });

        console.log(data);

        const accessToken = await userService.refresh(data.token);

        res.set("Authorization", `Bearer ${accessToken}`);
        res.set("Access-Control-Expose-Headers", "Authorization");
        res.status(200).json({ success: true });
    }));

    router.get("/profile", UserAuth, AsyncHandler(async (req, res) => {
        const result = await userService.getById(req.user._id);
        res.status(200).json(new ApiResponse(200, result, "Profile fetched"));
    }));

    router.put("/profile", UserAuth, AsyncHandler(async (req, res) => {
        const data = userValidator.update(req.body);
        const result = await userService.update(req.user._id, data);
        res.status(200).json(new ApiResponse(200, result, "Profile updated successfully"));
    }));

    router.put("/profile/password", UserAuth, AsyncHandler(async (req, res) => {
        const data = userValidator.updatePassword(req.body);
        const result = await userService.updatePassword(req.user._id, data);
        res.status(200).json(new ApiResponse(200, result, "Password changed successfully"));
    }));

    return router;
};
