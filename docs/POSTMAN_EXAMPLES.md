# Postman API Examples

## Base URL
```
http://localhost:2507/api
```

## Authentication
Most endpoints require admin token. Add to Headers:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 1. PERMISSION ENDPOINTS

### Create Permission
**POST** `/permissions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "View Users",
  "category": "User Management",
  "description": "Permission to view users list",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "View Users",
    "category": "User Management",
    "description": "Permission to view users list",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Permission created successfully"
}
```

---

### Get All Permissions
**GET** `/permissions`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "count": 23,
  "data": [
    {
      "id": 1,
      "name": "View Users",
      "category": "User Management",
      "description": "Permission to view users list",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Create Users",
      "category": "User Management",
      "description": "Permission to create new users",
      "status": "active"
    }
  ]
}
```

---

### Get Permissions Grouped by Category
**GET** `/permissions/grouped`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "User Management": [
      {
        "id": 1,
        "name": "View Users",
        "category": "User Management"
      },
      {
        "id": 2,
        "name": "Create Users",
        "category": "User Management"
      }
    ],
    "Asset Management": [
      {
        "id": 5,
        "name": "View Assets",
        "category": "Asset Management"
      }
    ]
  }
}
```

---

### Get Permissions by Category
**GET** `/permissions/category/User Management`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "View Users",
      "category": "User Management"
    },
    {
      "id": 2,
      "name": "Create Users",
      "category": "User Management"
    }
  ]
}
```

---

### Update Permission
**PUT** `/permissions/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "View All Users",
  "category": "User Management",
  "description": "Updated description",
  "status": "active"
}
```

---

### Delete Permission
**DELETE** `/permissions/:id`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 2. ROLE ENDPOINTS

### Create Role with Permissions
**POST** `/roles`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Admin",
  "status": "active",
  "description": "Full system administrator with all permissions",
  "accessLevelId": 1,
  "permissions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "status": "active",
    "description": "Full system administrator with all permissions",
    "accessLevelId": 1,
    "permissions": [
      {
        "id": 1,
        "permission": {
          "id": 1,
          "name": "View Users",
          "category": "User Management"
        }
      },
      {
        "id": 2,
        "permission": {
          "id": 2,
          "name": "Create Users",
          "category": "User Management"
        }
      }
    ],
    "accessLevel": {
      "id": 1,
      "name": "Level 1",
      "status": "active"
    }
  },
  "message": "Role created successfully"
}
```

---

### Create Role without Permissions (Minimal)
**POST** `/roles`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Viewer",
  "status": "active",
  "description": "Read-only access role"
}
```

---

### Get All Roles
**GET** `/roles`

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "status": "active",
      "description": "Full system administrator",
      "permissions": [
        {
          "id": 1,
          "permission": {
            "id": 1,
            "name": "View Users",
            "category": "User Management"
          }
        }
      ],
      "accessLevel": {
        "id": 1,
        "name": "Level 1"
      }
    }
  ]
}
```

---

### Get Role by ID
**GET** `/roles/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "status": "active",
    "description": "Full system administrator",
    "accessLevelId": 1,
    "permissions": [
      {
        "id": 1,
        "permission": {
          "id": 1,
          "name": "View Users",
          "category": "User Management",
          "description": "Permission to view users list"
        }
      }
    ],
    "accessLevel": {
      "id": 1,
      "name": "Level 1",
      "status": "active"
    },
    "employees": []
  }
}
```

---

### Update Role with Permissions
**PUT** `/roles/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON) - Update all fields including permissions:**
```json
{
  "name": "Manager",
  "status": "active",
  "description": "Manager role with limited permissions",
  "accessLevelId": 2,
  "permissions": [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21]
}
```

**Body (JSON) - Update only permissions:**
```json
{
  "permissions": [1, 2, 3, 4]
}
```

**Body (JSON) - Remove all permissions:**
```json
{
  "permissions": []
}
```

**Body (JSON) - Update without changing permissions:**
```json
{
  "name": "Senior Manager",
  "status": "active",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Manager",
    "status": "active",
    "permissions": [
      {
        "id": 1,
        "permission": {
          "id": 1,
          "name": "View Users",
          "category": "User Management"
        }
      }
    ]
  },
  "message": "Role updated successfully"
}
```

---

### Delete Role
**DELETE** `/roles/:id`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 3. ACCESS LEVEL ENDPOINTS

### Create Access Level
**POST** `/access-levels`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Level 1",
  "status": "active"
}
```

