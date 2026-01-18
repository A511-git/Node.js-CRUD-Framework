import { UserRepository } from "../database/repository/index.js";
import {
    GeneratePassword,
    ValidatePassword,
    ValidateRefreshToken,
    GenerateAccessToken,
    GenerateRefreshToken
} from "../utils/index.js";
import { BaseService } from "./base-service.js"
import { NotFoundError, UnauthorizedError, DatabaseError, APIError, STATUS_CODES } from "../utils/app-errors.js";


class UserService extends BaseService {
    constructor() {
        super(new UserRepository());
    }

    async register(userInputs) {
        const password = await GeneratePassword(userInputs.password, 10);
        if (!password) throw new APIError();
        const result = await this.repository.create({
            ...userInputs,
            password
        });
        if (!result) throw new DatabaseError();
        return result;
    }

    async login({ email, password }) {
        const user = await this.repository.findUserByEmail(email, true);
        if (!user) throw new UnauthorizedError("Invalid credentials");

        const valid = await ValidatePassword(password, user.password);
        if (!valid) throw new UnauthorizedError(401,"Invalid credentials");

        if (user.status!=="ACTIVE") throw new UnauthorizedError(403,"User is not active");

        const payload = { _id: user._id, email: user.email, name: user.name, role: user.role};

        const lastLogin = new Date();
        const accessToken = GenerateAccessToken(payload);
        const refreshToken = GenerateRefreshToken(payload);

        const result = await this.repository.update(user._id, {refreshToken, lastLogin});
        if (!result) throw new NotFoundError('User not found');

        return {
            user: result,
            accessToken,
            refreshToken
        };
    }

    async updatePassword(id, { oldPassword, newPassword }) {
        const user = await this.repository.findUserById(id, true);
        if (!user) throw new NotFoundError('User not found');

        const valid = await ValidatePassword(oldPassword, user.password);
        if (!valid) throw new UnauthorizedError(401,"Invalid credentials");
        const password = await GeneratePassword(newPassword, 10);
        if (!password) throw new APIError();

        const result = await this.repository.update(id, {
            password
        });
        if (!result) throw new APIError();
        return result;
    }

    async refresh(token) {
        console.log("service : ");
        console.log(token);
        console.log(typeof token);

        const payload = ValidateRefreshToken(token);

        const user = await this.repository.findUserById(payload._id, true);
        console.log(user);

        if (!user || user.refreshToken !== token) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        return GenerateAccessToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });
    }


}

export { UserService };
