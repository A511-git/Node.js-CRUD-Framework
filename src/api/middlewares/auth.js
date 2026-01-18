import { ValidateAccessToken } from "../../utils/index.js";
import { UnauthorizedError } from "../../utils/app-errors.js"

export const UserAuth = async (req, res, next) => {

    const isAuthorized = await ValidateAccessToken(req);

    if (!isAuthorized) throw new UnauthorizedError(401,"Invalid token");
    return next();
}