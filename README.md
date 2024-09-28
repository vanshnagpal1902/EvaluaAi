# **AI-Based Quiz Platform**

## **Table of Contents**
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## **Project Overview**
The AI-Based Quiz Platform is a web application designed for teachers and students to streamline the process of creating and taking quizzes. The platform allows teachers to create tests, add subjective questions, and automatically evaluate student answers using AI technology. Students can access live tests, submit answers, and view scores once the teacher releases them. The platform uses Google Generative AI for evaluating subjective questions and provides real-time scoring.

## **Features**
1. **Role-Based Access Control (RBAC):**
   - Admin, Teacher, and Student roles with different privileges.
2. **Authentication and Authorization:**
   - JWT-based authentication for secure user sessions.
3. **Teacher Functionality:**
   - Create and manage tests.
   - Add subjective questions (up to 10 per test).
   - View, edit, and toggle test availability.
   - Evaluate student submissions using AI.
   - View and release scores to students.
4. **Student Functionality:**
   - View live tests.
   - Submit test answers.
   - View scores once released.
5. **Automatic Answer Evaluation:**
   - Integrates with Google Generative AI to assess subjective questions.
6. **Test Management:**
   - Store and manage tests and questions using MongoDB.

## **Tech Stack**
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: Google Generative AI (Gemini)
- **Authentication**: JWT (JSON Web Tokens)
- **Session Management**: express-session
- **Other Libraries**: Mongoose, bcrypt.js (for password hashing)

## **Getting Started**
### **Prerequisites**
Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (local or cloud-based)
- [Git](https://git-scm.com/) (optional, for cloning the repository)

### **Installation**
1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ai-based-quiz-platform.git
    cd ai-based-quiz-platform
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the necessary environment variables (see [Environment Variables](#environment-variables)).

4. Start your MongoDB server (or use a cloud-based MongoDB instance).

## **Running the Application**
1. Start the server:

    ```bash
    npm start
    ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## **Folder Structure**
```
ai-based-quiz-platform/
├── public/                  # Static assets
├── src/
│   ├── models/              # Mongoose models
│   ├── routes/              # Express route handlers
│   ├── controllers/         # Controllers for handling business logic
│   ├── middlewares/         # Custom middleware functions
│   ├── views/               # EJS templates for server-side rendering
│   └── index.js             # Main server entry point
├── .env                     # Environment variables
├── package.json             # Node.js dependencies and scripts
└── README.md                # Project documentation
```

## **API Routes**
### **Authentication**
- `POST /signup` – Register a new user.
- `POST /login` – Authenticate and log in a user.

### **Teacher Routes**
- `GET /teacher` – Teacher dashboard.
- `POST /teacher/create-test` – Create a new test.
- `POST /teacher/add-question` – Add questions to a test.
- `GET /teacher/view-tests` – View all tests created by the teacher.
- `POST /teacher/toggle-test-live` – Toggle the availability of a test.
- `POST /teacher/send-score` – Release scores for a student.

### **Student Routes**
- `GET /student` – Student dashboard.
- `GET /student/live-tests` – View live tests.
- `POST /student/submit` – Submit test answers.
- `GET /student/view-scores` – View scores once released.

## **Environment Variables**
Create a `.env` file in the root directory and add the following environment variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quiz-platform
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

## **Future Improvements**
- **Improved User Interface:** Enhance the UI with React components for better user experience.
- **Additional Role Management:** Add more roles such as 'Principal' or 'Parent' for monitoring student performance.
- **Notifications:** Integrate email notifications for test updates and score releases.
- **Performance Optimization:** Optimize database queries and session handling.
- **Comprehensive Test Analysis:** Include more detailed reports and analytics for teachers.

## **Contributing**
Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new feature branch (`feature-branch-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a Pull Request.

## **License**
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---
