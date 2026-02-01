# Backend API with Generated OpenAPI Documentation

## What This Deliverable Means

The requirement "Backend API with generated OpenAPI documentation" means:

1. **Backend API**: Your Supabase backend provides REST API endpoints for:
   - User authentication (signup, login, logout)
   - Todo CRUD operations (create, read, update, delete)

2. **OpenAPI Documentation**: A standardized specification file (`openapi.yaml`) that describes:
   - All available API endpoints
   - Request/response formats
   - Authentication requirements
   - Data models and schemas

3. **Generated**: The documentation can be:
   - **Viewed** in interactive documentation tools (Swagger UI, Redoc)
   - **Imported** into API testing tools (Postman, Insomnia)
   - **Used** by developers to understand and integrate with your API

## What We Have

✅ **OpenAPI Specification File**: `openapi.yaml`
- Complete API documentation in OpenAPI 3.0 format
- Documents all authentication and todo endpoints
- Includes request/response schemas and examples

## How to View/Generate the Documentation

### Option 1: Using Swagger UI (Recommended)

1. **Install Swagger UI globally** (one-time setup):
   ```bash
   npm install -g swagger-ui-serve
   ```

2. **Serve the documentation**:
   ```bash
   swagger-ui-serve openapi.yaml
   ```

3. **Or use npx** (no installation needed):
   ```bash
   npx swagger-ui-serve openapi.yaml
   ```

4. Open your browser to the URL shown (usually `http://localhost:3000`)

### Option 2: Using Redoc

1. **Install Redoc CLI**:
   ```bash
   npm install -g redoc-cli
   ```

2. **Generate and serve documentation**:
   ```bash
   redoc-cli serve openapi.yaml
   ```

3. **Or generate a static HTML file**:
   ```bash
   redoc-cli build openapi.yaml -o api-docs.html
   ```
   Then open `api-docs.html` in your browser.

### Option 3: Using Online Tools

1. **Swagger Editor** (Online):
   - Go to https://editor.swagger.io/
   - Click "File" → "Import file"
   - Upload `openapi.yaml`
   - View interactive documentation

2. **Postman**:
   - Open Postman
   - Click "Import"
   - Select "File" and choose `openapi.yaml`
   - All endpoints will be imported as a collection

### Option 4: Add to package.json Scripts

We can add scripts to easily view the documentation. See the setup below.

## API Endpoints Summary

### Authentication Endpoints
- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token` - Login and get access token
- `POST /auth/v1/logout` - Logout

### Todo Endpoints
- `GET /rest/v1/todos` - List all todos
- `POST /rest/v1/todos` - Create todo
- `GET /rest/v1/todos/{id}` - Get specific todo
- `PATCH /rest/v1/todos/{id}` - Update todo
- `DELETE /rest/v1/todos/{id}` - Delete todo

All endpoints are documented with:
- Request parameters
- Request body schemas
- Response schemas
- Error responses
- Authentication requirements

## Why This Matters

OpenAPI documentation allows:
- **Frontend developers** to understand how to call the API
- **API testing tools** to automatically generate test cases
- **Code generators** to create client SDKs
- **Documentation tools** to create beautiful, interactive docs
- **Team collaboration** with a single source of truth for the API
