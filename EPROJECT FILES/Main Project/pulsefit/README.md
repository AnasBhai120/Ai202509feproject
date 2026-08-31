# PulseFit — MERN Fitness Mobile App & Admin Panel

PulseFit is a modern, full-stack Fitness Mobile Application and Admin Portal built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS, TypeScript, and JWT-based authentication.

---

## ⚡ Tech Stack

- **Frontend (User Application & Admin Panel)**: React 19, Tailwind CSS v4, Lucide Icons, Recharts, Canvas Confetti.
- **Backend (REST API)**: Node.js, Express.js, Mongoose, JWT, bcryptjs, Multer.
- **Database**: MongoDB (`mongodb://127.0.0.1:27017/fitness`) with memory fallback store.
- **Build System**: Vite, TypeScript, `tsx`, `esbuild`.

---

## 🚀 Key Features

### 🏋️ User Mobile Experience
1. **Interactive Dashboard**:
   - Live daily streak counter with animated fire badge.
   - Calories burned vs. Target budget calculation.
   - Interactive water tracker (log glasses & liters with 1-click controls).
   - Real-time BMI and body mass calculator widget.
   - 7-day activity & calorie burn progression chart.
   - Recommended daily workouts & post-workout high-protein meals.

2. **Active Workout Engine with Audio-Visual Interval Timers**:
   - Interactive modal timer with sound effects, set-by-set completion checklists.
   - Rest timer between sets (30s, 45s, 60s, 90s).
   - Real-time burned calorie tally.
   - Post-workout celebration modal with confetti explosion.

3. **Workout Programs & Exercise Library**:
   - Categorized by Full Body, Upper Body, Lower Body, Core, Cardio & HIIT, Strength.
   - Difficulty tiers (Beginner, Intermediate, Advanced).
   - Movement anatomy guides with step-by-step form instructions.

4. **Nutrition & Macro Tracking**:
   - Daily calorie budget progress bar and remaining calorie calculation.
   - Macro breakdown: Protein, Carbohydrates, and Fats.
   - Healthy recipe catalog with 1-click "Log to Today".
   - Custom food/meal entry form.

5. **Progress & Analytics**:
   - Area chart showing historical weight trends and BMI changes.
   - Circumference metrics tracking (Chest, Waist, Arms, Body Fat %).
   - Historic logs table with delete actions.

6. **Fitness Calculators**:
   - Body Mass Index (BMI).
   - Basal Metabolic Rate (BMR) with Mifflin-St Jeor formula.
   - Total Daily Energy Expenditure (TDEE).
   - Daily Calorie Target by goal (Fat loss, Muscle gain, Maintenance).
   - Target Heart Rate Training Zones (Fat Burn, Aerobic, Anaerobic, Max Effort).

7. **Notification Center & Favorites**:
   - Real-time community announcements, workout tips, and hydration reminders.
   - Bookmark workouts, exercises, and recipes into organized tabs.

---

### 🛡️ Admin Management Dashboard
1. **Analytics & Performance Overview**:
   - Visual charts: User growth over time, goal distribution, popular routines, completion stats.
2. **User Account Management**:
   - Table of athletes with role-based filtering (User vs. Admin).
   - Block/Unblock toggle, Role Promotion/Demotion, full profile inspector.
3. **Workout Program Catalog Builder**:
   - Create/edit workouts with dynamic exercise sequence builder (sets, reps, rest intervals).
4. **Exercise Library Manager**:
   - Add/edit movements with muscle groups, equipment, and form instructions.
5. **Nutrition & Meal Catalog**:
   - Create healthy recipes with calorie counts, macros, and prep times.
6. **Taxonomy & Category Manager**:
   - Manage workout categories, muscle groups, equipment, and meal tags.
7. **Broadcast Push Notifications**:
   - Send system announcements to all athletes or targeted roles.
8. **1-Click Database Reset & Re-Seed**:
   - CLI script (`npm run seed`) and Admin UI button to instantly populate realistic workouts, exercises, meals, and users.

---

## 🛠️ Installation & Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally at `mongodb://127.0.0.1:27017` (or MongoDB Compass)

### 2. Environment Setup
Configure your `.env` file (copied from `.env.example`):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/fitness
JWT_SECRET=super_secret_jwt_fitness_token_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Default Database Records
```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🔑 Default Demo Accounts

- **Regular Athlete User**:
  - Email: `user@fitness.com`
  - Password: `Password123!`
- **Administrator**:
  - Email: `admin@fitness.com`
  - Password: `Admin123!`

*(Quick 1-click demo login buttons are also built directly into the login modal for instant preview!)*
