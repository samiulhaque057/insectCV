/**
 * Admin User Management Script
 * Interactive CLI for managing admin users
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function clearScreen() {
  console.clear();
}

function printHeader() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║       Admin User Management            ║");
  console.log("╚════════════════════════════════════════╝\n");
}

function printMenu() {
  console.log("  1. Create admin user");
  console.log("  2. List all admins");
  console.log("  3. Reset password");
  console.log("  4. Toggle active status");
  console.log("  5. Delete admin");
  console.log("  6. Exit\n");
}

async function createAdmin() {
  console.log("\n--- Create Admin User ---\n");

  const email = await prompt("Email: ");
  if (!email) {
    console.log("\n✗ Email is required");
    return;
  }

  const username = await prompt("Username: ");
  if (!username) {
    console.log("\n✗ Username is required");
    return;
  }

  const password = await prompt("Password: ");
  if (!password) {
    console.log("\n✗ Password is required");
    return;
  }

  if (password.length < 6) {
    console.log("\n✗ Password must be at least 6 characters");
    return;
  }

  const hashedPassword = await hash(password, 12);

  try {
    const admin = await prisma.admin.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    console.log(`\n✓ Admin created successfully!`);
    console.log(`  ID: ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log(`\n✗ Error: Admin with this email or username already exists`);
    } else {
      console.log(`\n✗ Error creating admin:`, error.message);
    }
  }
}

async function listAdmins() {
  console.log("\n--- All Admin Users ---\n");

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (admins.length === 0) {
    console.log("No admin users found.");
    return;
  }

  console.log(`Found ${admins.length} admin(s):\n`);
  console.log("─".repeat(70));

  for (const admin of admins) {
    const status = admin.isActive ? "\x1b[32mActive\x1b[0m" : "\x1b[31mInactive\x1b[0m";
    console.log(`  Email:      ${admin.email}`);
    console.log(`  Username:   ${admin.username}`);
    console.log(`  Status:     ${status}`);
    console.log(`  Created:    ${admin.createdAt.toLocaleDateString()}`);
    console.log(`  Last Login: ${admin.lastLoginAt?.toLocaleDateString() || "Never"}`);
    console.log("─".repeat(70));
  }
}

async function selectAdmin(action: string): Promise<string | null> {
  const admins = await prisma.admin.findMany({
    select: { email: true, username: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (admins.length === 0) {
    console.log("\nNo admin users found.");
    return null;
  }

  console.log(`\nSelect admin to ${action}:\n`);
  admins.forEach((admin, index) => {
    const status = admin.isActive ? "Active" : "Inactive";
    console.log(`  ${index + 1}. ${admin.email} (${admin.username}) - ${status}`);
  });
  console.log(`  0. Cancel\n`);

  const choice = await prompt("Enter number: ");
  const index = parseInt(choice, 10) - 1;

  if (choice === "0" || isNaN(index) || index < 0 || index >= admins.length) {
    return null;
  }

  return admins[index].email;
}

async function resetPassword() {
  console.log("\n--- Reset Password ---");

  const email = await selectAdmin("reset password");
  if (!email) {
    console.log("\nCancelled.");
    return;
  }

  const newPassword = await prompt("New password: ");
  if (!newPassword) {
    console.log("\n✗ Password is required");
    return;
  }

  if (newPassword.length < 6) {
    console.log("\n✗ Password must be at least 6 characters");
    return;
  }

  const hashedPassword = await hash(newPassword, 12);

  try {
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`\n✓ Password reset successfully for: ${email}`);
  } catch (error: any) {
    console.log(`\n✗ Error resetting password:`, error.message);
  }
}

async function toggleActive() {
  console.log("\n--- Toggle Active Status ---");

  const email = await selectAdmin("toggle status");
  if (!email) {
    console.log("\nCancelled.");
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      console.log(`\n✗ Admin not found`);
      return;
    }

    const updated = await prisma.admin.update({
      where: { email },
      data: { isActive: !admin.isActive },
    });

    const status = updated.isActive ? "\x1b[32mACTIVE\x1b[0m" : "\x1b[31mINACTIVE\x1b[0m";
    console.log(`\n✓ ${updated.email} is now ${status}`);
  } catch (error: any) {
    console.log(`\n✗ Error toggling status:`, error.message);
  }
}

async function deleteAdmin() {
  console.log("\n--- Delete Admin ---");

  const email = await selectAdmin("delete");
  if (!email) {
    console.log("\nCancelled.");
    return;
  }

  const confirm = await prompt(`Are you sure you want to delete ${email}? (yes/no): `);
  if (confirm.toLowerCase() !== "yes") {
    console.log("\nCancelled.");
    return;
  }

  try {
    await prisma.admin.delete({ where: { email } });
    console.log(`\n✓ Admin deleted: ${email}`);
  } catch (error: any) {
    console.log(`\n✗ Error deleting admin:`, error.message);
  }
}

async function main() {
  clearScreen();

  while (true) {
    printHeader();
    printMenu();

    const choice = await prompt("Select option (1-6): ");

    switch (choice) {
      case "1":
        await createAdmin();
        break;
      case "2":
        await listAdmins();
        break;
      case "3":
        await resetPassword();
        break;
      case "4":
        await toggleActive();
        break;
      case "5":
        await deleteAdmin();
        break;
      case "6":
        console.log("\nGoodbye!\n");
        rl.close();
        await prisma.$disconnect();
        process.exit(0);
      default:
        console.log("\n✗ Invalid option. Please enter 1-6.");
    }

    await prompt("\nPress Enter to continue...");
    clearScreen();
  }
}

main().catch(async (error) => {
  console.error("Error:", error);
  rl.close();
  await prisma.$disconnect();
  process.exit(1);
});
