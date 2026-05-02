/**
 * Shared Socket.IO client options. Caps reconnection so an offline API (e.g. :3001 down)
 * does not flood the Network tab and devtools with endless polling attempts.
 */
export const socketClientOptions = {
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: 2,
  reconnectionDelay: 4000,
  reconnectionDelayMax: 12000,
};
