# Manual Testing Guide: AdminSettingsPage

**Version**: 1.0.0
**Date**: 2025-11-24
**Component**: AdminSettingsPage Configuration Tabs

---

## Prerequisites

1. Backend running on `http://localhost:3006`
2. Frontend running on `http://localhost:5173` (or configured port)
3. Admin user authenticated
4. Database initialized with system_settings table

---

## Test Scenarios

### 1. Navigation & Initial Load

**Steps**:
1. Login as admin user
2. Navigate to `/admin/settings` or click "Settings" in admin portal

**Expected Results**:
- ✅ Page loads without errors
- ✅ "System Configuration" header visible
- ✅ Two tabs visible: "General" and "Security"
- ✅ "General" tab selected by default
- ✅ Yellow warning banner at bottom
- ✅ Loading spinner shown briefly while fetching config

**Validation**:
```
Console: No errors
Network: GET /admin/system/config/general (200 OK)
UI: General settings form displayed
```

---

### 2. General Settings Tab

#### 2A. Load Current Settings

**Steps**:
1. Click on "General" tab (if not already selected)
2. Wait for form to load

**Expected Results**:
- ✅ Form displays with 3 fields
- ✅ "Allow User Registrations" checkbox shows current value
- ✅ "Maintenance Mode" checkbox shows current value
- ✅ "Maintenance Message" textarea shows current message
- ✅ Save button is DISABLED (no changes yet)

#### 2B. Toggle Allow Registrations

**Steps**:
1. Click "Allow User Registrations" checkbox
2. Observe Save button state

**Expected Results**:
- ✅ Checkbox toggles
- ✅ Save button becomes ENABLED
- ✅ Reset button becomes ENABLED

#### 2C. Enable Maintenance Mode

**Steps**:
1. Click "Maintenance Mode" checkbox
2. Observe form state

**Expected Results**:
- ✅ Checkbox toggles
- ✅ Save button remains enabled
- ✅ Form is now dirty (has unsaved changes)

#### 2D. Edit Maintenance Message

**Steps**:
1. Click in "Maintenance Message" textarea
2. Type: "System will be back at 10 PM"

**Expected Results**:
- ✅ Text updates in real-time
- ✅ Save button remains enabled

#### 2E. Validate Maintenance Message (Error Case)

**Steps**:
1. Clear maintenance message textarea
2. Type only: "Short"
3. Click outside textarea

**Expected Results**:
- ✅ Red error message appears: "Message must be at least 10 characters"
- ✅ Save button remains enabled (form validation will catch on submit)

#### 2F. Save General Settings

**Steps**:
1. Ensure valid values in all fields
2. Click "Save Changes" button

**Expected Results**:
- ✅ Button shows "Saving..." text
- ✅ Button becomes disabled
- ✅ Success toast notification appears (green): "General settings updated successfully"
- ✅ Form resets with new values
- ✅ Save button becomes disabled again

**Validation**:
```
Network: PUT /admin/system/config/general (200 OK)
Console: No errors
Database: Check system_settings table updated
```

#### 2G. Reset General Settings

**Steps**:
1. Make a change to any field
2. Click "Reset" button

**Expected Results**:
- ✅ Form reverts to original values
- ✅ Save button becomes disabled
- ✅ Reset button becomes disabled

---

### 3. Security Settings Tab

#### 3A. Switch to Security Tab

**Steps**:
1. Click "Security" tab

**Expected Results**:
- ✅ Tab becomes active (blue underline)
- ✅ Security form loads
- ✅ General form hidden
- ✅ Loading spinner shown briefly

**Validation**:
```
Network: GET /admin/system/config/security (200 OK)
```

#### 3B. Load Security Settings

**Expected Results**:
- ✅ "Max Login Attempts" shows current value (default: 5)
- ✅ "Lockout Duration" shows current value (default: 30)
- ✅ "Session Timeout" shows current value (default: 60)
- ✅ Blue "Best Practices" info panel visible
- ✅ Save button is DISABLED

#### 3C. Change Max Login Attempts (Valid)

**Steps**:
1. Click "Max Login Attempts" input
2. Change value to: 3
3. Observe validation

**Expected Results**:
- ✅ Value updates
- ✅ No error message (3 is valid)
- ✅ Save button becomes ENABLED

#### 3D. Change Max Login Attempts (Invalid - Too Low)

**Steps**:
1. Clear "Max Login Attempts" input
2. Type: 2
3. Click outside input

**Expected Results**:
- ✅ Red error message: "Must be at least 3 attempts"
- ✅ Field border turns red
- ✅ Save button still enabled (validation will prevent submit)

#### 3E. Change Max Login Attempts (Invalid - Too High)

**Steps**:
1. Clear "Max Login Attempts" input
2. Type: 15
3. Click outside input

**Expected Results**:
- ✅ Red error message: "Must be at most 10 attempts"
- ✅ Field border turns red

#### 3F. Change Lockout Duration (Valid Range)

**Steps**:
1. Click "Lockout Duration" input
2. Change to: 15

**Expected Results**:
- ✅ Value updates
- ✅ No error (5-1440 is valid range)
- ✅ Save button enabled

#### 3G. Change Session Timeout

**Steps**:
1. Click "Session Timeout" input
2. Change to: 120 (2 hours)

**Expected Results**:
- ✅ Value updates
- ✅ No error (15-1440 is valid range)

#### 3H. Save Security Settings

**Steps**:
1. Ensure all fields have valid values
2. Click "Save Changes"

**Expected Results**:
- ✅ Button shows "Saving..."
- ✅ Button disabled during save
- ✅ Success toast: "Security settings updated successfully"
- ✅ Form resets with new values
- ✅ Save button disabled

