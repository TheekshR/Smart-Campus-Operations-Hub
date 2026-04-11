# Smart Campus Operations Hub - API & System Documentation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot (Java), Spring Security, OAuth2/OIDC |
| Database | MongoDB |
| Frontend | React (Vite), ShadCN UI, Axios |
| Auth | Google OAuth2 (OIDC) |

---

## Data Models

### Resource

| Field | Type | Validation |
|-------|------|-----------|
| `id` | String | Auto-generated (MongoDB `@Id`) |
| `name` | String | `@NotBlank` |
| `type` | `ResourceType` enum | `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT` |
| `capacity` | int | `@Min(1)` |
| `location` | String | `@NotBlank` |
| `status` | `ResourceStatus` enum | `ACTIVE`, `OUT_OF_SERVICE` |
| `availabilityStart` | String | Optional (time format) |
| `availabilityEnd` | String | Optional (time format) |
| `imageBase64` | String | Optional (Base64-encoded image) |
| `imageType` | String | Optional (MIME type) |

### Booking

| Field | Type |
|-------|------|
| `id` | String |
| `resourceId` | String |
| `userId` | String |
| `date` | String |
| `startTime` | String |
| `endTime` | String |
| `purpose` | String |
| `attendees` | int |
| `status` | String (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`) |

### Issue

| Field | Type |
|-------|------|
| `id` | String |
| `resourceId` | String |
| `userId` | String |
| `description` | String |
| `priority` | String (`LOW`, `MEDIUM`, `HIGH`) |
| `status` | String (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`) |
| `technicianId` | String |
| `resolutionNote` | String |
| `images` | List (Base64-encoded) |

### User

| Field | Type |
|-------|------|
| `id` | String |
| `email` | String |
| `name` | String |
| `role` | `UserRole` enum (`USER`, `ADMIN`, `TECHNICIAN`) |

### Notification

| Field | Type |
|-------|------|
| `id` | String |
| `recipientEmail` | String |
| `message` | String |
| `read` | boolean |

---

## API Endpoints

### 1. Resource Controller

**Base URL:** `/api/resources`

| Method | Endpoint | Description | Auth | Content-Type |
|--------|----------|-------------|------|-------------|
| `POST` | `/api/resources` | Create a new resource | Any | `multipart/form-data` |
| `GET` | `/api/resources` | Get all resources (with optional filters) | Any | - |
| `GET` | `/api/resources/{id}` | Get resource by ID | Any | - |
| `PUT` | `/api/resources/{id}` | Update a resource | Any | `multipart/form-data` |
| `DELETE` | `/api/resources/{id}` | Delete a resource | Any | - |

#### Create Resource - `POST /api/resources`

**Form Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `name` | String | Yes |
| `type` | String (`LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT`) | Yes |
| `capacity` | int | Yes |
| `location` | String | Yes |
| `status` | String (`ACTIVE`, `OUT_OF_SERVICE`) | Yes |
| `availabilityStart` | String | No |
| `availabilityEnd` | String | No |
| `image` | MultipartFile | No |

**Response:** Created `Resource` object (JSON)

#### Get All Resources (Filtered) - `GET /api/resources`

**Query Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | String | Filter by resource type |
| `location` | String | Filter by location (case-insensitive) |
| `status` | String | Filter by status |
| `minCapacity` | Integer | Filter by minimum capacity |

**Response:** Array of `Resource` objects

#### Update Resource - `PUT /api/resources/{id}`

Same form parameters as Create. Returns updated `Resource` object.

#### Delete Resource - `DELETE /api/resources/{id}`

**Response:** `200 OK` (no body)

---

### 2. Booking Controller

**Base URL:** `/api/bookings`

