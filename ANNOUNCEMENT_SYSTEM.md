# Announcement Banner System - Complete Guide

## Overview
A full-stack real-time announcement banner system for the Rosa Beach hotel app. Admins can create, update, and delete announcements that appear instantly across all client pages via Socket.IO.

---

## 📁 Project Structure

```
rosabeachcommunity/
├── models/
│   └── Announcement.js           # Mongoose model
├── routes/
│   └── announcements.js          # API routes
├── src/
│   ├── components/
│   │   ├── AnnouncementBar.jsx   # Client banner component
│   │   └── ClientProviders.jsx   # Client wrapper
│   ├── hooks/
│   │   └── useSocket.js          # Socket.IO hook
│   └── app/
│       ├── layout.js             # Updated root layout
│       └── admin/
│           └── announcements/
│               └── page.js       # Admin dashboard
├── server.js                     # Updated with announcements routes
└── package.json
```

---

## 🚀 Features

### ✅ Backend Features
- **Single Active Announcement**: Only one announcement can be active at a time
- **CRUD Operations**: Create, read, update, delete announcements
- **Priority Levels**: `info`, `warning`, `danger`
- **Custom Icons**: Choose from 8 predefined emoji icons
- **Auto-hide**: Optional auto-hide after X seconds
- **Real-time Updates**: Socket.IO emits changes to all connected clients
- **Timestamps**: Created and updated dates tracked

### ✅ Frontend Features
- **AnnouncementBar Component**: Fixed banner at top of all pages
- **Socket.IO Real-time**: Instant updates without page refresh
- **Smooth Animations**: Slide-in/out transitions
- **Close Button**: Users can dismiss the banner
- **Responsive Design**: Works on mobile and desktop
- **Auto-hide Support**: Banner can disappear after set time

### ✅ Admin Features
- **Create Announcements**: Publish new messages to all clients
- **Edit Announcements**: Modify existing announcements
- **Delete Announcements**: Remove announcements
- **Preview Current**: See the active announcement
- **Full History**: View all announcements with details

---

## 🛠️ API Endpoints

### GET `/api/announcement`
Fetch the latest **active** announcement (used by clients on page load)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "message": "Beach closed due to storm",
  "active": true,
  "priority": "danger",
  "icon": "⚠️",
  "autoHideSeconds": null,
  "createdAt": "2024-04-19T10:00:00Z",
  "updatedAt": "2024-04-19T10:00:00Z"
}
```

---

### GET `/api/announcement/all`
Fetch **all** announcements (used by admin dashboard)

**Response:** Array of announcement objects

---

### POST `/api/announcement`
Create a new announcement (deactivates all previous ones)

**Request Body:**
```json
{
  "message": "Beach closed due to storm",
  "priority": "danger",           // optional, default: "warning"
  "icon": "⚠️",                  // optional, default: "⚠️"
  "autoHideSeconds": 10          // optional, null = no auto-hide
}
```

**Socket.IO Event Emitted:** `announcement-update` with the new announcement object

---

### PATCH `/api/announcement/:id`
Update an existing announcement

**Request Body:**
```json
{
  "message": "Updated message",
  "priority": "warning",
  "icon": "🔔",
  "active": true,
  "autoHideSeconds": 20
}
```

**Note:** If `active: true`, deactivates all other announcements

**Socket.IO Event Emitted:** `announcement-update` with the latest active announcement

---

### DELETE `/api/announcement/:id`
Delete an announcement

**Socket.IO Event Emitted:** `announcement-update` with the latest active announcement (or null if none)

---

## 🎨 Component Usage

### AnnouncementBar Component
```jsx
import AnnouncementBar from '@/components/AnnouncementBar';

export default function App() {
  return (
    <>
      <AnnouncementBar />
      {/* Rest of your app */}
    </>
  );
}
```

**Already integrated in root layout via `ClientProviders` wrapper**

---

### useSocket Hook
```jsx
import { useSocket } from '@/hooks/useSocket';

