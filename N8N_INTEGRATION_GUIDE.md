# n8n Workflow Integration - Quick Reference

## 🎯 Overview

Your n8n workflows can now get fresh Google access tokens with a single HTTP request. No complex refresh logic needed!

## 🔧 Setup Your n8n Workflow

### Node 1: Trigger (Webhook, Schedule, etc.)

This is your workflow trigger. It should provide or know the `clientId` of the clinic whose data you need.

Example webhook payload:
```json
{
  "clientId": "clinic-saude-total",
  "action": "fetch_calendar_events"
}
```

---

### Node 2: Get Google Token

**Node Type:** HTTP Request

**Configuration:**
```
Method: POST
URL: https://your-app-domain.com/api/oauth/google-token
Authentication: None (or add your API key header if you implement it)

Body (JSON):
{
  "clientId": "{{ $json.clientId }}"
}
```

**Expected Response:**
```json
{
  "access_token": "ya29.a0AfH6SMB...",
  "expires_at": 1699564800000,
  "scopes": "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive ...",
  "provider": "google",
  "clientId": "clinic-saude-total"
}
```

**Error Responses:**

- `404` - Google account not connected
  ```json
  {
    "error": "Google account not connected",
    "message": "User has not connected their Google account"
  }
  ```

- `404` - Client not found
  ```json
  {
    "error": "Client not found or not linked to a user",
    "message": "Client must be linked to an authenticated user"
  }
  ```

---

### Node 3: Call Google API

**Node Type:** HTTP Request

**Example: Get Calendar Events**
```
Method: GET
URL: https://www.googleapis.com/calendar/v3/calendars/primary/events

Authentication: Header Auth
  Header Name: Authorization
  Header Value: Bearer {{ $node["Get Google Token"].json.access_token }}

Query Parameters:
  timeMin: {{ $now }}
  maxResults: 10
  singleEvents: true
  orderBy: startTime
```

**Example: Create Calendar Event**
```
Method: POST
URL: https://www.googleapis.com/calendar/v3/calendars/primary/events

Authentication: Header Auth
  Header Name: Authorization
  Header Value: Bearer {{ $node["Get Google Token"].json.access_token }}

Body (JSON):
{
  "summary": "Consulta - {{ $json.patientName }}",
  "start": {
    "dateTime": "{{ $json.appointmentTime }}",
    "timeZone": "America/Sao_Paulo"
  },
  "end": {
    "dateTime": "{{ $json.appointmentEndTime }}",
    "timeZone": "America/Sao_Paulo"
  },
  "description": "Paciente: {{ $json.patientName }}\nTelefone: {{ $json.phone }}"
}
```

**Example: List Google Drive Files**
```
Method: GET
URL: https://www.googleapis.com/drive/v3/files

Authentication: Header Auth
  Header Name: Authorization
  Header Value: Bearer {{ $node["Get Google Token"].json.access_token }}

Query Parameters:
  q: name contains 'relatorio'
  pageSize: 10
  fields: files(id,name,mimeType,createdTime)
```

**Example: Send Gmail**
```
Method: POST
URL: https://www.googleapis.com/gmail/v1/users/me/messages/send

Authentication: Header Auth
  Header Name: Authorization
  Header Value: Bearer {{ $node["Get Google Token"].json.access_token }}

Body (JSON):
{
  "raw": "{{ $base64($emailContent) }}"
}
```

---

## 🎨 Complete Workflow Examples

### Example 1: Daily Calendar Sync

```
[Schedule Trigger (Daily at 8am)]
  ↓
[Get All Clients from Database]
  ↓
[Loop Over Each Client]
  ↓
[Get Google Token]
  ↓
[Fetch Today's Calendar Events]
  ↓
[Send Telegram Notification with Events]
```

---

### Example 2: New Appointment Booking

```
[Webhook Trigger] ← Receives booking request
  ↓
[Get Google Token]
  ↓
[Check Calendar Availability]
  ↓
[IF Available]
    ↓
  [Create Calendar Event]
    ↓
  [Send Confirmation Email (Gmail)]
    ↓
  [Send Telegram Notification]
  
[IF Not Available]
    ↓
  [Send "Slot Taken" Response]
```

---

### Example 3: Document Backup to Drive

```
[Webhook Trigger] ← Form submission
  ↓
[Generate PDF Report]
  ↓
[Get Google Token]
  ↓
[Upload to Google Drive]
  ↓
[Send Link via Telegram]
```

---

## 🚨 Error Handling in n8n

### Handle "Google Account Not Connected"

Add an **IF Node** after "Get Google Token":

```
IF Condition:
  {{ $node["Get Google Token"].json.error === undefined }}

TRUE Branch:
  → Continue with Google API calls

FALSE Branch:
  → Send admin notification
  → Log error
  → Return error response
```

