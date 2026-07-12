# Exotic Café - Management System

A premium, real-time café management application built with React, Node.js, and Supabase.

## 🚀 Quick Start

1. **Prerequisites**: Ensure you have Node.js installed.
2. **Setup Supabase**:
   - Create a project on [Supabase](https://supabase.com/).
   - Run the provided `supabase_schema.sql` script in the Supabase SQL Editor.
   - Copy your project URL and Anon Key into the `.env` file.
3. **Setup Backend**:
   - `cd server`
   - `npm install`
   - `node server.js` (Running on port 3001)
4. **Setup Frontend**:
   - `npm install`
   - `npm run dev` (Running on port 5173)

## 📱 Key Features

### For Customers:
- **QR Entry**: Scan table QR codes to start your session.
- **Booking Guard**: Real-time detection of table reservations to prevent double-seating.
- **Self-Ordering**: Beautiful, categorized menu with search and voice-search features.
- **Loyalty System**: Track visits and gain points automatically.
- **Entertainment Hub**: Play games, watch films, or listen to radio while waiting.
- **Real-time Tracking**: Watch your order progress from 'Received' to 'Ready'.

### For Admin:
- **Live Kitchen**: Instant notification of new orders.
- **Table Heatmap**: Visual status of all tables (Free, Occupied, Reserved).
- **Customer Insights**: Track frequent regulars, their visits, and lifetime value (LTV).
- **Payment Log**: Detailed history of all UPI and Cash transactions.
- **Manual Bookings**: Create and manage table reservations directly from the dashboard.
- **Waiter Alerts**: Receive instant notifications when a customer needs service.

## 🛠️ Tech Stack
- **Frontend**: React.js, Lucide Icons, Recharts (Analytics).
- **Backend**: Node.js, Express.
- **Database**: Supabase (PostgreSQL).
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System).

## 👮 Admin Roles & Access

Access the Admin Panel at `http://localhost:5173/admin`. The system supports role-based management:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager` | `aura2026` | **Full Control** (All 11 modules + System Config) |
| **Kitchen/Staff** | `staff` | `staff123` | **Operations only** (Orders, Kitchen, Alerts) |

---

## 🔒 Security & Persistence
- **OTP Authentication**: Secure login via mobile number for guests.
- **Role-Based Guards**: Admin Dashboard is protected via `StaffProtectedRoute`.
- **Session Recovery**: Table and User info persist through refreshes using LocalStorage and Sync loops.
- **Database Sync**: Polling system ensures all devices see the same data in real-time.
