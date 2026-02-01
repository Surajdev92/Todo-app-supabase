# Quick Start: Viewing API Documentation

## What is OpenAPI Documentation?

OpenAPI (formerly Swagger) is a standard format for describing REST APIs. The `openapi.yaml` file in this project contains a complete description of all API endpoints, including:
- What endpoints are available
- What data to send (request format)
- What data you'll get back (response format)
- Authentication requirements

## View the Documentation (3 Easy Ways)

### Method 1: Using npm script (Easiest)

```bash
npm run docs:serve
```

This will:
1. Start a local server
2. Open your browser automatically
3. Show interactive API documentation

Press `Ctrl+C` to stop the server.

### Method 2: Generate Static HTML File

```bash
npm run docs:build
```

This creates `api-docs.html` in your project root. Just open it in any browser - no server needed!

### Method 3: Use Online Swagger Editor

1. Go to https://editor.swagger.io/
2. Click "File" → "Import file"
3. Select `openapi.yaml` from this project
4. View the interactive documentation

## What You'll See

The documentation shows:

✅ **All API Endpoints**
- Authentication: signup, login, logout
- Todos: list, create, read, update, delete

✅ **Request Examples**
- What data to send
- Required vs optional fields
- Data formats

✅ **Response Examples**
- What you'll get back
- Success responses
- Error responses

✅ **Try It Out**
- Test endpoints directly from the documentation
- See real request/response examples

## Why This Matters for Your Deliverable

The requirement "Backend API with generated OpenAPI documentation" means:

1. ✅ **Backend API exists** - Your Supabase backend provides all the endpoints
2. ✅ **OpenAPI spec exists** - The `openapi.yaml` file documents everything
3. ✅ **Can be generated/viewed** - You can view it using the methods above

This demonstrates that:
- Your API is well-documented
- Other developers can understand and use your API
- The API follows industry standards
- You can generate interactive documentation

## For Your Submission

When submitting, you can:
1. Include the `openapi.yaml` file (already in the repo)
2. Generate `api-docs.html` using `npm run docs:build` and include it
3. Or provide a link to the online Swagger editor with your spec loaded

The evaluators can then:
- View the interactive documentation
- Understand your API structure
- See that it's properly documented
