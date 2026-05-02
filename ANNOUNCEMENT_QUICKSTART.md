# Quick Start Guide - Announcement Banner System

## 🏃 5-Minute Setup

### 1. Restart Your Servers

**Terminal 1 (Backend):**
```bash
cd c:\Users\amirs\Desktop\rosabeachcommunity
node server.js
```
Expected output: `Server running on port 3001` ✅

**Terminal 2 (Frontend):**
```bash
cd c:\Users\amirs\Desktop\rosabeachcommunity
npm run dev
```
Expected output: `✓ Ready in XXXms` ✅

---

## 2. Test the System

### Step 1: Open Admin Dashboard
1. Go to: `http://localhost:3000/admin/announcements`
2. You should see an empty announcements form

### Step 2: Create Your First Announcement
1. Type a message: "🏖️ Welcome to Hotel Name Community!"
2. Select priority: `warning` (amber/yellow)
3. Select icon: `🏖️`
4. Click "Publish Announcement"
5. You should see: ✅ Announcement published successfully!

### Step 3: See It Live on Home Page
1. Open a new tab: `http://localhost:3000`
2. At the top, you should see **red alert banner** with your message
3. Click the **X button** to close it (client-side only)

### Step 4: Test Real-Time Update
1. Go back to admin page
2. Change the message to: "🚨 Storm Warning - Beach Closed"
3. Change priority to: `danger`
4. Change icon to: `🚨`
5. Click "Update & Publish"
6. Switch to home page tab
7. **Banner updates instantly** without refresh! ⚡

### Step 5: Test Auto-Hide
1. Go back to admin page
2. Create new announcement: "Pool will be closed at 6 PM"
3. Set auto-hide to: `5` seconds
4. Publish
5. Watch home page - banner disappears after 5 seconds ⏱️

### Step 6: Test Delete
1. Admin page - click "Delete" on any announcement
2. Confirm deletion
3. Home page - banner disappears instantly ✅

---

## 🎨 Banner Appearance

The banner appears with these colors based on priority:

```
Priority: danger  →  Red background (#dc2626)
Priority: warning →  Amber background (#b45309)
Priority: info    →  Blue background (#2563eb)
```

All with white text and icon.

---

## 🔍 Debug Tips

### Check Backend Logs
Look for these messages in your backend terminal:
```
Client connected: <socket-id>
Connected to MongoDB Atlas
```

### Check Browser Console
Open DevTools (F12) → Console tab and look for:
```
Socket.IO connected
```

### Test API Directly
Use Postman or cURL:
```bash
# Get active announcement
curl http://localhost:3001/api/announcement

# Create announcement
curl -X POST http://localhost:3001/api/announcement \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "priority": "warning"}'
```

---

## 📱 Test Different Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| **First Load** | Visit home page | See active announcement (if exists) |
| **Create New** | Admin creates → Home page refreshes | Banner appears instantly |
| **Update Active** | Admin edits → Home page updates | Message changes without refresh |
| **Delete** | Admin deletes → Home page updates | Banner disappears |
| **Multiple Browsers** | Create in one, open home in other | Both show banner instantly |
| **Auto-hide** | Create with 5sec auto-hide | Banner disappears after 5 sec |
| **Close Button** | Click X on banner | Only closes on that client |

---

## 🎯 Common Questions

**Q: Why doesn't it show on other pages?**
A: It should! AnnouncementBar is in the root layout, so it appears on ALL pages.

**Q: Why isn't the banner showing?**
A: 
1. Check if there's an active announcement in MongoDB
2. Check backend is running
3. Check browser console for errors
4. Refresh the page

**Q: How do I make it password protected?**
A: Add auth middleware to `/api/announcement` routes (see ANNOUNCEMENT_SYSTEM.md)

**Q: Can users see old announcements?**
A: No, only the latest active one. Deleted ones are gone from all clients.

**Q: How long does the banner stay?**
A: Forever (unless auto-hide is set) or until user clicks X.

---

## ✅ Success Checklist

- [ ] Backend running on 3001
- [ ] Frontend running on 3000
- [ ] Admin page loads at `/admin/announcements`
- [ ] Can create announcements
- [ ] Banner appears on home page
- [ ] Real-time updates work (no refresh needed)
- [ ] Close button works
- [ ] Delete removes banner
- [ ] Socket.IO connects (check console)

---

## 🆘 If Something Goes Wrong

### Backend won't start
```bash
# Check if port 3001 is in use
# Kill the process or use different port
# Check MongoDB connection string in .env
```

### Banner not appearing
```bash
# Check MongoDB has announcements
# Verify fetch in browser console
# Check if AnnouncementBar component imported in layout
```

### Real-time not working
```bash
# Check Socket.IO connected message in console
# Verify CORS settings in server.js
# Check backend logs for connection message
```

---

## 📺 Full Testing Workflow

```bash
# 1. Start backend
node server.js
# Wait for: Connected to MongoDB Atlas

# 2. In new terminal, start frontend
npm run dev
# Wait for: Ready in XXms

# 3. Open browser
http://localhost:3000/admin/announcements

# 4. Create announcement
Type message → Click Publish

# 5. Verify on home page
http://localhost:3000

# 6. Test real-time update
Admin: Change message → Click Update
Home: Watch banner update instantly

# 7. Test delete
Admin: Click Delete
Home: Watch banner disappear
```

---

## 🎉 You're All Set!

Your announcement banner system is live and working with real-time Socket.IO updates. Admins can publish announcements instantly visible to all users.

**Happy testing! 🚀**