| Method | Endpoint | Description | Auth Role |
|--------|----------|-------------|-----------|
| `POST` | `/api/bookings` | Create a new booking | USER, ADMIN |
| `GET` | `/api/bookings` | Get all bookings | ADMIN |
| `GET` | `/api/bookings/{id}` | Get booking by ID | USER, ADMIN |
| `GET` | `/api/bookings/user/{userId}` | Get bookings by user | USER, ADMIN |
| `GET` | `/api/bookings/status/{status}` | Get bookings by status | ADMIN |
| `GET` | `/api/bookings/resource/{resourceId}` | Get bookings by resource | ADMIN |
| `GET` | `/api/bookings/date/{date}` | Get bookings by date | ADMIN |
| `GET` | `/api/bookings/suggestions` | Get suggested time slot | USER, ADMIN |
| `PUT` | `/api/bookings/{id}/approve` | Approve a booking | ADMIN |
| `PUT` | `/api/bookings/{id}/reject` | Reject a booking | ADMIN |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking | USER, ADMIN |
| `DELETE` | `/api/bookings/{id}` | Delete a booking | ADMIN |

#### Create Booking - `POST /api/bookings`

**Request Body (JSON):**

```json
{
  "resourceId": "string",
  "userId": "string",
  "date": "2025-01-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "purpose": "Lab session",
  "attendees": 30
}
```

#### Get Booking Suggestions - `GET /api/bookings/suggestions`

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `resourceId` | String | Yes |
| `date` | String | Yes |
| `startTime` | String | Yes |
| `endTime` | String | Yes |

**Response:** `BookingSuggestion` object with `message`, `suggestedStartTime`, `suggestedEndTime`

#### Approve Booking - `PUT /api/bookings/{id}/approve?admin={adminId}`

#### Reject Booking - `PUT /api/bookings/{id}/reject?reason={reason}&admin={adminId}`

#### Cancel Booking - `PUT /api/bookings/{id}/cancel?reason={reason}&admin={userId}`

---

### 3. Issue Controller

**Base URL:** `/api/issues`

| Method | Endpoint | Description | Auth Role |
|--------|----------|-------------|-----------|
| `POST` | `/api/issues` | Create a new issue | USER, ADMIN |
| `GET` | `/api/issues` | Get all issues | ADMIN |
| `GET` | `/api/issues/{id}` | Get issue by ID | USER, ADMIN, TECHNICIAN |
| `GET` | `/api/issues/user/{userId}` | Get issues by user | USER, ADMIN |
| `GET` | `/api/issues/resource/{resourceId}` | Get issues by resource | ADMIN, TECHNICIAN |
| `GET` | `/api/issues/status/{status}` | Get issues by status | ADMIN, TECHNICIAN |
| `PUT` | `/api/issues/{id}/assign` | Assign technician | ADMIN |
| `PUT` | `/api/issues/{id}/start` | Start progress | TECHNICIAN |
| `PUT` | `/api/issues/{id}/resolve` | Resolve issue | TECHNICIAN |
| `DELETE` | `/api/issues/{id}` | Delete issue | ADMIN |

#### Create Issue - `POST /api/issues`

**Content-Type:** `multipart/form-data`

| Parameter | Type | Required |
|-----------|------|----------|
| `resourceId` | String | Yes |
| `userId` | String | Yes |
| `description` | String | Yes |
| `priority` | String (`LOW`, `MEDIUM`, `HIGH`) | Yes |
| `images` | List\<MultipartFile\> | No |

#### Assign Technician - `PUT /api/issues/{id}/assign?technicianId={id}&admin={adminId}`

#### Start Progress - `PUT /api/issues/{id}/start?technicianId={id}`

#### Resolve Issue - `PUT /api/issues/{id}/resolve?technicianId={id}&resolutionNote={note}`

---

### 4. Issue Comment Controller

