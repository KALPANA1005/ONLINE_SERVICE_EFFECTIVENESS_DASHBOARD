const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/feedback', require('./routes/feedback'));
app.get('/', (req, res) => res.json({ message: 'Server running!' }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const PORT = process.env.PORT || 8080;

const seedData = async () => {
  const User = require('./models/User');
  const Service = require('./models/Service');
  const Feedback = require('./models/Feedback');

  const existing = await User.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('✅ Demo data already exists - skipping seed');
    return;
  }

  console.log('🌱 Seeding demo data...');

  const admin = await User.create({ name: 'Admin User', email: 'admin@gmail.com', password: 'admin123', role: 'admin', isActive: true });
  const user1 = await User.create({ name: 'John Doe', email: 'user@gmail.com', password: 'user123', role: 'user', isActive: true });
  const user2 = await User.create({ name: 'Jane Smith', email: 'jane@gmail.com', password: 'jane1234', role: 'user', isActive: true });

  const svcs = await Service.insertMany([
    { name: 'Passport Application', description: 'Apply for new passport or renewal', category: 'Travel', status: 'active', completionRate: 85, avgResponseTime: 72, totalRequests: 150, createdBy: admin._id },
    { name: 'Tax Filing Assistance', description: 'Help with annual tax return filing', category: 'Finance', status: 'active', completionRate: 92, avgResponseTime: 48, totalRequests: 230, createdBy: admin._id },
    { name: 'Driving License Renewal', description: 'Renew your driving license online', category: 'Transport', status: 'active', completionRate: 78, avgResponseTime: 24, totalRequests: 190, createdBy: admin._id },
    { name: 'Birth Certificate', description: 'Apply for birth certificate copy', category: 'Civil', status: 'active', completionRate: 95, avgResponseTime: 96, totalRequests: 80, createdBy: admin._id },
    { name: 'Health Card Application', description: 'Apply for government health insurance card', category: 'Health', status: 'active', completionRate: 88, avgResponseTime: 36, totalRequests: 120, createdBy: admin._id },
    { name: 'Property Registration', description: 'Register property documents online', category: 'Legal', status: 'active', completionRate: 60, avgResponseTime: 120, totalRequests: 45, createdBy: admin._id },
  ]);

  await Feedback.insertMany([
    { user: user1._id, service: svcs[0]._id, rating: 5, comment: 'Very smooth and fast!', status: 'resolved' },
    { user: user1._id, service: svcs[1]._id, rating: 4, comment: 'Good service, minor delays', status: 'reviewed' },
    { user: user1._id, service: svcs[2]._id, rating: 3, comment: 'Average experience', status: 'pending' },
    { user: user2._id, service: svcs[0]._id, rating: 5, comment: 'Excellent! Highly recommend', status: 'resolved' },
    { user: user2._id, service: svcs[3]._id, rating: 2, comment: 'Too many forms required', status: 'reviewed' },
    { user: user2._id, service: svcs[4]._id, rating: 4, comment: 'Quick and efficient', status: 'pending' },
  ]);

  console.log('✅ Demo data seeded successfully!');
  console.log('   👤 admin@gmail.com / admin123');
  console.log('   👤 user@gmail.com  / user123');
};

const startServer = async () => {
  await connectDB();
  await seedData();
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Server start failed:', err);
  process.exit(1);
});
