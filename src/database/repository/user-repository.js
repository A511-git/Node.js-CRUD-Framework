import { BaseRepository } from "./base-repository.js";
import { UserModel } from "../models/index.js";
import { MapMongoError } from "../../utils/map-mongo-error.js";

class UserRepository extends BaseRepository {
    constructor() {
        super(UserModel);
    }

    async findUserByEmail(email, includePrivateData = false) {
        try {
            if (includePrivateData) {
                return await UserModel
                    .findOne({ email })
                    .select("+refreshToken +password");
            }
            return await UserModel.findOne({ email });
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async findUserById(id, includePrivateData = false) {
        try {
            if (includePrivateData) {
                return await UserModel
                    .findById(id)
                    .select("+refreshToken +password");
            }
            return await UserModel.findById(id);
        } catch (err) {
            throw MapMongoError(err);
        }
    }
}

export { UserRepository };