**Validation**:
```
Network: PUT /admin/system/config/security (200 OK)
Response should contain updated values
```

---

### 4. Error Handling

#### 4A. Backend Down

**Steps**:
1. Stop backend server
2. Click "General" tab
3. Wait for response

**Expected Results**:
- ✅ Error toast appears: "Failed to fetch system configuration"
- ✅ Form remains empty or shows previous cached data
- ✅ No app crash

#### 4B. Save Error (Backend Returns 500)

**Steps**:
1. Mock backend to return 500 error
2. Make changes to form
3. Click "Save Changes"

**Expected Results**:
- ✅ Error toast appears: "Failed to update [category] settings"
- ✅ Form retains user's changes
- ✅ Save button re-enabled
- ✅ User can retry

#### 4C. Network Timeout

**Steps**:
1. Simulate slow network (Chrome DevTools: Network throttling)
2. Click "Save Changes"

**Expected Results**:
- ✅ "Saving..." text shown during wait
- ✅ Either success or timeout error
- ✅ Graceful handling (no hanging state)

---

### 5. UI/UX Testing

#### 5A. Tab Switching

**Steps**:
1. Make changes in "General" tab (don't save)
2. Click "Security" tab
3. Click "General" tab again

**Expected Results**:
- ✅ Unsaved changes are lost (expected behavior)
- ✅ Each tab fetches fresh data on switch
- ✅ Smooth transition animation

**Note**: This is expected behavior. Adding "unsaved changes" warning is Phase 2.

#### 5B. Responsive Design

**Steps**:
1. Resize browser window to mobile width (<768px)
2. Check tab navigation
3. Check form layout

**Expected Results**:
- ✅ Tabs stack vertically or remain horizontal (depends on design)
- ✅ Form inputs take full width
- ✅ Buttons remain accessible
- ✅ Text readable without horizontal scroll

#### 5C. Warning Banner

**Steps**:
1. Scroll to bottom of page
2. Read yellow warning banner

**Expected Results**:
- ✅ Banner clearly visible
- ✅ Warning icon present
- ✅ Text explains impact of changes
- ✅ Banner styled appropriately (yellow background)

---

### 6. Integration Testing

#### 6A. Settings Persist Across Sessions

**Steps**:
1. Change "Max Login Attempts" to 3
2. Save changes
3. Logout
4. Login again
5. Navigate to Admin Settings > Security

**Expected Results**:
- ✅ "Max Login Attempts" still shows 3
- ✅ Settings persisted in database

**Validation**:
```sql
SELECT * FROM system_settings WHERE setting_key = 'max_login_attempts';
-- Should show: setting_value = '3'
```

#### 6B. Maintenance Mode Actually Works

**Steps**:
1. Enable "Maintenance Mode"
2. Set message: "We'll be back soon!"
3. Save changes
4. Logout
5. Try to login as non-admin user

**Expected Results**:
- ✅ Non-admin users see maintenance message
- ✅ Admin users can still login
- ✅ Message matches what was set

#### 6C. Login Attempts Enforcement

**Steps**:
1. Set "Max Login Attempts" to 3
2. Set "Lockout Duration" to 5 minutes
3. Save changes
4. Logout
5. Try logging in with wrong password 3 times

**Expected Results**:
- ✅ After 3rd failed attempt, account locked
- ✅ Error message indicates lockout
- ✅ Wait 5 minutes, can try again

---

### 7. Accessibility Testing

#### 7A. Keyboard Navigation

**Steps**:
1. Use only Tab key to navigate form
2. Try to fill form with keyboard only

**Expected Results**:
- ✅ All inputs focusable with Tab
- ✅ Checkboxes toggle with Space
- ✅ Save button activatable with Enter
- ✅ Focus indicators visible

#### 7B. Screen Reader

**Steps**:
1. Enable screen reader (NVDA/JAWS)
2. Navigate through form

**Expected Results**:
- ✅ Labels read correctly
- ✅ Input types announced
- ✅ Error messages read
- ✅ Button states announced

---

## Test Data

### Valid Test Values

**General Settings**:
```
allow_registrations: true
maintenance_mode: false
maintenance_message: "System maintenance in progress. Expected completion: 10 PM PST."
```

**Security Settings**:
```
max_login_attempts: 5
lockout_duration_minutes: 30
session_timeout_minutes: 60
```

### Edge Case Test Values

**Security - Minimum Values**:
```
max_login_attempts: 3
lockout_duration_minutes: 5
session_timeout_minutes: 15
```

**Security - Maximum Values**:
```
max_login_attempts: 10
lockout_duration_minutes: 1440  (24 hours)
session_timeout_minutes: 1440  (24 hours)
```

---

## Known Issues / Limitations

1. **No Unsaved Changes Warning**: Switching tabs loses unsaved changes (Phase 2)
2. **Email/Notifications Tabs Missing**: Backend not implemented yet
3. **No Config History**: Can't see previous config versions (Phase 2)
4. **No Bulk Reset**: Must reset form fields individually

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ All network requests return 200 OK
- ✅ Toast notifications show appropriately
- ✅ Form validation works correctly
- ✅ Settings persist in database
- ✅ Maintenance mode and security policies enforced

---

## Reporting Issues

If any test fails, report with:
1. Test scenario number (e.g., "3H. Save Security Settings")
2. Steps performed
3. Expected vs actual result
4. Browser console errors
5. Network tab screenshot
6. Browser/version

---

**Last Updated**: 2025-11-24
**Tested By**: [Your Name]
**Test Status**: [ ] PASSED / [ ] FAILED