export default function MyComponent() {
  const socket = useSocket();

  useEffect(() => {
    socket?.on('custom-event', (data) => {
      // Handle event
    });
  }, [socket]);

  return <div>Component</div>;
}
```

---

## 📊 Admin Dashboard

Access the admin announcements page at:
```
http://localhost:3000/admin/announcements
```

### Features:
- **Create Form**: Message input with message counter (500 char limit)
- **Priority Select**: Choose info/warning/danger
- **Icon Picker**: 8 emoji options with visual selection
- **Auto-hide Input**: Optional timeout in seconds
- **Current Announcement**: Shows the active announcement at the top
- **All Announcements**: List with edit/delete buttons
- **Success/Error Messages**: Feedback for user actions

---

## 🔌 Socket.IO Integration

### Server-side (Backend)
```javascript
// Automatic emission when announcement changes
io.emit('announcement-update', announcementObject);
```

### Client-side (Frontend)
```javascript
socket.on('announcement-update', (announcement) => {
  if (announcement) {
    // Display the announcement
    setAnnouncement(announcement);
  } else {
    // No active announcement
    setAnnouncement(null);
  }
});
```

---

## 🎯 Priority Levels & Colors

| Priority | Color  | Background | Use Case |
|----------|--------|------------|----------|
| `info`   | Blue   | bg-blue-600 | General information |
| `warning`| Amber  | bg-amber-600 | Warnings, caution |
| `danger` | Red    | bg-red-600  | Urgent, critical alerts |

---

## 💾 Database Schema

### Announcement Model
```javascript
{
  message: String,              // required, max 500 chars
  active: Boolean,              // default: true
  priority: String,             // 'info' | 'warning' | 'danger'
  icon: String,                 // emoji icon
  autoHideSeconds: Number,      // optional, null = no auto-hide
  createdAt: Date,              // auto
  updatedAt: Date               // auto
}
```

**Indexes:**
- `{ active: 1, createdAt: -1 }` - For quick active announcement lookup

---

## 🧪 Testing

### Using cURL:

**Create Announcement:**
```bash
curl -X POST http://localhost:3001/api/announcement \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Beach closed today",
    "priority": "danger",
    "icon": "⚠️",
    "autoHideSeconds": 10
  }'
```

**Fetch Active Announcement:**
```bash
curl http://localhost:3001/api/announcement
```

**Update Announcement:**
```bash
curl -X PATCH http://localhost:3001/api/announcement/{ID} \
  -H "Content-Type: application/json" \
  -d '{"message": "New message", "active": true}'
```

**Delete Announcement:**
```bash
curl -X DELETE http://localhost:3001/api/announcement/{ID}
```

---

## ⚡ How It Works

### User Flow:
1. **Client loads page** → Fetches GET `/api/announcement`
2. **AnnouncementBar displays** the active announcement (if any)
3. **Socket.IO listens** for `announcement-update` events
4. **Admin creates/updates/deletes** announcement
5. **Server emits** `announcement-update` to all connected clients
6. **All clients instantly see** the new announcement without refresh

### Real-time Update Flow:
```
Admin Creates Announcement
        ↓
POST /api/announcement
        ↓
Server deactivates old announcements
        ↓
Saves new announcement to MongoDB
        ↓
Emits "announcement-update" event via Socket.IO
        ↓
All connected clients receive event
        ↓
AnnouncementBar component updates and displays banner
```

---

## 🔐 Security Notes

Currently, **no authentication** is required for the API. To add authentication:

1. Add auth middleware to `routes/announcements.js`:
```javascript
router.post('/', authMiddleware, async (req, res) => {
  // Only admins can create
});
```

2. Update Socket.IO connection to verify tokens

---

## 🐛 Troubleshooting

### Banner not showing?
- Check MongoDB connection: `mongodb+srv://...`
- Verify backend is running on port 3001
- Check browser console for errors

### Socket.IO not connecting?
- Ensure backend CORS allows `http://localhost:3000`
- Check if Socket.IO server is initialized in `server.js`
- Verify socket URL: `http://localhost:3001`

### Admin page not updating?
- Ensure you're on `/admin/announcements` (not password-protected currently)
- Check if announcement was actually created (check MongoDB)
- Clear browser cache if stale data appears

---

## 📦 Dependencies Used

- **express**: Web server
- **mongoose**: MongoDB ORM
- **socket.io**: Real-time communication
- **socket.io-client**: Frontend Socket.IO client
- **cors**: Cross-origin requests
- **next**: React framework

All dependencies are already in your `package.json`

---

## 🚀 Deployment

### Environment Variables (.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
PORT=3001
```

### Starting the App
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm run dev
```

Visit:
- **Client**: `http://localhost:3000`
- **Admin**: `http://localhost:3000/admin/announcements`

---

## 📝 Future Enhancements

- ✅ Multiple languages support
- ✅ Scheduled announcements (publish at specific time)
- ✅ Announcement expiration (auto-delete after X days)
- ✅ User roles & permissions
- ✅ Announcement analytics (view count)
- ✅ Rich text editor for messages
- ✅ Target specific pages/routes

---

## ✅ Checklist

Before deploying:
- [ ] Database connection string set in `.env`
- [ ] Backend running on correct port (3001)
- [ ] CORS configured for frontend URL
- [ ] Socket.IO connection working (check browser console)
- [ ] Admin page accessible at `/admin/announcements`
- [ ] Test create/update/delete operations
- [ ] Verify real-time updates with Socket.IO
- [ ] Test on mobile devices
- [ ] Add authentication to admin routes

---

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Check server logs for backend errors
3. Verify MongoDB connection
4. Ensure all routes are registered in `server.js`
5. Check Socket.IO connection in network tab

---

**System Ready! 🎉**

Your announcement banner system is now fully integrated. All clients will see announcements in real-time, and admins can manage them from `/admin/announcements`.
