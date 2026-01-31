# Class-Based CRUD Framework (Node.js + Express + MongoDB)

A class-based CRUD framework that eliminates repetitive boilerplate by using a layered architecture with three reusable base classes:

- **BaseRepository** → database operations + MongoDB error mapping  
- **BaseService** → business logic orchestration + CRUD delegation  
- **BaseValidator** → Zod validation layer + uniform validation errors  

This framework enforces strict separation of concerns:

```
API Layer (Routes) → Service Layer → Repository Layer → Database
                  ↓
             Validation Layer
```

---

## 🚨 MUST READ — Project Specifications & Whiteboard Flow Diagram

> **This section explains the full backend architecture, request lifecycle, layer responsibilities, and error flow used in this project.**  
> **Recommended before reviewing the codebase.**

[![Specifications & Diagrams](https://whimsical.com/architecture-overview-and-specification-VqabDux9BSabmsDbuEs2xC)

---


## ✨ Features

- **Zero CRUD boilerplate** (create/update/delete/get/find/paginate ready)
- **Layered architecture** with clean boundaries
- **Zod-powered validation** (runtime type validation, strip unknown fields)
- **Centralized error handling** with an application error hierarchy
- **MongoDB error mapping** via `MapMongoError()`
- **Pagination** with consistent metadata
- **Authentication & Authorization** (JWT, refresh tokens, roles middleware)
- **Maintainable & scalable**: add new entities in minutes

---

## Project Structure (Recommended)

```
src/
  api/
    user.js
    product.js
  services/
    base-service.js
    user-service.js
    product-service.js
  database/
    models/
      User.js
      Product.js
    repository/
      base-repository.js
      user-repository.js
      product-repository.js
  validation/
    base-validator.js
    user-validator.js
    product-validator.js
    schema/
      user-schema.js
      product-schema.js
  utils/
    async-handler.js
    api-response.js
    error-handler.js
    map-mongo-error.js
    errors/
      app-error.js
      validation-error.js
      database-error.js
      ...
```

---

## Core Architecture

### 1) BaseRepository  
**File:** `src/database/repository/base-repository.js`  
Handles all database operations and maps MongoDB/Mongoose errors into application errors.

#### Core Methods
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `getById(id)`
- `findOne(filter)`
- `find(filter)`
- `getAll()`
- `paginate(filter, options)`

#### Key Features
- **Automatic Error Mapping:** all DB errors are caught and converted using `MapMongoError()`
- **Consistent API:** same CRUD methods for all entities
- **Pagination:** metadata includes `page`, `limit`, `totalPages`, `hasNext`, `hasPrev`

##### Example Extension
```js
class UserRepository extends BaseRepository {
  constructor() {
    super(UserModel);
  }

  async findUserByEmail(email, includePrivateData = false) {
    // custom user-specific query logic
  }
}
```

---

### 2) BaseService  
**File:** `src/services/base-service.js`  
Delegates CRUD operations to repository and acts as business logic orchestration layer.

#### Core Methods
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `getById(id)`
- `findOne(filter)`
- `find(filter)`
- `getAll()`
- `paginate(filter, options)`

#### Key Features
- **Repository injection** in constructor
- **Extensible**: add business methods while keeping base CRUD
- **Clean delegation**: no repeated boilerplate

##### Example Extension
```js
class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
  }

  async register(userInputs) {
    const password = await GeneratePassword(userInputs.password, 10);
    return this.repository.create({ ...userInputs, password });
  }

  async login({ email, password }) {
    const user = await this.repository.findUserByEmail(email, true);
    // token logic ...
  }
}
```

---

### 3) BaseValidator  
**File:** `src/validation/base-validator.js`  
Validates user inputs using Zod schemas and throws uniform `ValidationError` with field-level details.

#### Core Methods
- `create(data)`
- `update(data)`
- `delete(data)`
- `getById(data)`
- `getAll(data)`
- `getByProp(data)`

#### Key Features
- **Schema-based validation** via Zod
- **Automatic error conversion**: Zod → `ValidationError`
- **Strip unknown fields**
- **Central validation definitions** (reuse across routes/services)

##### Example Extension
```js
class UserValidator extends BaseValidator {
  constructor() {
    super(UserSchema);
  }

  register(userInputs) {
    return this._parse(this.schema.register, userInputs);
  }

  login(userInputs) {
    return this._parse(this.schema.login, userInputs);
  }
}
```

##### Schema Example
**File:** `src/validation/schema/user-schema.js`
```js
export const UserSchema = {
  register: z.object({
    fullName: BaseSchema.fullName,
    email: BaseSchema.email,
    password: BaseSchema.password,
  }),

  update: z.object({
    email: BaseSchema.email.optional(),
    fullName: BaseSchema.fullName.optional(),
  }).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field must be provided" }
  ),
};
```

---

## Complete Request Flow (Example: Register User)

### 1) Request arrives
`POST /api/v1/user/register`

```js
router.post("/register", AsyncHandler(async (req, res) => {
  const data = userValidator.register(req.body);       // ✅ Validation
  const result = await userService.register(data);     // ✅ Service
  res.status(201).json(new ApiResponse(201, result, "User registered"));
}));
```

### 2) Validation Layer
- Validates against schema (`UserSchema.register`)
- Strips unknown fields
- Throws `ValidationError` on failure

### 3) Service Layer
- Applies business logic (e.g., password hashing)
- Delegates persistence to repository

### 4) Repository Layer
- Executes Mongoose create/update/find
- Converts MongoDB/Mongoose errors into app errors using `MapMongoError()`

### 5) Error Handling
All errors bubble up to `ErrorHandler` via `AsyncHandler`.

```js
const ErrorHandler = async (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { name: err.name, message: err.description },
    });
  }
  // unknown errors → 500
};
```

---

## Error Handling System

### Error Hierarchy
```
AppError (base)
├── APIError (500)
├── BadRequestError (400)
├── ValidationError (400)
├── DatabaseError (400/500)
├── UnauthorizedError (403)
└── NotFoundError (404)
```

### MongoDB Error Mapping (`MapMongoError()`)
| MongoDB / Mongoose Error | App Error | Description |
|---|---|---|
| Code `11000` | `DatabaseError (DUPLICATE_KEY)` | Unique constraint violation |
| `CastError` | `DatabaseError (INVALID_ID)` | Invalid ObjectId |
| `ValidationError` | `DatabaseError (DB_VALIDATION_ERROR)` | Mongoose schema validation failed |
| `WriteConflict` | `DatabaseError (WRITE_CONFLICT)` | Concurrent write conflict |
| `NetworkError` | `DatabaseError (DATABASE_UNAVAILABLE)` | Connection issues |

---

## Adding a New Entity (Example: Product)

### Step 1 — Define Model
**File:** `src/database/models/Product.js`
```js
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
});

export const ProductModel = mongoose.model("product", ProductSchema);
```

### Step 2 — Create Repository
**File:** `src/database/repository/product-repository.js`
```js
class ProductRepository extends BaseRepository {
  constructor() {
    super(ProductModel);
  }

  async findByPriceRange(min, max) {
    return this.find({ price: { $gte: min, $lte: max } });
  }
}
```

### Step 3 — Create Service
**File:** `src/services/product-service.js`
```js
class ProductService extends BaseService {
  constructor() {
    super(new ProductRepository());
  }

  async adjustStock(id, quantity) {
    const product = await this.getById(id);
    return this.update(id, { stock: product.stock + quantity });
  }
}
```

### Step 4 — Create Validation Schema
**File:** `src/validation/schema/product-schema.js`
```js
export const ProductSchema = {
  create: z.object({
    name: z.string().min(3),
    price: z.number().positive(),
    stock: z.number().int().min(0).optional(),
  }),

  update: z.object({
    name: z.string().min(3).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
  }).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field required" }
  ),
};
```

### Step 5 — Create Validator
**File:** `src/validation/product-validator.js`
```js
class ProductValidator extends BaseValidator {
  constructor() {
    super(ProductSchema);
  }
}
```

### Step 6 — Create API Routes
**File:** `src/api/product.js`
```js
export const product = () => {
  const router = express.Router();
  const productService = new ProductService();
  const productValidator = new ProductValidator();

  router.post("/", AsyncHandler(async (req, res) => {
    const data = productValidator.create(req.body);
    const result = await productService.create(data);
    res.status(201).json(new ApiResponse(201, result, "Product created"));
  }));

  router.get("/:id", AsyncHandler(async (req, res) => {
    const result = await productService.getById(req.params.id);
    res.status(200).json(new ApiResponse(200, result, "Product fetched"));
  }));

  router.put("/:id", AsyncHandler(async (req, res) => {
    const data = productValidator.update(req.body);
    const result = await productService.update(req.params.id, data);
    res.status(200).json(new ApiResponse(200, result, "Product updated"));
  }));

  router.delete("/:id", AsyncHandler(async (req, res) => {
    await productService.delete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Product deleted"));
  }));

  return router;
};
```

✅ Done — you now have full CRUD + validation + error handling for Product.

---

## Additional Built-In Features

### 1) Authentication & Authorization
- JWT access tokens for API requests
- Refresh tokens stored in DB + HTTP-only cookies
- `UserAuth` middleware verifies token
- `AllowRoles` middleware restricts routes by role

```js
router.get("/admin-only",
  UserAuth,
  AllowRoles(["ADMIN"]),
  AsyncHandler(async (req, res) => {
    // handler
  })
);
```

### 2) Pagination
Built into `BaseRepository.paginate()`:

```js
const result = await userService.paginate(
  { role: "USER" },
  { page: 2, limit: 10 }
);
```

Response shape:
```js
{
  data: [...],
  pagination: {
    page: 2,
    limit: 10,
    totalItems: 45,
    totalPages: 5,
    hasNext: true,
    hasPrev: true
  }
}
```

### 3) Response Formatting
Uniform responses using `ApiResponse`:

```js
new ApiResponse(statusCode, data, message)
```

Success:
```js
{
  statusCode: 200,
  data: { ... },
  message: "Success",
  success: true
}
```

Error:
```js
{
  success: false,
  error: {
    name: "VALIDATION_ERROR",
    message: "Invalid data",
    stack: { email: ["Invalid email"] }
  }
}
```

---

## Benefits

- **No boilerplate:** focus only on entity-specific logic
- **Consistent API + errors**
- **Strong runtime validation**
- **Easy to test** (layer-by-layer)
- **Scalable & maintainable** (base changes affect all entities)

---

## Summary Workflow

For any new feature / entity:

1. **Define data** → Mongoose Model  
2. **Define DB logic** → Repository (`extends BaseRepository`)  
3. **Define business rules** → Service (`extends BaseService`)  
4. **Define input rules** → Schema + Validator (`extends BaseValidator`)  
5. **Define endpoints** → Router using Service + Validator  

The base classes handle repetitive CRUD patterns — you focus on what makes your entity unique.

---
