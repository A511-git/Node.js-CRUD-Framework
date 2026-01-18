class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async create(data) {
        return this.repository.create(data);
    }

    async update(id, data) {
        return this.repository.update(id, data);
    }

    async delete(id) {
        return this.repository.delete(id);
    }

    async getById(id) {
        return this.repository.getById(id);
    }

    async findOne(filter) {
        return this.repository.findOne(filter);
    }

    async find(filter) {
        return this.repository.find(filter);
    }

    async getAll() {
        return this.repository.getAll();
    }

    async paginate(filter, options) {
        return this.repository.paginate(filter, options);
    }

}

export { BaseService };