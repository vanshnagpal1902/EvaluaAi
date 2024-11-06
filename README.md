
---

# **EvaluaAI**
### Project Overview
EvaluaAI is an AI-driven assessment platform designed for educational institutions, providing teachers with tools to create custom subjective tests and automate the grading process. Students can submit their answers online, which are then evaluated using AI, streamlining the assessment process and reducing the workload on teachers. This platform fosters digital transformation in educational evaluation by ensuring a seamless, paperless, and accessible grading experience.

---

### **Tech Stack**

#### **Frontend:**
- **HTML5**
- **CSS3**
- **JavaScript**
- **EJS (Embedded JavaScript Templates)**

#### **Backend:**
- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web application framework for handling routes and server logic.

#### **Database:**
- **MongoDB**: Database for storing user data, test details, and submissions.
- **Mongoose**: ODM for modeling data and managing schemas.

#### **Session Management & Authentication:**
- **express-session**: For managing user sessions.
- **JWT (JSON Web Tokens)**: For secure, role-based authentication (admin, teacher, student).

#### **AI Evaluation:**
- **Google Generative AI**: Used to evaluate subjective answers, providing feedback and scoring based on AI-driven insights.

---

### **Key Features**

1. **User Authentication & Role-Based Access Control (RBAC):**
   - Secure login and signup system with roles for teachers, students, and admin.
   - JWT-based authentication for secure and role-specific access.

2. **Custom Test Creation and Management:**
   - Teachers can create and manage tests, set deadlines, and define grading criteria.
   - Tests can be customized for subject, type, and level.

3. **AI-Based Answer Evaluation:**
   - Automatically evaluates subjective answers using AI, providing feedback and a grade.
   - Teachers have the option to review AI-generated scores and adjust them if necessary.

4. **Student Portal:**
   - Students can log in to view available tests, submit their answers, and track their progress.
   - Real-time status updates for submitted answers.

5. **Admin Dashboard:**
   - Admins can view and manage users, monitor tests, and oversee student submissions.

6. **Reporting & Analytics:**
   - Teachers can view summaries of student performance.
   - Reports can be downloaded for record-keeping and analysis.

---

### **Installation and Setup**

To run the EvaluaAI platform locally, follow these steps:

#### **Prerequisites**
- Ensure that **Node.js** and **MongoDB** are installed on your system.

#### **Setup Instructions**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/evaluaai.git
   cd evaluaai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root to store environment variables:
   ```plaintext
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/evaluaai?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   AI_API_KEY=your_google_generative_ai_key
   SESSION_SECRET=your_session_secret
   ```

4. **Start the Server**:
   ```bash
   node app.js
   ```

5. **Access the Application**:
   - **Home Page**: [http://localhost:3000](http://localhost:3000)
   - **Teacher Login**: [http://localhost:3000/teacherlogin](http://localhost:3000/teacherlogin)
   - **Student Login**: [http://localhost:3000/studentlogin](http://localhost:3000/studentlogin)
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

### **File Structure**

```
├── public                  # Static files
│   ├── css                 # CSS files for styling
│   └── js                  # JavaScript files for client-side functionality
├── views                   # EJS templates for rendering HTML
│   ├── home.ejs            # Home page
│   ├── login.ejs           # Login page (for students and teachers)
│   ├── admin.ejs           # Admin dashboard
│   ├── signup.ejs          # Student/Teacher signup page
│   ├── testForm.ejs        # Test creation and submission form
│   ├── studentDashboard.ejs # Student dashboard for tracking tests
│   └── teacherDashboard.ejs # Teacher dashboard for test management
├── app.js                # Main server file
└── README.md               # Project documentation
```

---

### **Usage**

1. **Teachers**: Register, create tests, and view student submissions with AI-generated evaluations.
2. **Students**: Register, view available tests, submit answers, and track progress.
3. **Admins**: Manage users, oversee tests, and monitor system activity.

---

### **Contributing**
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

---

### **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

### **Author**
**Vansh Nagpal**

--- 