**Base URL:** `/api/issues`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/issues/{issueId}/comments` | Get comments for an issue | Authenticated |
| `POST` | `/api/issues/{issueId}/comments` | Add a comment | Authenticated |
| `PUT` | `/api/issues/comments/{commentId}` | Update a comment | Authenticated |
| `DELETE` | `/api/issues/comments/{commentId}` | Delete a comment | Authenticated |

---

### 5. User Controller

**Base URL:** `/api/users`

| Method | Endpoint | Description | Auth Role |
|--------|----------|-------------|-----------|
| `GET` | `/api/users/me` | Get current authenticated user | Any authenticated |
| `PUT` | `/api/users/me` | Update own profile | USER, ADMIN, TECHNICIAN |
| `GET` | `/api/users/me/notification-settings` | Get notification settings | Authenticated |
| `PUT` | `/api/users/me/notification-settings` | Update notification settings | Authenticated |
| `GET` | `/api/users` | Get all users | ADMIN |
| `GET` | `/api/users/{id}` | Get user by ID | ADMIN |
| `GET` | `/api/users/role/{role}` | Get users by role | ADMIN |
| `PUT` | `/api/users/{id}/role?role={role}` | Update user role | ADMIN |
| `DELETE` | `/api/users/{id}` | Delete user | ADMIN |

---

### 6. Notification Controller

**Base URL:** `/api/notifications`

| Method | Endpoint | Description | Auth Role |
|--------|----------|-------------|-----------|
| `POST` | `/api/notifications` | Create manual notification | ADMIN |
| `GET` | `/api/notifications/me` | Get my notifications | Authenticated |
| `GET` | `/api/notifications/me/unread` | Get my unread notifications | Authenticated |
| `GET` | `/api/notifications/{id}` | Get notification by ID | Authenticated |
| `PUT` | `/api/notifications/{id}/read` | Mark as read | Authenticated |
| `PUT` | `/api/notifications/me/read-all` | Mark all as read | Authenticated |
| `DELETE` | `/api/notifications/{id}` | Delete notification | Authenticated |

---

### 7. Chatbot Controller

**Base URL:** `/api/chatbot`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/chatbot/ask` | Ask the AI chatbot | Any |

**Request Body:**

```json
{
  "message": "What labs are available?",
  "conversationId": "default",
  "userId": "user123"
}
```

**Response:**

```json
{
  "reply": "Here are the available labs..."
}
```

---

## Resource CRUD Operations - Backend Flow

### Create Resource

```
Frontend (ManageResourcesPage) → POST /api/resources (multipart/form-data)
  → ResourceController.create()
    → ResourceService.createResourceWithImage()
      - Builds Resource object from params
      - Converts uploaded image to Base64
      - Sets ResourceType enum and ResourceStatus enum
      → ResourceRepository.save()
        → MongoDB "resources" collection
```

### Read Resources

```
Frontend (ViewResourcesPage / ManageResourcesPage) → GET /api/resources?type=&status=&minCapacity=
  → ResourceController.getAll()
    → ResourceService.getFilteredResources()
      - Parses filter params into enums
      - Selects appropriate repository query method based on filter combination
      - Applies additional minCapacity stream filter if needed
      → ResourceRepository.findBy*() methods
```

### Update Resource

```
Frontend (ManageResourcesPage - Edit dialog) → PUT /api/resources/{id} (multipart/form-data)
  → ResourceController.update()
    → ResourceService.updateResourceWithImage()
      - Finds existing resource by ID
      - Updates all fields
      - Re-encodes image if new one uploaded
      → ResourceRepository.save()
```

### Delete Resource

```
Frontend (ManageResourcesPage - Delete button) → DELETE /api/resources/{id}
  → ResourceController.delete()
    → ResourceService.deleteResource()
      → ResourceRepository.deleteById()
```

---

## Resource Allocation & Freeing (via Bookings)

Resources are **allocated** and **freed** through the Booking system:

### Allocate a Resource (Book)

```
User → BookResourcePage → POST /api/bookings
  - User selects an ACTIVE resource, date, time slot, purpose, attendees
  - Booking created with status = PENDING
  - Admin reviews at BookingRequestsPage
  - Admin approves → PUT /api/bookings/{id}/approve → status = APPROVED
  - Resource is now allocated for that time slot
```

### Free a Resource (Cancel/Reject)

```
Option 1: User cancels → PUT /api/bookings/{id}/cancel → status = CANCELLED
Option 2: Admin rejects → PUT /api/bookings/{id}/reject → status = REJECTED
  - Time slot becomes available again
  - Other users can now book that slot
```

### Smart Suggestions

When a user tries to book a slot that conflicts, the system suggests alternative times:

```
GET /api/bookings/suggestions?resourceId=X&date=Y&startTime=Z&endTime=W
  → Returns: { message, suggestedStartTime, suggestedEndTime }
```

---

## Frontend Pages & Routes

### User Pages (`/user/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/user/dashboard` | UserDashboard | Various summary APIs |
| `/user/resources` | ViewResourcesPage | `GET /api/resources` (with filters) |
| `/user/book-resource` | BookResourcePage | `GET /api/resources`, `POST /api/bookings`, `GET /api/bookings/suggestions` |
| `/user/my-bookings` | MyBookingsPage | `GET /api/bookings/user/{userId}`, `PUT /api/bookings/{id}/cancel` |
| `/user/report-incident` | ReportIncidentPage | `POST /api/issues` |
| `/user/my-tickets` | MyTicketsPage | `GET /api/issues/user/{userId}` |
| `/user/notifications` | UserNotificationsPage | `GET /api/notifications/me` |

### Admin Pages (`/admin/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/admin/dashboard` | AdminDashboard | Various summary APIs |
| `/admin/resources` | ManageResourcesPage | Full CRUD: `GET/POST/PUT/DELETE /api/resources` |
| `/admin/manage-users` | ManageUsers | `GET /api/users`, `PUT /api/users/{id}/role`, `DELETE /api/users/{id}` |
| `/admin/booking-requests` | BookingRequestsPage | `GET /api/bookings/status/PENDING`, `PUT .../approve`, `PUT .../reject` |
| `/admin/all-bookings` | AllBookingsPage | `GET /api/bookings` |
| `/admin/all-issues` | AllIssuesPage | `GET /api/issues` |
| `/admin/assign-technician` | AssignTechnicianPage | `PUT /api/issues/{id}/assign` |
| `/admin/notifications` | AdminNotificationsPage | `GET /api/notifications/me`, `POST /api/notifications` |

### Technician Pages (`/technician/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/technician/dashboard` | TechnicianDashboard | Various summary APIs |
| `/technician/assigned-tickets` | AssignedTicketsPage | `GET /api/issues/status/ASSIGNED` |
| `/technician/in-progress-tickets` | InProgressTicketsPage | `GET /api/issues/status/IN_PROGRESS`, `PUT .../start` |
| `/technician/resolved-tickets` | ResolvedTicketsPage | `GET /api/issues/status/RESOLVED` |
| `/technician/notifications` | TechnicianNotificationsPage | `GET /api/notifications/me` |

---

## Repository Query Methods (ResourceRepository)

| Method | Parameters |
|--------|-----------|
| `findByType` | ResourceType |
| `findByLocationIgnoreCase` | String |
| `findByStatus` | ResourceStatus |
| `findByCapacityGreaterThanEqual` | int |
| `findByTypeAndLocationIgnoreCase` | ResourceType, String |
| `findByTypeAndStatus` | ResourceType, ResourceStatus |
| `findByLocationIgnoreCaseAndStatus` | String, ResourceStatus |
| `findByTypeAndLocationIgnoreCaseAndStatus` | ResourceType, String, ResourceStatus |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)            │
│                                                      │
│  User Pages    Admin Pages    Technician Pages       │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐      │
│  │View Res. │  │Manage Res.│  │Assigned     │      │
│  │Book Res. │  │Manage User│  │In-Progress  │      │
│  │My Booking│  │Bookings   │  │Resolved     │      │
│  │Report    │  │Issues     │  │Notifications│      │
│  │My Tickets│  │Assign Tech│  └─────────────┘      │
│  └──────────┘  └───────────┘                        │
│                      │ Axios (api.js)                │
└──────────────────────┼──────────────────────────────┘
                       │ HTTP REST
┌──────────────────────┼──────────────────────────────┐
│                 BACKEND (Spring Boot)                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              REST Controllers                 │   │
│  │  Resource │ Booking │ Issue │ User │ Notif.  │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │              Service Layer                    │   │
│  │  ResourceService │ BookingService │ IssueServ│   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │          MongoDB Repositories                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Security: Spring Security + OAuth2/OIDC (Google)   │
└──────────────────────┼──────────────────────────────┘
                       │
               ┌───────┴───────┐
               │   MongoDB     │
               │  Collections: │
               │  - resources  │
               │  - bookings   │
               │  - issues     │
               │  - users      │
               │  - notifications│
               └───────────────┘
```
