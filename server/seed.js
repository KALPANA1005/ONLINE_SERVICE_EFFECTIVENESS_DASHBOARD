// server/seed.js
// Run: node seed.js  (inside /server folder)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Service = require('./models/Service');
const Feedback = require('./models/Feedback');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany({});
  await Service.deleteMany({});
  await Feedback.deleteMany({});
  console.log('Cleared old data...');

  // Create users
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    notifications: [
      { message: 'Welcome to the Admin Dashboard!', read: false },
      { message: 'New feedback submitted by users', read: false },
    ]
  });

  const normalUser = await User.create({
    name: 'John Doe',
    email: 'user@gmail.com',
    password: 'user123',
    role: 'user',
    isActive: true,
    notifications: [
      { message: 'Welcome! Submit your first feedback.', read: false },
      { message: 'New service available: Document Processing', read: true },
    ]
  });

  const user2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@gmail.com',
    password: 'jane1234',
    role: 'user',
    isActive: true,
  });

  console.log('Users created...');

  // Create services
  const services = await Service.insertMany([
    { name: 'Passport Application', description: 'Apply for a new passport or renewal', category: 'Travel', status: 'active', completionRate: 85, avgResponseTime: 72, totalRequests: 150, createdBy: adminUser._id },
    { name: 'Tax Filing Assistance', description: 'Help with annual tax return filing', category: 'Finance', status: 'active', completionRate: 92, avgResponseTime: 48, totalRequests: 230, createdBy: adminUser._id },
    { name: 'Driving License Renewal', description: 'Renew your driving license online', category: 'Transport', status: 'active', completionRate: 78, avgResponseTime: 24, totalRequests: 190, createdBy: adminUser._id },
    { name: 'Birth Certificate', description: 'Apply for birth certificate copy', category: 'Civil', status: 'active', completionRate: 95, avgResponseTime: 96, totalRequests: 80, createdBy: adminUser._id },
    { name: 'Property Registration', description: 'Register property documents online', category: 'Legal', status: 'maintenance', completionRate: 60, avgResponseTime: 120, totalRequests: 45, createdBy: adminUser._id },
    { name: 'Health Card Application', description: 'Apply for government health insurance card', category: 'Health', status: 'active', completionRate: 88, avgResponseTime: 36, totalRequests: 120, createdBy: adminUser._id },
  ]);

  console.log('Services created...');

  // Create feedbacks
  const feedbackData = [
    { user: normalUser._id, service: services[0]._id, rating: 5, comment: 'Very smooth and fast process!', status: 'resolved' },
    { user: normalUser._id, service: services[1]._id, rating: 4, comment: 'Good service, minor delays', status: 'reviewed' },
    { user: normalUser._id, service: services[2]._id, rating: 3, comment: 'Average experience', status: 'pending' },
    { user: user2._id, service: services[0]._id, rating: 5, comment: 'Excellent! Highly recommend', status: 'resolved' },
    { user: user2._id, service: services[3]._id, rating: 2, comment: 'Too many forms required', status: 'reviewed' },
    { user: user2._id, service: services[5]._id, rating: 4, comment: 'Quick and efficient', status: 'pending' },
    { user: normalUser._id, service: services[5]._id, rating: 5, comment: 'Best service I have used', status: 'resolved' },
    { user: user2._id, service: services[1]._id, rating: 3, comment: 'Could be improved', status: 'pending' },
  ];

  for (const fb of feedbackData) {
    await Feedback.create(fb);
  }

  console.log('Feedbacks created...');
  console.log('\n✅ Seed completed successfully!\n');
  console.log('🔐 Login credentials:');
  console.log('   Admin → admin@gmail.com / admin123');
  console.log('   User  → user@gmail.com  / user123');
  console.log('   User2 → jane@gmail.com  / jane1234\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
