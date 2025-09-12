# OralVis Frontend 🖥️

This is the React-based frontend for the **OralVis Healthcare System**. It provides a user-friendly interface for patients to submit their oral health images and for dental professionals to review, annotate, and report on those submissions.

## ✨ Features

-   **Two Distinct User Portals**: Separate, intuitive dashboards for Patients and Admins.
-   **Authentication Flow**: Clean and simple registration and login pages.
-   **Patient Dashboard**:
    -   Easy-to-use form for uploading personal details and 3 required teeth images.
    -   View the status of past submissions (`uploaded`, `annotated`, `reported`).
    -   Download completed PDF reports.
-   **Admin Dashboard**:
    -   Comprehensive list of all patient submissions.
    -   Filter submissions by status.
    -   Advanced annotation tool with drawing capabilities (rectangles) and color-coding for different dental conditions.
    -   Ability to add textual findings and trigger PDF report generation.
-   **Responsive Design**: Functional and visually appealing on both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Library**: React.js
-   **Routing**: React Router
-   **Styling**: CSS with a modular component-based structure.
-   **State Management**: React Hooks (`useState`, `useEffect`)

---

## 🚀 Getting Started

Follow these instructions to get the frontend application running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or later)
-   The [Oralvis-backend](https://github.com/link-to-your-backend-repo) server must be running.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/biplawofficial/Oralvis-frontend.git
    cd Oralvis-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Endpoint:**
    The application is configured to connect to a deployed backend. To connect to your local backend server, you must update the API URLs in the following files:

    -   `src/components/Auth/Login.js`
    -   `src/components/Auth/Register.js`
    -   `src/components/Patient/Submissions.js`
    -   `src/components/Patient/UploadForm.js`
    -   `src/components/Admin/SubmissionsList.js`
    -   `src/components/Admin/AnnotationTool.js`

    Search for `https://oralvis-backend-sgsr.onrender.com/` and replace it with your local backend URL (e.g., `http://localhost:3001`).

4.  **Start the development server:**
    ```bash
    npm start
    ```

The application will open in your browser at `http://localhost:3000`.

### Demo Credentials

You can use the following credentials to test the application:

-   **Admin**:
    -   **Email**: `admin@oralvis.com`
    -   **Password**: `admin123`
-   **Patient**:
    -   **Email**: `patient@oralvis.com`
    -   **Password**: `patient123`

---

## 🖼️ Application Flow

1.  **Registration/Login**: A user registers as either a "Patient" or "Dental Professional" (Admin).
2.  **Patient View**: After logging in, a patient is directed to their dashboard. They can either upload a new submission or view the status of previous ones. When a report is ready, a "Download Report" button appears.
3.  **Admin View**: An admin user sees a dashboard with all patient submissions. They can filter by status.
4.  **Annotation**: Clicking "Annotate" on a submission opens the annotation tool. The admin can view the patient's images, draw colored rectangles to highlight issues, fill out findings, and save the annotations.
5.  **Report Generation**: After annotating, the admin can click "Generate PDF Report," which tells the backend to create and save the final report. The submission status updates to "reported."

## 📜 License
This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
