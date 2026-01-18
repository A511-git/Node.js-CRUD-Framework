import { UnauthorizedError, APIError, STATUS_CODES } from "../../utils/app-errors.js"

export const AllowRoles = (roles = []) => {
    return (req, res, next) => {
        if(! Array.isArray(roles))
            next(new APIError(STATUS_CODES.INTERNAL_ERROR,"Roles must be an array"));
        const userRole = req.user.role;
        if(!roles.includes(userRole))
            next(new UnauthorizedError());
        
        return next();            
    }
}