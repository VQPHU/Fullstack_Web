# E-commerce Platform

A modern, full-stack e-commerce platform specifically designed for baby products, built with cutting-edge technologies and best practices.

## 🚀 Project Overview

Babymart is a comprehensive e-commerce solution featuring three main applications:

* **Admin Dashboard** - Manage products, orders, and analytics
* **Client Website** - Customer-facing shopping experience
* **Backend Server** - RESTful API with comprehensive features

## 🏗️ Architecture

```bash
Babymart-yt/
├── admin/          # React + Vite Admin Dashboard
├── client/         # Next.js Customer Website
└── server/         # Node.js + Express API Backend
```

## 🛠️ Technology Stack

### Frontend

* **Admin Dashboard**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
* **Client Website**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui

### Backend

* **Server**: Node.js + Express.js + MongoDB + JWT Authentication
* **Authentication**: JWT + Google OAuth + OTP Verification
* **File Storage**: Cloudinary integration
* **API Documentation**: Swagger/OpenAPI

### State Management & UI

* **State**: Zustand for all applications
* **UI Components**: Radix UI, shadcn/ui, Lucide React icons
* **Forms**: React Hook Form + Zod validation
* **HTTP Client**: Axios and Fetch API

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm or yarn
* MongoDB (local or Atlas)
* Cloudinary account (for image storage)

### 1. Clone the Repository

```bash
git clone https://github.com/VQPHU/Fullstack_Web.git
cd Fullstack_Web
```

### 2. Setup Backend Server

```bash
cd server
npm install
npm run dev
```

Server runs at:

```bash
http://localhost:8000
```

### 3. Setup Client Website

```bash
cd client
npm install
npm run dev
```

Client runs at:

```bash
http://localhost:3000
```

### 4. Setup Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

Admin dashboard runs at:

```bash
http://localhost:5173
```

## 🔧 Environment Variables

### Server (.env)

```bash
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/baby

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_URL=http://localhost:5173
CLIENT_URL=http://localhost:3000

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

GOOGLE_CLIENT_ID=your_google_client_id
```

### Client (.env.local)

```bash
API_ENDPOINT=http://localhost:8000/api
NEXT_PUBLIC_API_URL=http://localhost:8000/api

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Admin (.env)

```bash
VITE_API_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173

VITE_APP_ENV=development
```

## 📋 Features Overview

### Admin Dashboard

* 📊 Analytics & Reports
* 📦 Product Management (CRUD)
* 🛍️ Order Management
* 👥 User Management
* 🏷️ Category & Brand Management
* 📸 Image Upload & Management
* 💳 Payment Processing
* 🔐 Role-based Access Control
* 👨‍💼 Employee & Salary Management
* 🔔 Notification Management

### Client Website

* 🛒 Shopping Cart & Checkout
* 🔍 Product Search & Filtering
* 👤 User Authentication & Profile
* 🔑 OTP Password Reset
* 🟢 Google OAuth Login
* 📱 Responsive Design
* ⭐ Product Reviews & Ratings
* 💝 Wishlist Functionality
* 📋 Order History
* 🎯 Category Browsing

### Backend API

* 🔐 JWT Authentication
* 🌍 Google OAuth Integration
* 📡 RESTful API Design
* 📊 MongoDB Integration
* ☁️ Cloudinary File Storage
* 📧 Nodemailer Email Service
* 🔄 OTP Verification System
* 📝 Request Validation
* 📖 Swagger Documentation

## 🚀 Deployment

### Development

All applications are configured for local development with hot reload enabled.

### Production

Ready for deployment on:

* **Frontend**: Vercel, Netlify, or any static hosting
* **Backend**: Railway, Render, VPS Server
* **Database**: MongoDB Atlas

## 📞 Support

If you have any questions or need help with setup:

* 📧 Create an issue in this repository
* 📖 Check the documentation files
* 💬 Contact: 0973594598

## 📜 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

* Built with modern web technologies
* Designed for scalability and performance
* Following industry best practices
* Ready for production deployment

---

**Happy Coding! 🚀**
