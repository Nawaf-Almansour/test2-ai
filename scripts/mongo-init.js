// MongoDB initialization script
// This script runs when the container starts for the first time

// Switch to the school-platform database
db = db.getSiblingDB('school-platform');

// Create the application user
db.createUser({
  user: 'schoolapp',
  pwd: 'schoolpass',
  roles: [
    {
      role: 'readWrite',
      db: 'school-platform'
    }
  ]
});

// Create indexes for registration_requests collection
db.createCollection('registration_requests');

// Create indexes for better query performance
db.registration_requests.createIndex({ "referenceNumber": 1 }, { unique: true });
db.registration_requests.createIndex({ "guardian.mobile": 1 });
db.registration_requests.createIndex({ "guardian.email": 1 });
db.registration_requests.createIndex({ "student.requestedGrade": 1 });
db.registration_requests.createIndex({ "status": 1 });
db.registration_requests.createIndex({ "createdAt": -1 });
db.registration_requests.createIndex({ "status": 1, "createdAt": -1 });

// Insert some sample data (optional - remove for production)
db.registration_requests.insertOne({
  referenceNumber: "REG-2024-000001",
  student: {
    firstName: "Ahmed",
    lastName: "Mohammed",
    dateOfBirth: new Date("2018-04-15"),
    gender: "male",
    nationality: "SA",
    requestedGrade: "GRADE_1"
  },
  guardian: {
    firstName: "Mohammed",
    lastName: "Ali",
    relationship: "father",
    mobile: "+966501234567",
    email: "parent@example.com",
    preferredContactMethod: "whatsapp"
  },
  academic: {
    currentSchool: "Example School",
    requestedGrade: "GRADE_1"
  },
  registrationConsent: true,
  marketingConsent: false,
  status: "SUBMITTED",
  metadata: {
    ipHash: "abc123",
    userAgent: "Mozilla/5.0...",
    language: "en-US"
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialization completed successfully!');