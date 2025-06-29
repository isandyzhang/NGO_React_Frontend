# API 參考文檔

本文檔說明前端 React 應用程式需要的 C# 後端 API 端點。

## 基礎設定

- **基礎 URL**: `https://localhost:7001/api`
- **認證方式**: Bearer Token (JWT)
- **內容類型**: `application/json`

## 認證 API (`/auth`)

### POST `/auth/login`
用戶登入
```json
// Request
{
  "username": "string",
  "password": "string"
}

// Response
{
  "token": "string",
  "refreshToken": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "admin|manager|staff",
    "avatar": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  },
  "expiresIn": 3600
}
```

### POST `/auth/logout`
用戶登出
```json
// Response
{
  "message": "Logout successful"
}
```

### POST `/auth/refresh`
刷新 Token
```json
// Request
{
  "refreshToken": "string"
}

// Response (同登入響應)
```

### GET `/auth/me`
獲取當前用戶資料
```json
// Response
{
  "id": 1,
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "admin|manager|staff",
  "avatar": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-01T00:00:00Z"
}
```

## 個案管理 API (`/cases`)

### GET `/cases`
獲取個案列表
```json
// Query Parameters
{
  "searchType": "string",
  "searchContent": "string",
  "status": "active|completed",
  "page": 1,
  "pageSize": 10
}

// Response
{
  "data": [
    {
      "id": 1,
      "name": "string",
      "birthDate": "2024-01-01",
      "phone": "string",
      "address": "string",
      "status": "active|completed",
      "avatar": "string",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### POST `/cases`
創建新個案
```json
// Request
{
  "name": "string",
  "birthDate": "2024-01-01",
  "idNumber": "string",
  "gender": "male|female|other",
  "city": "string",
  "district": "string",
  "detailAddress": "string",
  "schoolType": "string",
  "schoolDistrict": "string",
  "contactName": "string",
  "relationship": "string",
  "phoneRegion": "string",
  "phoneNumber": "string",
  "mobilePhone": "string",
  "email": "string",
  "specialStatus": {
    "lowIncome": true,
    "singleParent": false,
    "newResident": false,
    "indigenous": false,
    "disabled": false,
    "other": "string"
  },
  "profileImage": "string"
}

// Response (個案記錄)
```

### GET `/cases/{id}`
獲取個案詳情

### PUT `/cases/{id}`
更新個案資料

### DELETE `/cases/{id}`
刪除個案

### PATCH `/cases/{id}/status`
更新個案狀態
```json
// Request
{
  "status": "active|completed"
}
```

### POST `/cases/{id}/image`
上傳個案照片
```json
// Request: multipart/form-data
// Field: image (file)

// Response
{
  "imageUrl": "string"
}
```

## 活動管理 API (`/activities`)

### GET `/activities`
獲取活動列表

### POST `/activities`
創建新活動
```json
// Request
{
  "name": "string",
  "location": "string",
  "volunteerCount": 10,
  "participantCount": 20,
  "shortDescription": "string",
  "detailDescription": "string",
  "date": "2024-01-01",
  "time": "08:00"
}
```

### GET `/activities/{id}`
獲取活動詳情

### PUT `/activities/{id}`
更新活動資料

### DELETE `/activities/{id}`
刪除活動

### PATCH `/activities/{id}/status`
更新活動狀態
```json
// Request
{
  "status": "upcoming|ongoing|completed|cancelled"
}
```

## 報名管理 API (`/registrations`)

### GET `/registrations`
獲取報名列表
```json
// Query Parameters
{
  "searchType": "string",
  "searchContent": "string",
  "type": "volunteer|participant",
  "status": "pending|approved|rejected",
  "activityId": 1,
  "page": 1,
  "pageSize": 10
}
```

### POST `/registrations`
創建新報名
```json
// Request
{
  "activityId": 1,
  "applicantName": "string",
  "email": "string",
  "phone": "string",
  "type": "volunteer|participant",
  "description": "string"
}
```

### PATCH `/registrations/{id}/approve`
同意報名
```json
// Request
{
  "reviewNote": "string"
}
```

### PATCH `/registrations/{id}/reject`
拒絕報名
```json
// Request
{
  "reviewNote": "string"
}
```

### GET `/registrations/pending-count`
獲取待審核報名數量
```json
// Response
{
  "totalPending": 5,
  "volunteerPending": 3,
  "participantPending": 2
}
```

## 錯誤處理

所有 API 錯誤都應該返回以下格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息",
    "details": "詳細錯誤資訊"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/endpoint"
}
```

## HTTP 狀態碼

- `200` - 成功
- `201` - 創建成功
- `400` - 請求錯誤
- `401` - 未授權
- `403` - 禁止訪問
- `404` - 資源不存在
- `500` - 伺服器錯誤

## CORS 設定

後端需要配置 CORS 以允許前端訪問：

```csharp
// Program.cs 或 Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});
``` 