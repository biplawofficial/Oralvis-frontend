# OralVis Frontend 🦷

The client-side application for the OralVis Healthcare System. Built with React.js, it provides dashboards for patients to upload images and for dental professionals (admins) to annotate them and generate reports.

## 🛠️ Tech Stack

- **Framework**: React.js
- **Routing**: React Router
- **Canvas/Annotation**: React Konva
- **HTTP Client**: Axios
- **Styling**: CSS Modules / Plain CSS

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- npm (comes with Node.js)

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in this directory:

    ```env
    REACT_APP_BACKEND_URL=http://localhost:3001
    ```

3.  **Start the Application:**
    ```bash
    npm start
    ```
    Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📂 Key Directory Structure

```
src/
├── components/
│   ├── Admin/          # Admin Dashboard & Annotation Tool
│   ├── Auth/           # Login & Registration Forms
│   └── Patient/        # Patient Dashboard & Upload Form
├── App.js              # Main Routing Logic
└── index.js            # Entry Point
```

## 🧪 Testing Credentials

_(Ensure Backend is running and seeded if necessary, or register new users)_

- **Admin**: `admin@oralvis.com` / `admin123`
- **Patient**: `patient@oralvis.com` / `patient123`

## 📜 Scripts

- `npm start`: Runs the app in development mode.
- `npm build`: Builds the app for production to the `build` folder.
