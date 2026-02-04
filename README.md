# 🌙 AfterHours: The Midnight Social Network

**AfterHours** is a unique, time-sensitive social platform designed for shared late-night thoughts. It's not just another feed—it's a digital space that transforms when the sun goes down.

---

## 🌌 Core Concept: Day vs. Night

AfterHours features a dynamic **Night Mode** that changes the entire atmosphere of the application based on real-time clock settings (or Admin control).

*   **By Night**: An immersive, animated starry sky glassmorphism interface.
<img width="1886" height="905" alt="Screenshot 2026-02-04 030609" src="https://github.com/user-attachments/assets/df87d3b1-2cf0-4589-8bfb-65d7f93f54b3" />

*   **By Day**: A serene, video-based ambient background (Rainy Window).
<img width="1916" height="1079" alt="Screenshot 2026-02-04 031153" src="https://github.com/user-attachments/assets/144b1386-8527-4491-bdaa-5ebb94ba1232" />


## ✨ Key Features

### 🔐 User Experience
*    **Night Mode** : Chat section open only at 12AM to 6AM and erases all data after this time period.
*   **12am-5am Night Feed (Persistent)** : Auto-delete posts after 24 hours
*   **Authentication**: Secure login and registration system.
*   **Glassmorphism UI**: Premium, modern interface with blur effects and gradients.
*   **Dynamic Backgrounds**: Visuals that adapt to the time of day.
*   **Lack of Intimacy**: Daytime feeds are noisy and chaotic, lacking a dedicated space for quieter, late-night thoughts.
*   Implement mood reactions (❤️ 😂 😢 😡)
*   Implement category selection (Stress, Love, Rant, Motivation)
*    Add 200 character limit validation
*   Bad words filter function
*   IP rate limiting function
*   Reports table
*   Banned IPs table
*   Active users tracking
*  No login use Anonoymous

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
2.  **Admin Panel**: Navigate to `/admin` and login with password:
3.  **Control Time**: Use the sliders to change "Night Mode" hours.
4.  **Observe**: Watch the background transform instantly!
![WhatsApp Image 2026-02-04 at 07 36 23](https://github.com/user-attachments/assets/db6cd0bb-e3f0-4676-bb9a-b0c45f2090f0)


---

## 🏗️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **State**: Context API + Local Storage Persistence
*   **Backend**: Supabase Edge Functions (Ready for integration)
*   **Deployment**: Vercel

---

*  *Built for the TECHX26 Hackathon*

![WhatsApp Image 2026-02-04 at 07 40 02](https://github.com/user-attachments/assets/76e2c15b-22e8-49f9-b649-4f6209c610db)



  
*  *Team APYX*
![WhatsApp Image 2026-02-04 at 07 40 03](https://github.com/user-attachments/assets/b0a99931-de62-4e86-91d3-692588ea027e)

*  Aryan Pandey (Leader)
*  Utsav Kumnar
*  Pranjal
*  Adarsh Dubey

Deployment Link: https://stellular-nougat-bc4b9f.netlify.app/