---

### Handle Token Fetch Failures

Add error handling with **Error Trigger** node:

```
[Error Trigger]
  ↓
[Check Error Type]
  ↓
[IF HTTP Error 404]
    → Send "Please connect Google account" message
  
[IF HTTP Error 500]
    → Retry after 1 minute
    → Alert admin if fails again
```

---

## 🔄 Token Refresh Behavior

**You don't need to handle token refresh!** Clerk does it automatically:

- ✅ Clerk checks if the token is expired
- ✅ If expired, Clerk automatically uses the refresh token
- ✅ Clerk returns a fresh, valid access token
- ✅ You just use the token in your API calls

**Token Lifetime:**
- Access tokens typically expire after 1 hour
- Clerk's API ensures you always get a valid token
- No expiry checking needed in your workflow

---

## 💡 Pro Tips

### 1. Cache Client IDs in Memory

Instead of fetching the client ID every time, store it in a workflow variable:

```
[Set Variable]
  Name: clientId
  Value: {{ $json.clientId }}
```

Then reference it in subsequent nodes:
```
{{ $workflow.clientId }}
```

---

### 2. Batch Operations

If calling the API multiple times for the same client:

```
[Get Google Token] ← Call once
  ↓
[Save Token to Variable]
  Name: googleToken
  Value: {{ $json.access_token }}
  ↓
[Multiple API Calls in Parallel]
  ├─→ [Call Calendar API] uses {{ $workflow.googleToken }}
  ├─→ [Call Drive API] uses {{ $workflow.googleToken }}
  └─→ [Call Gmail API] uses {{ $workflow.googleToken }}
```

---

### 3. Retry Failed Requests

Add retry logic for transient errors:

```
[HTTP Request Node]
  Settings:
    → Retry On Fail: Yes
    → Max Retries: 3
    → Wait Between Retries: 2000ms
```

---

### 4. Log All API Calls

Add a logging node after each Google API call:

```
[Google API Call]
  ↓
[Set Node]
  Mode: Manual Mapping
  {
    "timestamp": "{{ $now }}",
    "clientId": "{{ $workflow.clientId }}",
    "apiEndpoint": "calendar/v3/events",
    "success": true,
    "response": "{{ $json }}"
  }
  ↓
[Write to Database/Log File]
```

---

## 🧪 Testing Your Workflow

### Test with curl

```bash
# Test your token endpoint
curl -X POST http://localhost:3001/api/oauth/google-token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "test-clinic"}'

# Should return:
# {"access_token": "ya29...", "expires_at": 1699564800, ...}
```

### Test with n8n Manual Execution

1. Open your workflow in n8n
2. Click "Execute Workflow" (play button)
3. Watch each node execute
4. Check the output data of each node
5. Verify the Google API call succeeded

---

## 📊 Monitoring

### Things to Monitor:

1. **Token Fetch Success Rate**
   - Track how often the token endpoint returns 200 vs errors
   - Alert if error rate > 5%

2. **Google API Rate Limits**
   - Google has rate limits per API
   - Add delays between batch operations if needed

3. **Client Account Connection Status**
   - Track which clients have connected Google
   - Send reminders to those who haven't

---

## 🆘 Common Issues

### Issue: "Client not found or not linked to a user"

**Cause:** The client hasn't completed the form or connected Google yet.

**Solution:**
1. Have the client visit their portal URL
2. Complete the form
3. Connect their Google account in step 4

---

### Issue: Token works but API returns 403 Forbidden

**Cause:** The token doesn't have the required scope.

**Solution:**
1. Check what scopes are needed for your API call
2. Go to Clerk dashboard → Social Connections → Google
3. Add the missing scope
4. Have the user reconnect their Google account

---

### Issue: Workflow works for some clients but not others

**Cause:** Some clients haven't connected their Google account.

**Solution:**
Add a check at the start of your workflow:

```
[Get Google Token]
  ↓
[IF Node]
  Condition: {{ $json.error === undefined }}
  
  TRUE → Continue workflow
  FALSE → Send "Please connect Google" notification
```

---

## 📚 Google API Documentation

- Calendar API: https://developers.google.com/calendar/api/v3/reference
- Drive API: https://developers.google.com/drive/api/v3/reference
- Gmail API: https://developers.google.com/gmail/api/reference/rest
- Tasks API: https://developers.google.com/tasks/reference/rest

---

## 🎉 That's It!

You now have a simple, robust way to access Google APIs in n8n without managing token refresh logic yourself.

**Remember:**
- One endpoint to get tokens
- Clerk handles all refresh logic
- Focus on building your automation, not auth infrastructure

Happy automating! 🚀
