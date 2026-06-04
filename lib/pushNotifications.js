const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

let configured = false;

function ensureConfigured() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@guesthub.local';

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured. Push notifications disabled.');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

function getPublicVapidKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

async function sendPushToRole(role, payload) {
  if (!ensureConfigured()) {
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await PushSubscription.find({ role });
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload);
        sent += 1;
      } catch (error) {
        failed += 1;
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error('Push notification failed:', error.message);
        }
      }
    })
  );

  return { sent, failed };
}

async function notifyNewSongRequest(request) {
  const artist = request.artist ? ` — ${request.artist}` : '';
  return sendPushToRole('animation', {
    title: 'New Song Request',
    body: `${request.song}${artist}`,
    tag: `song-request-${request._id}`,
    url: '/admin/animation',
    type: 'song-request',
  });
}

async function notifyNewComplaint(complaint) {
  const preview = complaint.complaintText.slice(0, 80);
  return sendPushToRole('guestrelation', {
    title: 'New Complaint',
    body: `Room ${complaint.roomNumber}: ${preview}`,
    tag: `complaint-${complaint._id}`,
    url: '/admin/guestrelation',
    type: 'complaint',
  });
}

async function notifyNewServiceRequest(request) {
  return sendPushToRole('guestrelation', {
    title: 'New Service Request',
    body: `Room ${request.room}: ${request.type}`,
    tag: `service-${request._id}`,
    url: '/admin/guestrelation',
    type: 'service-request',
  });
}

module.exports = {
  getPublicVapidKey,
  sendPushToRole,
  notifyNewSongRequest,
  notifyNewComplaint,
  notifyNewServiceRequest,
};
