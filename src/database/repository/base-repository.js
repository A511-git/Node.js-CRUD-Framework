import { MapMongoError } from "../../utils/map-mongo-error.js";

class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(userInputs) {
        try {
            return await this.model.create(userInputs);
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async update(id, userInputs) {
        try {
            return await this.model.findByIdAndUpdate(id, userInputs, { new: true, runValidators: true });
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async getById(id) {
        try {
            return await this.model.findById(id);
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async findOne(filter) {
        try {
            return await this.model.findOne(filter);
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async find(filter) {
        try {
            return await this.model.find(filter);
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async getAll() {
        try {
            return await this.model.find();
        } catch (err) {
            throw MapMongoError(err);
        }
    }

    async paginate(filter = {}, options = {}) {
        try {
            const page = Number(options.page) || 1;
            const limit = Number(options.limit) || 10;
            const skip = (page - 1) * limit;
            const sort = options.sort || { createdAt: -1 };

            const [data, total] = await Promise.all([
                this.model.find(filter).sort(sort).skip(skip).limit(limit),
                this.model.countDocuments(filter)
            ]);
            return {
                data,
                pagination: {
                    page,
                    limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
        } catch (err) {
            throw MapMongoError(err);
        }
    }


}

export { BaseRepository };
