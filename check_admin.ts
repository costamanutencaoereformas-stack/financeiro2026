import "dotenv/config";
import { storage } from './server/storage';

async function checkAdmin() {
  try {
    console.log('Checking for admin user...');
    const adminUser = await storage.getUserByUsername('admin');
    if (adminUser) {
      console.log('Admin user found:', {
        id: adminUser.id,
        username: adminUser.username,
        fullName: adminUser.fullName,
        role: adminUser.role,
        hasPassword: !!adminUser.password
      });
    } else {
      console.log('Admin user NOT found');
    }
    
    // Check all users
    const allUsers = await storage.getUsers();
    console.log('All users:', allUsers.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      hasPassword: !!u.password
    })));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin().then(() => process.exit(0));
