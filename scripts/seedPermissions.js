/**
 * Seed script to create default permission categories and permissions
 * Run this script to populate the database with default permission categories and permissions
 * Usage: node scripts/seedPermissions.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultCategories = [
  'User Management',
  'Asset Management',
  'Department Management',
  'Analytics & Reports',
  'System Settings',
  'Audit Logs',
];

const defaultPermissions = [
  // User Management
  { name: 'View Users', category: 'User Management', description: 'Permission to view users list' },
  { name: 'Create Users', category: 'User Management', description: 'Permission to create new users' },
  { name: 'Edit Users', category: 'User Management', description: 'Permission to edit existing users' },
  { name: 'Delete Users', category: 'User Management', description: 'Permission to delete users' },
  
  // Asset Management
  { name: 'View Assets', category: 'Asset Management', description: 'Permission to view assets list' },
  { name: 'Add Assets', category: 'Asset Management', description: 'Permission to add new assets' },
  { name: 'Edit Assets', category: 'Asset Management', description: 'Permission to edit existing assets' },
  { name: 'Delete Assets', category: 'Asset Management', description: 'Permission to delete assets' },
  
  // Department Management
  { name: 'View Departments', category: 'Department Management', description: 'Permission to view departments' },
  { name: 'Create Departments', category: 'Department Management', description: 'Permission to create departments' },
  { name: 'Edit Departments', category: 'Department Management', description: 'Permission to edit departments' },
  { name: 'Delete Departments', category: 'Department Management', description: 'Permission to delete departments' },
  
  // Analytics & Reports
  { name: 'View Analytics', category: 'Analytics & Reports', description: 'Permission to view analytics dashboard' },
  { name: 'View Reports', category: 'Analytics & Reports', description: 'Permission to view reports' },
  { name: 'Generate Reports', category: 'Analytics & Reports', description: 'Permission to generate new reports' },
  { name: 'Export Reports', category: 'Analytics & Reports', description: 'Permission to export reports' },
  
  // System Settings
  { name: 'View Settings', category: 'System Settings', description: 'Permission to view system settings' },
  { name: 'Edit Settings', category: 'System Settings', description: 'Permission to edit system settings' },
  { name: 'Manage Roles', category: 'System Settings', description: 'Permission to manage roles and permissions' },
  { name: 'Manage Access Levels', category: 'System Settings', description: 'Permission to manage access levels' },
  
  // Audit Logs
  { name: 'View Audit Logs', category: 'Audit Logs', description: 'Permission to view audit logs' },
  { name: 'Export Audit Logs', category: 'Audit Logs', description: 'Permission to export audit logs' },
  { name: 'Delete Audit Logs', category: 'Audit Logs', description: 'Permission to delete audit logs' },
];

async function seedPermissions() {
  try {
    console.log('Starting to seed permission categories and permissions...\n');

    // Step 1: Create or get permission categories
    const categoryMap = {};
    
    for (const categoryName of defaultCategories) {
      let category = await prisma.permissionCategory.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.permissionCategory.create({
          data: {
            name: categoryName,
            status: 'active',
          },
        });
        console.log(`✓ Created category: ${categoryName}`);
      } else {
        console.log(`- Category already exists: ${categoryName}`);
      }
      
      categoryMap[categoryName] = category.id;
    }

    console.log('\n---\n');

    // Step 2: Create permissions
    for (const permission of defaultPermissions) {
      const categoryId = categoryMap[permission.category];
      
      if (!categoryId) {
        console.error(`❌ Category not found: ${permission.category}`);
        continue;
      }

      // Check if permission already exists
      const existing = await prisma.permission.findFirst({
        where: {
          name: permission.name,
          categoryId: categoryId,
        },
      });

      if (!existing) {
        await prisma.permission.create({
          data: {
            name: permission.name,
            categoryId: categoryId,
            description: permission.description,
            status: 'active',
          },
        });
        console.log(`✓ Created permission: ${permission.name} (${permission.category})`);
      } else {
        console.log(`- Skipped existing permission: ${permission.name} (${permission.category})`);
      }
    }

    console.log('\n✅ Permissions seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('Seed script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPermissions };

