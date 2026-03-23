# E-commerce Platform

A modern, full-stack e-commerce platform specifically designed for baby products, built with cutting-edge technologies and best practices.

## 🚀 Project Overview

Babymart is a comprehensive e-commerce solution featuring four main applications:

- **Admin Dashboard** - Manage products, orders, and analytics
- **Client Website** - Customer-facing shopping experience
- **Mobile App** - Native mobile shopping application
- **Backend Server** - RESTful API with comprehensive features

## 🏗️ Architecture

```
Babymart-yt/
├── admin/          # React + Vite Admin Dashboard
├── client/         # Next.js Customer Website
├── mobileapp/      # React Native Mobile App
└── server/         # Node.js + Express API Backend
```

## 🛠️ Technology Stack

### Frontend

- **Admin Dashboard**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Client Website**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Mobile App**: React Native + TypeScript + Expo

### Backend

- **Server**: Node.js + Express.js + MongoDB + JWT Authentication
- **File Storage**: Cloudinary integration
- **API Documentation**: Swagger/OpenAPI

### State Management & UI

- **State**: Zustand for all applications
- **UI Components**: Radix UI, shadcn/ui, Lucide React icons
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios (admin/mobile), Fetch API (client)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### 1. Clone the Repository

```bash
git clone https://github.com/noorjsdivs/Babymart-yt.git
cd Babymart-yt
```

### 2. Setup Backend Server

```bash
cd server
npm install
cp .env.example .env  # Configure your environment variables
npm run dev  # Starts on http://localhost:8000
```

### 3. Setup Client Website

```bash
cd client
npm install
npm run dev  # Starts on http://localhost:3000
```

### 4. Setup Admin Dashboard

```bash
cd admin
npm install
npm run dev  # Starts on http://localhost:5173
```

### 5. Setup Mobile App

```bash
cd mobileapp
npm install
npm start  # Follow React Native CLI instructions
```

## 📱 Application Details

### 🖥️ Admin Dashboard (Port 5173)

**Purpose**: Complete administrative control panel

- **Technology**: React + Vite + TypeScript
- **Features**: Product management, order processing, analytics, user management
- **Access**: `http://localhost:5173`
- **Start Command**: `npm run dev`

**What you'll see**: A clean admin interface with placeholder content explaining the admin dashboard purpose. Simply remove the placeholder text and start building your admin features.

### 🌐 Client Website (Port 3000)

**Purpose**: Customer-facing e-commerce website

- **Technology**: Next.js + TypeScript
- **Features**: Product browsing, shopping cart, user authentication, order tracking
- **Access**: `http://localhost:3000`
- **Start Command**: `npm run dev`

**What you'll see**: A modern e-commerce homepage with project information. Remove the intro text to start customizing for your needs.

### 📱 Mobile App

**Purpose**: Native mobile shopping experience

- **Technology**: React Native + TypeScript
- **Features**: Mobile-optimized shopping, push notifications, offline support
- **Start Command**: `npm start`

**What you'll see**: A React Native app ready for mobile e-commerce development with placeholder content explaining the mobile app structure.

### 🔧 Backend Server (Port 8000)

**Purpose**: RESTful API backend

- **Technology**: Node.js + Express + MongoDB
- **Features**: Authentication, product management, order processing, file uploads
- **Access**: `http://localhost:8000`
- **Start Command**: `npm run dev`

**API Documentation**: Visit `http://localhost:8000/api-docs` for Swagger documentation

## 🔧 Configuration

### Environment Variables

Each application requires specific environment variables:

#### Server (.env)

```bash
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/Babymart
JWT_SECRET=your-jwt-secret
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173
```

#### Client (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

#### Admin (.env)

```bash
VITE_API_URL=http://localhost:8000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

See `configuration.md` for complete environment setup details.

## 📋 Features Overview

### Admin Dashboard

- 📊 Analytics & Reports
- 📦 Product Management (CRUD)
- 🛍️ Order Management
- 👥 User Management
- 🏷️ Category & Brand Management
- 📸 Image Upload & Management
- 💳 Payment Processing
- 🔐 Role-based Access Control

### Client Website

- 🛒 Shopping Cart & Checkout
- 🔍 Product Search & Filtering
- 👤 User Authentication & Profile
- 📱 Responsive Design
- ⭐ Product Reviews & Ratings
- 💝 Wishlist Functionality
- 📋 Order History
- 🎯 Category Browsing

### Mobile App

- 📱 Native Mobile Experience
- 🔔 Push Notifications
- 📴 Offline Support
- 📍 Location Services
- 📷 Camera Integration
- 🔄 Sync with Web Platform

### Backend API

- 🔐 JWT Authentication
- 📡 RESTful API Design
- 📊 MongoDB Integration
- ☁️ Cloudinary File Storage
- 📝 Comprehensive Logging
- 🔄 Request Validation
- 📖 Swagger Documentation

## 🚀 Deployment

### Development

All applications are configured for local development with hot reload enabled.

### Production

Ready for deployment on:

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, DigitalOcean, AWS
- **Database**: MongoDB Atlas
- **Mobile**: App Store & Google Play Store

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Documentation

- **Setup Guide**: See `setup.md` for detailed installation instructions
- **Configuration**: See `configuration.md` for environment variables
- **Architecture**: See `baseContext.md` for detailed project structure
- **API Docs**: Available at `http://localhost:8000/api-docs` when server is running

## 🔮 Upcoming Features

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] AI-powered product recommendations
- [ ] Social media integration
- [ ] Advanced inventory management
- [ ] Multi-vendor marketplace support

## 📞 Support

If you have any questions or need help with setup:

- 📧 Create an issue in this repository
- 📖 Check the documentation files
- 💬 Join our community discussions

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and performance
- Following industry best practices
- Ready for production deployment

---

**Happy Coding! 🚀**

> **Note**: This is a complete e-commerce platform template. Remove the placeholder content from each application's homepage and start building your custom features!