---

### Get All Access Levels
**GET** `/access-levels`

**Headers:**
```
Content-Type: application/json
```

---

### Update Access Level
**PUT** `/access-levels/:id`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (JSON):**
```json
{
  "name": "Level 2",
  "status": "active"
}
```

---

## 4. EMPLOYEE ENDPOINTS

### Create Employee with Image
**POST** `/employees`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (form-data):**
```
firstName: John
lastName: Doe
email: john.doe@example.com
jobTitle: Software Engineer
status: active
joiningDate: 2024-01-15
departmentId: 1
roleId: 1
image: [SELECT FILE]
```

**Body (JSON alternative - without image):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "jobTitle": "Software Engineer",
  "status": "active",
  "joiningDate": "2024-01-15",
  "departmentId": 1,
  "roleId": 1
}
```

---

### Update Employee with Image
**PUT** `/employees/:id`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (form-data):**
```
firstName: John
lastName: Smith
email: john.smith@example.com
jobTitle: Senior Software Engineer
status: active
departmentId: 1
roleId: 2
image: [SELECT FILE - Optional]
```

---

## 5. COMPLETE WORKFLOW EXAMPLE

### Step 1: Create Access Level
**POST** `/access-levels`
```json
{
  "name": "Level 1",
  "status": "active"
}
```
**Response:** `{ "id": 1, ... }`

---

### Step 2: Create Permissions (or use seed script)
**POST** `/permissions`
```json
{
  "name": "View Users",
  "category": "User Management",
  "description": "Permission to view users list",
  "status": "active"
}
```
**Response:** `{ "id": 1, ... }`

**POST** `/permissions`
```json
{
  "name": "Create Users",
  "category": "User Management",
  "description": "Permission to create new users",
  "status": "active"
}
```
**Response:** `{ "id": 2, ... }`

---

### Step 3: Create Role with Permissions
**POST** `/roles`
```json
{
  "name": "User Manager",
  "status": "active",
  "description": "Can manage users",
  "accessLevelId": 1,
  "permissions": [1, 2]
}
```

---

### Step 4: Create Employee with Role
**POST** `/employees`
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "jobTitle": "HR Manager",
  "status": "active",
  "joiningDate": "2024-01-15",
  "departmentId": 1,
  "roleId": 1
}
```

---

## 6. ERROR RESPONSES

### Validation Error
```json
{
  "success": false,
  "message": "Name and status are required"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Role with ID 999 not found"
}
```

### Invalid Permission IDs
```json
{
  "success": false,
  "message": "One or more permission IDs do not exist"
}
```

---

## 7. TYPICAL USE CASES

### Create Admin Role with All Permissions
```json
POST /api/roles
{
  "name": "Super Admin",
  "status": "active",
  "description": "Full system access",
  "accessLevelId": 1,
  "permissions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
}
```

### Create Manager Role with Limited Permissions
```json
POST /api/roles
{
  "name": "Manager",
  "status": "active",
  "description": "Department manager",
  "accessLevelId": 2,
  "permissions": [1, 2, 5, 6, 9, 10, 13, 14]
}
```

### Create Viewer Role (Read Only)
```json
POST /api/roles
{
  "name": "Viewer",
  "status": "active",
  "description": "Read-only access",
  "permissions": [1, 5, 9, 13, 17, 21]
}
```

---

## Notes:
1. Replace `YOUR_ADMIN_TOKEN` with actual admin JWT token
2. Replace `:id` with actual IDs in URLs
3. For file uploads, use `multipart/form-data` instead of `application/json`
4. Permission IDs should match existing permissions in database
5. Use seed script to populate default permissions: `node scripts/seedPermissions.js`

