import AdminUser from '@models/AdminUser';
import { hashPassword } from '@/lib/passwordHash';

export const DEFAULT_STAFF_USERS = {
  animation: {
    password: 'dj2026!amir',
    role: 'animation',
  },
  admin: {
    password: 'dj2026!amir',
    role: 'animation',
  },
  guestrelation: {
    password: 'guest__2026!!',
    role: 'guestrelation',
  },
};

let seedPromise = null;

export async function ensureStaffUsersSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const usernames = Object.keys(DEFAULT_STAFF_USERS);
      const existingUsers = await AdminUser.find({ username: { $in: usernames } })
        .select('username')
        .lean();

      const existingUsernames = new Set(existingUsers.map((user) => user.username));
      const missingUsers = usernames.filter((username) => !existingUsernames.has(username));

      if (missingUsers.length === 0) {
        return;
      }

      const docs = missingUsers.map((username) => {
        const config = DEFAULT_STAFF_USERS[username];
        const { hash, salt } = hashPassword(config.password);

        return {
          username,
          role: config.role,
          passwordHash: hash,
          passwordSalt: salt,
          active: true,
        };
      });

      await AdminUser.insertMany(docs, { ordered: false });
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}
