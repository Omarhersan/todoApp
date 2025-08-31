# External Todo API Documentation

This API provides CRUD operations for todos using Bearer token authentication for external systems.

## Base URL
All external API endpoints are under `/api/external/todos`

## Authentication
All requests require:
1. **Authorization Header**: `Authorization: Bearer <API_KEY>`
2. **Call From Header**: `x-call-from: n8n` (or your configured source)
3. **User Phone Header**: `x-user-phone: <phone_number>` (the phone number of the user whose todos you want to manage)

## Available Endpoints

### 1. Get All Todos
```
GET /api/external/todos
```

**Headers:**
```
Authorization: Bearer <N8N_API_KEY>
x-call-from: n8n
x-user-phone: 1234567890
```

**Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "title": "Sample Todo",
      "description": "Todo description",
      "is_completed": false,
      "created_at": "2025-08-30T10:00:00Z",
      "completed_at": null,
      "user_id": 123,
      "enhancement_status": "pending",
      "source": "external_api"
    }
  ]
}
```

### 2. Get Single Todo
```
GET /api/external/todos/{id}
```

**Headers:**
```
Authorization: Bearer <N8N_API_KEY>
x-call-from: n8n
x-user-phone: 1234567890
```

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "Sample Todo",
    "description": "Todo description",
    "is_completed": false,
    "created_at": "2025-08-30T10:00:00Z",
    "completed_at": null,
    "user_id": 123,
    "enhancement_status": "pending",
    "source": "external_api"
  }
}
```

### 3. Create New Todo
```
POST /api/external/todos
```

**Headers:**
```
Authorization: Bearer <N8N_API_KEY>
x-call-from: n8n
x-user-phone: 1234567890
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Todo Item",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "status": 201,
  "data": {
    "id": 2,
    "title": "New Todo Item",
    "description": "Optional description",
    "is_completed": false,
    "created_at": "2025-08-30T10:00:00Z",
    "completed_at": null,
    "user_id": 123,
    "enhancement_status": "pending",
    "source": "external_api",
    "enhanced_title": null,
    "steps": null
  }
}
```

**Note:** Tasks created via external API are automatically enhanced with AI-generated titles and steps. The enhancement happens in the background, and the task status will update from "pending" to "done" once complete.

### 4. Update Todo
```
PUT /api/external/todos/{id}
```

**Headers:**
```
Authorization: Bearer <N8N_API_KEY>
x-call-from: n8n
x-user-phone: 1234567890
Content-Type: application/json
```

**Body (partial updates supported):**
```json
{
  "title": "Updated Todo Title",
  "description": "Updated description",
  "is_completed": true
}
```

**Response:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "Updated Todo Title",
    "description": "Updated description",
    "is_completed": true,
    "created_at": "2025-08-30T10:00:00Z",
    "completed_at": "2025-08-30T10:30:00Z",
    "user_id": 123,
    "enhancement_status": "pending",
    "source": "external_api"
  }
}
```

### 5. Delete Todo
```
DELETE /api/external/todos/{id}
```

**Headers:**
```
Authorization: Bearer <N8N_API_KEY>
x-call-from: n8n
x-user-phone: 1234567890
```

**Response:**
```json
{
  "status": 200,
  "message": "Todo deleted successfully",
  "id": "1"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "x-user-phone header is required for external API calls"
}
```

**OR**

```json
{
  "error": "User not found with phone number: 1234567890"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Todo not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error message"
}
```

## Usage Examples

### cURL Examples

**Create a todo:**
```bash
curl -X POST http://localhost:3000/api/external/todos \
  -H "Authorization: Bearer $N8N_API_KEY" \
  -H "x-call-from: n8n" \
  -H "x-user-phone: 1234567890" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo", "description": "Created via API"}'
```

**Get all todos:**
```bash
curl -X GET http://localhost:3000/api/external/todos \
  -H "Authorization: Bearer $N8N_API_KEY" \
  -H "x-call-from: n8n" \
  -H "x-user-phone: 1234567890"
```

**Update a todo:**
```bash
curl -X PUT http://localhost:3000/api/external/todos/1 \
  -H "Authorization: Bearer $N8N_API_KEY" \
  -H "x-call-from: n8n" \
  -H "x-user-phone: 1234567890" \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://localhost:3000/api/external/todos/1 \
  -H "Authorization: Bearer $N8N_API_KEY" \
  -H "x-call-from: n8n" \
  -H "x-user-phone: 1234567890"
```

## Security Notes

- All requests are scoped to the user specified in the `x-user-phone` header
- The system automatically looks up the user ID based on the phone number
- Users can only access their own todos (enforced by user_id filtering)
- Phone numbers must match exactly what's stored in the users table
- Bearer token authentication prevents unauthorized access
- All external todos are marked with `source: "external_api"` for tracking

## Frontend vs External API

- **Frontend**: Uses `/api/todos` with cookie authentication - auto-enhanced with AI
- **External APIs**: Uses `/api/external/todos` with Bearer token authentication + phone number - also auto-enhanced with AI
- Both access the same database and use the same OpenAI enhancement system
- All tasks, regardless of source, get enhanced titles and actionable steps automatically

## AI Enhancement for External APIs

### Automatic Enhancement
When a task is created via the external API (e.g., WhatsApp integration), it automatically triggers AI enhancement:

1. **Task Creation**: Status starts as "pending"
2. **AI Processing**: OpenAI generates enhanced title and actionable steps
3. **Database Update**: Status changes to "done" with enhanced content
4. **Fallback**: Uses rule-based enhancement if OpenAI fails

### Enhanced Response Format
After enhancement completes, tasks will have additional fields:
```json
{
  "id": 1,
  "title": "buy groceries",
  "enhanced_title": "Purchase weekly groceries and household essentials ✨",
  "steps": [
    "Research options and compare prices",
    "Plan and prepare for: buy groceries",
    "Execute the main task: buy groceries",
    "Review and finalize: buy groceries",
    "Complete the purchase"
  ],
  "enhancement_status": "done",
  "source": "external_api"
}
```

### Enhancement Status Values
- `"pending"`: Enhancement in progress
- `"done"`: Successfully enhanced with AI
- `"failed"`: Enhancement failed (fallback used)
