# 🌙 AfterHours: The Midnight Social Network

**AfterHours** is a unique, time-sensitive social platform designed for shared late-night thoughts. It's not just another feed—it's a digital space that transforms when the sun goes down.

![Project Banner](https://images.unsplash.com/photo-1532975549065-22d7a5b3a869?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3)

---

## 🌌 Core Concept: Day vs. Night

AfterHours features a dynamic **Night Mode** that changes the entire atmosphere of the application based on real-time clock settings (or Admin control).

*   **By Day**: A serene, video-based ambient background (Rainy Window).
*   **By Night**: An immersive, animated starry sky glassmorphism interface.

## ✨ Key Features

### 🔐 User Experience
*   **Authentication**: Secure login and registration system.
*   **Glassmorphism UI**: Premium, modern interface with blur effects and gradients.
*   **Dynamic Backgrounds**: Visuals that adapt to the time of day.

### ⚙️ Admin Control Panel
*   **Time Travel**: Admins can override the "Night Mode" schedule.
*   **Posting Windows**: Admins set exclusive hours when posting is allowed.
*   **Live Updates**: Changes in the admin panel broadcast immediately to all users.

### 🛠️ Technical Highlights
*   **Local-First Architecture**: Uses robust local storage patterns for offline-capable demos.
*   **React Router**: Seamless Single Page Application (SPA) navigation.
*   **Tailwind CSS**: Rapid, responsive styling.
*   **Vite**: Blazing fast build and development.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/UTSAV1434/AfterHours.git
    cd AfterHours
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in browser** via `http://localhost:3000`

---

## 🎮 How to Demo

1.  **Register**: Go to `/login` and create a new account.
2.  **Admin Panel**: Navigate to `/admin` and login with password: `apyx123`.
3.  **Control Time**: Use the sliders to change "Night Mode" hours.
4.  **Observe**: Watch the background transform instantly!

---

## 🏗️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **State**: Context API + Local Storage Persistence
*   **Backend**: Supabase Edge Functions (Ready for integration)
*   **Deployment**: Vercel

---

*Built for the Hackathon 2026*