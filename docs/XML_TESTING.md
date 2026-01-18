# XML Response Testing Guide

## Overview
All API endpoints support both JSON and XML response formats based on the `Accept` header.

---

## Quick Testing

### PowerShell - Get XML Response
```powershell
$headers = @{ "Accept" = "application/xml" }
Invoke-RestMethod -Uri "http://localhost:3000/content/movies" -Headers $headers
```

### PowerShell - Get JSON Response (Default)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/content/movies"
```

---

## Postman Testing

1. Create GET request: `http://localhost:3000/content/movies`
2. Go to **Headers** tab
3. Add: `Accept` = `application/xml`
4. Send request
5. View XML response

---

## Available Endpoints

**Content:**
- `GET /content/movies`
- `GET /content/series`
- `GET /content/genres`
- `GET /content/classifications`

**Authentication:**
- `POST /auth/register`
- `POST /auth/login`

---

## Response Examples

### JSON (Default)
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### XML (with Accept header)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <data>...</data>
  <count>10</count>
</response>
```

---

## For Teacher Demo

**Show both formats side-by-side in Postman:**
1. Tab 1: `Accept: application/json` → JSON response
2. Tab 2: `Accept: application/xml` → XML response
3. Same endpoint, different formats based on client preference

This demonstrates **content negotiation** and **API flexibility**.
