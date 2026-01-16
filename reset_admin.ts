import "dotenv/config";
import { storage } from './server/storage';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function resetAdmin() {
  try {
    console.log('Resetting admin password...');
    
    // Hash the new password
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync("admin123", salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    // Update the admin user
    const adminUser = await storage.getUserByUsername('admin');
    if (adminUser) {
      const updated = await storage.updateUser(adminUser.id, {
        password: hashedPassword,
        fullName: "Administrador"
      });
      console.log('Admin user updated:', {
        id: updated?.id,
        username: updated?.username,
        fullName: updated?.fullName,
        role: updated?.role
      });
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

resetAdmin().then(() => process.exit(0));
