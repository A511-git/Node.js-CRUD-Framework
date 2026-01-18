import { ValidationError } from "../utils/app-errors.js";
import { BaseValidator } from "./base-validator.js";
import { UserSchema } from "./schema/index.js"

class UserValidator extends BaseValidator {
    constructor() {
        super(UserSchema)
    }
    register(userInputs) {
        return this._parse(this.schema.register, userInputs);
    }

    login(userInputs) {
        return this._parse(this.schema.login, userInputs);
    }

    refresh(userInputs) {
        return this._parse(this.schema.refresh, userInputs);
    }

    updatePassword(userInputs) {
        return this._parse(this.schema.updatePassword, userInputs);
    }

    update(userInputs) {
        return this._parse(this.schema.update, userInputs);
    }
}

export { UserValidator }