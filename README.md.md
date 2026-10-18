Restaurant Management System

A full-stack restaurant management web application built using the MERN stack to manage restaurant operations through customer, admin, and waiter functionalities.

Features

User Authentication: Secure access for different user roles.

Menu Management: Manage food items and their details.

Order Management: Create orders and manage order status.

Table Management: View and manage restaurant tables.

Waiter Management: Allow waiters to handle assigned orders and customer requests.

Online Payments: Process customer payments.

Digital Receipts: Generate PDF receipts after successful payments.

Real-Time Updates: Update order status using Socket.IO.

Admin Dashboard: Manage restaurant operations from one place.

Tech Stack

Frontend: React.js, HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Real-Time Communication: Socket.IO

Tools: Git, GitHub, Postman

Project Structure

frontend/ — React application

backend/ — Express.js APIs and server-side logic

Installation and Setup

1. Clone the repository

git clone https://github.com/girish200097/restaurant-management-system
cd restaurant-management-system

2. Set up the backend

cd backend
npm install

Configure the required environment variables in a .env file, then start the backend using the scripts defined in package.json.

3. Set up the frontend

Open a new terminal:

cd frontend
npm install
npm run dev

Environment Variables

Configure the required values in your local .env file, such as your MongoDB connection string, authentication secrets, and payment credentials.

Never commit .env files or secret credentials to GitHub.

Author

Girish Kundagol

GitHub: https://github.com/girish200097