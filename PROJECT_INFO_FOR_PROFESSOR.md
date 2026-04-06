# Healthy Plate & Budget Meal Planner — Project Documentation

## Project Overview
A web-based meal planning application that helps users build healthy, budget-friendly Indian meal plates with nutritional tracking and personalized recommendations.

**Live URL:** https://aditya2601-star.github.io/healthy-plate-and-budget-meal-planner/

---

## Technology Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JavaScript   |
| Backend/Auth| Firebase Authentication (v10.12.2)|
| Database    | Firebase Firestore (cloud NoSQL)  |
| Dataset     | Indian Food Composition CSV (24MB)|
| Hosting     | GitHub Pages                      |

---

## Backend — Firebase Configuration

The project uses **Firebase** as the Backend-as-a-Service (BaaS).

### Firebase Project Details
- **Project ID:** `hpbm-ad2601`
- **Auth Domain:** `hpbm-ad2601.firebaseapp.com`
- **API Key:** `AIzaSyDI7IdnrH5cX86qLLjsIfk7IcVX-X8Ut7I`
- **Storage Bucket:** `hpbm-ad2601.firebasestorage.app`
- **Messaging Sender ID:** `625867213132`
- **App ID:** `1:625867213132:web:50c421229735f190c627e9`

### Firebase Console Access
To view user data, authentication records, and Firestore database:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with the project owner's Google account
3. Select project **"hpbm-ad2601"**

### Authentication Methods Enabled
- **Email/Password** — users sign up with email and password
- **Google Sign-In** — OAuth via Google popup

### User Data Storage
- **Firebase Auth** — stores user credentials (email, hashed password, display name)
- **localStorage** — stores session data (`hp_currentUser` key) with name, email, and profile picture
- **Firebase Firestore** — cloud database for persistent user preferences and meal data

---

## Project Files

| File                      | Description                                           |
|---------------------------|-------------------------------------------------------|
| `index.html`              | Landing page with project features and onboarding     |
| `login.html`              | Authentication page (Sign In / Sign Up / Google Auth) |
| `dashboard.html`          | Main app — meal planner, food database, nutrition tracker |
| `style.css`               | Global styles for the landing page                    |
| `script.js`               | Landing page JavaScript logic                         |
| `recipes_data.js`         | Processed Indian food/recipe dataset (JS module)      |
| `process_csv.py`          | Python script to convert CSV dataset → JS format      |
| `IndianFoodDatasetCSV.csv`| Raw Indian food composition dataset (24MB)            |

---

## How to Run Locally
1. Open the project folder
2. Use **VS Code Live Server** or any local HTTP server
3. Open `index.html` in browser
4. Firebase auth requires HTTP (not `file://`) — use Live Server or deploy

---

## GitHub Repository
https://github.com/Aditya2601-STAR/healthy-plate-and-budget-meal-planner
