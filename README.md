
# AI-Based Test Platform 📝🤖

## Project Description
The **AI-Based Test Platform** is an innovative web application designed to streamline the process of creating, managing, and evaluating subjective tests using artificial intelligence. This platform empowers teachers to easily create tests, assign them to students, and let AI handle the evaluation of complex subjective answers, saving time and ensuring consistent and accurate grading.

### Why This Platform?
Traditional test platforms are primarily focused on objective assessments like multiple-choice questions, while evaluating subjective questions demands extensive manual review. This platform addresses that gap by integrating **Google Generative AI** for automated grading, providing quick and unbiased evaluations for open-ended answers. With role-based access control (RBAC), the platform offers a secure and efficient way for teachers, students, and administrators to collaborate.

## Key Features ✨
- **Create & Manage Subjective Tests**: Teachers can easily create tests with subjective questions that require in-depth written responses.
- **AI-Powered Evaluation**: Uses Google Generative AI to automate the evaluation of subjective answers, ensuring reliable and unbiased results.
- **User Roles & Access Control**:
  - **Admin**: Manages user roles, monitors platform activities, and oversees the test data.
  - **Teacher**: Creates and manages tests, assigns them to students, and reviews AI-generated evaluations.
  - **Student**: Takes assigned tests and reviews their AI-generated scores and feedback.
- **Responsive User Interface**: A clean and intuitive interface built using EJS templates and Node.js/Express on the backend.

## Technology Stack 💻
- **Frontend**: EJS (Embedded JavaScript) for templating and creating dynamic, responsive views.
- **Backend**: Node.js and Express.js for handling server-side logic and routing.
- **Database**: MongoDB for storing user data, test information, and responses.
- **AI Integration**: Google Generative AI for automated subjective test evaluation.
- **Authentication**: JWT-based authentication and role-based access control (RBAC) for secure access and management.

## Getting Started 🚀
### Prerequisites
- Node.js installed on your system
- MongoDB set up locally or a cloud-based MongoDB instance

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-based-test-platform.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd ai-based-test-platform
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up environment variables:**
   Create a `.env` file in the root directory and configure the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_AI_API_KEY=your_google_generative_ai_key
   ```

5. **Run the application:**
   ```bash
   node app.js
   ```

6. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage Instructions
1. **Admin Access:**
   - Manage users and roles.
   - Monitor platform activities.

2. **Teacher Access:**
   - Create and configure subjective tests.
   - Assign tests to students.
   - Review and refine AI-generated evaluations.

3. **Student Access:**
   - Take tests assigned by teachers.
   - View AI-evaluated results and feedback.

## Project Structure 📂
```
ai-based-test-platform/
├── views/           # EJS templates for frontend views
├── routes/          # Express routes for different user roles
├── controllers/     # Logic for handling requests and responses
├── models/          # Mongoose models for database schema
├── public/          # Static files like CSS and images
├── app.js           # Main server file
├── .env             # Environment variables
└── README.md        # Project documentation
```

## Contributing 🤝
Contributions are welcome! If you have suggestions for improving the platform or want to report a bug, feel free to open an issue or submit a pull request.

## License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact 📧
For any questions or suggestions, feel free to reach out:
- **Email**: vanshnagpal0123@gmail.com
- **GitHub**: https://github.com/vanshnagpal1902

