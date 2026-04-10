<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Smart Campus Operations Hub</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      background: #f9f9f9;
      color: #333;
    }
    h1, h2, h3 {
      color: #111;
    }
    h1 {
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
    }
    code {
      background: #eee;
      padding: 3px 6px;
      border-radius: 4px;
    }
    .section {
      margin-bottom: 30px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
  </style>
</head>
<body>

<h1>Smart Campus Operations Hub</h1>

<div class="section card">
  <h2>📌 Project Overview</h2>
  <p>
    Smart Campus Operations Hub is a full-stack web application designed to manage campus resources,
    bookings, issue reporting, and maintenance operations efficiently.
  </p>
  <p>
    The system supports multiple user roles including <b>Users, Admins, and Technicians</b>, each with
    dedicated dashboards and functionalities.
  </p>
</div>

<div class="section card">
  <h2>🎯 Objectives</h2>
  <ul>
    <li>Efficient resource booking system</li>
    <li>Issue reporting with image support</li>
    <li>Real-time notifications</li>
    <li>Role-based access control</li>
    <li>Improved campus maintenance workflow</li>
  </ul>
</div>

<div class="section card">
  <h2>🧑‍💻 User Roles</h2>

  <h3>👤 User (Lecturers / Staff)</h3>
  <ul>
    <li>Browse resources</li>
    <li>Request bookings</li>
    <li>Report issues with images</li>
    <li>Track tickets</li>
    <li>Add comments</li>
    <li>Receive notifications</li>
  </ul>

  <h3>🛠 Technician</h3>
  <ul>
    <li>View assigned issues</li>
    <li>Start and resolve issues</li>
    <li>Add resolution notes</li>
    <li>Track progress</li>
  </ul>

  <h3>🧑‍💼 Admin</h3>
  <ul>
    <li>Manage resources (CRUD)</li>
    <li>Approve / reject bookings</li>
    <li>Assign technicians</li>
    <li>Monitor system analytics</li>
    <li>View all issues and users</li>
  </ul>
</div>

<div class="section card">
  <h2>⚙️ System Features</h2>
  <ul>
    <li>Google OAuth2 Login</li>
    <li>Role-based Dashboard Routing</li>
    <li>Booking Approval Workflow</li>
    <li>Issue Tracking System</li>
    <li>Image Upload for Issues</li>
    <li>Comment System (CRUD with ownership)</li>
    <li>Notification System</li>
    <li>Analytics Dashboard</li>
    <li>AI Chatbot Integration (Bonus Feature)</li>
  </ul>
</div>

<div class="section card">
  <h2>📊 Innovative Features</h2>
  <ul>
    <li>📈 Analytics Insights for each user role</li>
    <li>🤖 AI Chatbot for user assistance</li>
    <li>📷 Issue reporting with image support</li>
    <li>💬 Comment system with ownership rules</li>
    <li>🔔 Real-time notification indicators</li>
  </ul>
</div>

<div class="section card">
  <h2>🛠 Tech Stack</h2>

  <h3>Frontend</h3>
  <ul>
    <li>React.js (Vite)</li>
    <li>Material UI</li>
    <li>Axios</li>
  </ul>

  <h3>Backend</h3>
  <ul>
    <li>Spring Boot</li>
    <li>Spring Security (OAuth2)</li>
    <li>REST APIs</li>
  </ul>

  <h3>Database</h3>
  <ul>
    <li>MongoDB</li>
  </ul>
</div>

<div class="section card">
  <h2>🔐 Authentication Flow</h2>
  <ul>
    <li>User logs in using Google</li>
    <li>Backend determines role (USER / ADMIN / TECHNICIAN)</li>
    <li>System redirects to role-based dashboard</li>
  </ul>
</div>

<div class="section card">
  <h2>📂 Modules</h2>
  <ul>
    <li>Resource Management</li>
    <li>Booking Management</li>
    <li>Issue Management</li>
    <li>Comment System</li>
    <li>Notification System</li>
  </ul>
</div>

<div class="section card">
  <h2>🚀 How to Run</h2>

  <h3>Frontend</h3>
  <code>
    npm install <br>
    npm run dev
  </code>

  <h3>Backend</h3>
  <code>
    mvn spring-boot:run
  </code>

</div>

<div class="section card">
  <h2>📌 Future Improvements</h2>
  <ul>
    <li>Real-time notifications using WebSockets</li>
    <li>File storage (Cloud instead of local)</li>
    <li>Advanced analytics dashboards</li>
    <li>Mobile application version</li>
  </ul>
</div>

<div class="section card">
  <h2>👥 Team Contribution</h2>
  <ul>
    <li>Frontend Development</li>
    <li>Backend API Development</li>
    <li>Authentication & Security</li>
    <li>AI Chatbot Integration</li>
    <li>Testing & Debugging</li>
  </ul>
</div>

<div class="section card">
  <h2>📎 Conclusion</h2>
  <p>
    The Smart Campus Operations Hub improves campus efficiency by centralizing resource management,
    issue tracking, and communication between users, admins, and technicians.
  </p>
</div>

</body>
</html>
