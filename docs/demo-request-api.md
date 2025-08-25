# Demo Request API Documentation

This API allows users to submit demo requests and administrators to manage those requests.

## Public Endpoints

### Submit a Demo Request

Submit a new demo request to receive a product demonstration.

**URL**: `/api/demo-requests`

**Method**: `POST`

**Auth required**: No

**Request Body**:

```json
{
  "email": "customer@example.com",
  "phoneNumber": "+1234567890",
  "companyName": "Example Corp",
  "message": "We are interested in your IoT solutions for agriculture."
}
```

**Required fields**: `email`, `phoneNumber`, `companyName`

**Optional fields**: `message`

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "message": "Demo request submitted successfully",
  "data": {
    "id": 1,
    "email": "customer@example.com",
    "phoneNumber": "+1234567890",
    "companyName": "Example Corp",
    "message": "We are interested in your IoT solutions for agriculture.",
    "status": "pending",
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

## Admin Endpoints

### Get All Demo Requests

Retrieve all demo requests.

**URL**: `/api/admin/demo-requests`

**Method**: `GET`

**Auth required**: Yes (Admin)

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "email": "customer@example.com",
      "phoneNumber": "+1234567890",
      "companyName": "Example Corp",
      "message": "We are interested in your IoT solutions for agriculture.",
      "status": "pending",
      "createdAt": "2023-06-15T12:00:00.000Z",
      "updatedAt": "2023-06-15T12:00:00.000Z"
    }
  ]
}
```

### Get Demo Request by ID

Retrieve a specific demo request by its ID.

**URL**: `/api/admin/demo-requests/:id`

**Method**: `GET`

**Auth required**: Yes (Admin)

**URL Parameters**: `id=[integer]` where `id` is the ID of the demo request

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "customer@example.com",
    "phoneNumber": "+1234567890",
    "companyName": "Example Corp",
    "message": "We are interested in your IoT solutions for agriculture.",
    "status": "pending",
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:00:00.000Z"
  }
}
```

### Update Demo Request Status

Update the status of a demo request.

**URL**: `/api/admin/demo-requests/:id`

**Method**: `PUT`

**Auth required**: Yes (Admin)

**URL Parameters**: `id=[integer]` where `id` is the ID of the demo request

**Request Body**:

```json
{
  "status": "contacted"
}
```

**Allowed status values**: `pending`, `contacted`, `completed`

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "customer@example.com",
    "phoneNumber": "+1234567890",
    "companyName": "Example Corp",
    "message": "We are interested in your IoT solutions for agriculture.",
    "status": "contacted",
    "createdAt": "2023-06-15T12:00:00.000Z",
    "updatedAt": "2023-06-15T12:30:00.000Z"
  }
}
```

### Delete Demo Request

Delete a demo request.

**URL**: `/api/admin/demo-requests/:id`

**Method**: `DELETE`

**Auth required**: Yes (Admin)

**URL Parameters**: `id=[integer]` where `id` is the ID of the demo request

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "message": "Demo request deleted successfully"
}
```

## Email Notification

When a demo request is submitted, an email notification is automatically sent to the configured recipient email address (default: info@gstsa1.org). The email includes:

- Company name
- Email address
- Phone number
- Optional message
- Submission timestamp

The email is formatted with a professional HTML template for better readability.
