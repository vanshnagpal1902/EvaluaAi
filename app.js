const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// MongoDB connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'CSQuizGame';

let db;

// Connect to MongoDB
MongoClient.connect(url)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    
    // Create collections if they don't exist
    db.createCollection('users');
    db.createCollection('tests');
    db.createCollection('students');
    db.createCollection('questions');
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));

app.set('view engine', 'ejs');

// Add this line right before the static middleware
console.log('Setting up static middleware');

app.use(express.static(path.join(__dirname, 'public')));

// Add this line right after the static middleware
console.log('Static middleware set up');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyCitMnZEbOA7O3knQJLrfFjl8CFu9Kpp6U");

// Add this near the top of your file, after your imports
let currentTestId = 1000;

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  const user = await db.collection('users').findOne({ username, password, role });
  if (user) {
    req.session.user = { username, role };
    res.redirect(role === 'teacher' ? '/teacher' : '/student');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  const existingUser = await db.collection('users').findOne({ username });
  if (existingUser) {
    res.render('signup', { error: 'Username already exists' });
  } else {
    await db.collection('users').insertOne({ username, password, role });
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/teacher', (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    res.render('teacher', { user: req.session.user, path: '/teacher' });
  } else {
    res.redirect('/login');
  }
});

app.post('/teacher/add-question', async (req, res) => {
  const questions = await db.collection('questions').find().toArray();
  if (questions.length < 10) {
    await db.collection('questions').insertOne({ text: req.body.question, id: Date.now() });
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Maximum 10 questions allowed' });
  }
});

app.get('/student', (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    res.render('student', { user: req.session.user, path: '/student' });
  } else {
    res.redirect('/login');
  }
});

app.post('/student/submit', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { testId, answers } = req.body;
  const studentName = req.session.user.username;

  console.log('Received submission:', { testId, answers, studentName });

  try {
    const test = await db.collection('tests').findOne({ _id: testId });

    if (!test) {
      console.log('Test not found:', testId);
      return res.status(400).json({ success: false, message: 'Invalid test ID' });
    }

    if (!Array.isArray(answers) || answers.length !== test.questionCount || answers.some(answer => answer.trim() === '')) {
      console.log('Invalid answers format:', answers);
      return res.status(400).json({ success: false, message: 'Invalid answers format or missing answers' });
    }

    // Use Gemini AI to evaluate answers
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    let scores = [];

    for (let i = 0; i < answers.length; i++) {
      const question = test.questions[i];
      const answer = answers[i];
      const prompt = `Question: ${question}\nStudent Answer: ${answer}\nEvaluate the answer and provide a score from 0 to 10, where 0 is completely incorrect and 10 is perfect. Only respond with the numeric score.`;

      try {
        const result = await model.generateContent(prompt);
        const score = parseInt(result.response.text().trim());
        scores.push(isNaN(score) ? 0 : Math.min(10, Math.max(0, score)));
      } catch (error) {
        console.error('Error evaluating answer:', error);
        scores.push(0);
      }
    }

    // Update the student's document in the database
    await db.collection('students').updateOne(
      { username: studentName },
      {
        $set: {
          [`testScores.${testId}`]: scores,
          [`testAnswers.${testId}`]: {
            answers,
            submittedAt: new Date().toISOString()
          }
        }
      },
      { upsert: true }
    );

    console.log('Submission successful:', { studentName, testId, scores });
    // Redirect to the student dashboard after successful submission
    res.redirect('/student');
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing the submission' });
  }
});

// Modify the '/teacher/create-test' route
app.post('/teacher/create-test', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const { subject, duration, questionCount, questions } = req.body;
    currentTestId++;
    const testId = `#${currentTestId}`;
    const testCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    try {
      const newTest = {
        _id: testId,
        code: testCode,
        subject,
        duration: parseInt(duration),
        questionCount: parseInt(questionCount),
        questions: questions || [], // Ensure questions is an array, even if empty
        isLive: false,
        createdAt: new Date().toISOString()
      };
      console.log('Inserting new test:', newTest);
      await db.collection('tests').insertOne(newTest);
      
      res.json({ success: true, testId, testCode });
    } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ success: false, message: 'An error occurred while creating the test' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/teacher/tests', async (req, res) => {
  try {
    const tests = await db.collection('tests').find().toArray();
    const students = await db.collection('students').find().toArray();
    
    const testsWithAttempts = tests.map(test => ({
      ...test,
      studentsAttempted: students.filter(student => 
        student.testScores && student.testScores[test._id]
      ).length
    }));
    
    res.json({ success: true, tests: testsWithAttempts });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching tests' });
  }
});

app.post('/teacher/toggle-test-live', async (req, res) => {
  const { testId } = req.body;
  try {
    const test = await db.collection('tests').findOne({ _id: testId });
    
    if (test) {
      await db.collection('tests').updateOne(
        { _id: testId },
        { $set: { isLive: !test.isLive } }
      );
      res.json({ success: true, isLive: !test.isLive });
    } else {
      res.json({ success: false, message: 'Test not found' });
    }
  } catch (error) {
    console.error('Error toggling test status:', error);
    res.status(500).json({ success: false, message: 'An error occurred while toggling test status' });
  }
});

app.get('/student/live-tests', async (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    try {
      const liveTests = await db.collection('tests').find({ isLive: true }).toArray();
      const student = await db.collection('students').findOne({ username: req.session.user.username });
      const attemptedTests = student && student.testScores ? Object.keys(student.testScores) : [];
      
      res.json({ success: true, tests: liveTests, attemptedTests });
    } catch (error) {
      console.error('Error fetching live tests:', error);
      res.status(500).json({ success: false, message: 'An error occurred while fetching live tests' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/teacher/create-test', (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    res.render('create-test', { user: req.session.user, path: '/teacher/create-test' });
  } else {
    res.redirect('/login');
  }
});

app.get('/teacher/view-tests', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const tests = await db.collection('tests').find().toArray();
    res.render('view-tests', { user: req.session.user, tests });
  } else {
    res.redirect('/login');
  }
});

app.get('/teacher/view-test-scores', (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const tests = JSON.parse(fs.readFileSync('./data/tests.json', 'utf8'));
    res.render('view-test-scores', { user: req.session.user, tests });
  } else {
    res.redirect('/login');
  }
});

// Update other routes to use testCode instead of testId
app.get('/teacher/test-scores/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const testId = req.params.testId;
    try {
      const test = await db.collection('tests').findOne({ _id: testId });
      const students = await db.collection('students').find().toArray();
      
      if (test) {
        const testScores = students.reduce((acc, student) => {
          if (student.testScores && student.testScores[testId]) {
            acc[student.username] = {
              scores: student.testScores[testId],
              answers: student.testAnswers[testId].answers,
              submittedAt: student.testAnswers[testId].submittedAt
            };
          }
          return acc;
        }, {});
        
        console.log('Test scores fetched:', testScores);
        res.render('test-scores', { user: req.session.user, test, testId, testScores });
      } else {
        res.redirect('/teacher');
      }
    } catch (error) {
      console.error('Error fetching test scores:', error);
      res.status(500).send('An error occurred while fetching test scores');
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/teacher/student-answers/:testId/:studentName', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    let { testId, studentName } = req.params;
    testId = testId.startsWith('#') ? testId : '#' + testId;
    try {
      const test = await db.collection('tests').findOne({ _id: testId });
      const student = await db.collection('students').findOne({ username: studentName });
      
      if (!test) {
        return res.status(404).send('Test not found');
      }
      
      if (!student) {
        return res.status(404).send('Student not found');
      }
      
      const studentAnswers = student.testAnswers && student.testAnswers[testId] ? student.testAnswers[testId].answers : [];
      const testScores = student.testScores && student.testScores[testId] ? student.testScores[testId] : [];
      
      res.render('student-answers', { 
        user: req.session.user, 
        test, 
        testId, 
        studentName, 
        studentAnswers, 
        testScores 
      });
    } catch (error) {
      console.error('Error fetching student answers:', error);
      res.status(500).send('An error occurred while fetching student answers');
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/teacher/edit-test/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const testId = '#' + req.params.testId;
    try {
      const test = await db.collection('tests').findOne({ _id: testId });
      if (test) {
        res.render('edit-test', { user: req.session.user, test, testId, path: '/teacher/edit-test' });
      } else {
        res.status(404).send('Test not found');
      }
    } catch (error) {
      console.error('Error fetching test for editing:', error);
      res.status(500).send('An error occurred while fetching the test');
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/teacher/update-test/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const testId = '#' + req.params.testId;
    const { subject, duration, questionCount, questions } = req.body;
    try {
      console.log('Updating test:', testId, { subject, duration, questionCount, questions });
      const result = await db.collection('tests').updateOne(
        { _id: testId },
        { $set: { 
          subject, 
          duration: parseInt(duration), 
          questionCount: parseInt(questionCount), 
          questions 
        }}
      );
      console.log('Update result:', result);
      if (result.matchedCount === 0) {
        res.status(404).json({ success: false, message: 'Test not found' });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the test' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.post('/teacher/send-score', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const { testId, studentName } = req.body;
    try {
      const result = await db.collection('students').updateOne(
        { username: studentName },
        { $set: { [`releasedScores.${testId}`]: true } }
      );
      
      if (result.modifiedCount === 1) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Student or test not found' });
      }
    } catch (error) {
      console.error('Error sending score:', error);
      res.status(500).json({ success: false, message: 'An error occurred while sending the score' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/student/view-scores', async (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    const studentName = req.session.user.username;
    try {
      const student = await db.collection('students').findOne({ username: studentName });
      const tests = await db.collection('tests').find().toArray();
      
      const scores = {};
      if (student && student.testScores) {
        for (const [testId, testScores] of Object.entries(student.testScores)) {
          if (student.releasedScores && student.releasedScores[testId]) {
            const test = tests.find(t => t._id === testId);
            if (test) {
              scores[testId] = {
                subject: test.subject,
                attemptedAt: student.testAnswers[testId].submittedAt,
                scores: testScores
              };
            }
          }
        }
      }
      
      res.render('view-scores', { user: req.session.user, scores, path: '/student/view-scores' });
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).send('An error occurred while fetching scores');
    }
  } else {
    res.redirect('/login');
  }
});

app.post('/student/verify-test-code', async (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    const { testId, code } = req.body;
    try {
      console.log('Searching for test with:', { testId, code });
      const test = await db.collection('tests').findOne({
        $or: [
          { _id: testId, code: { $regex: new RegExp(`^${code}$`, 'i') }, isLive: true },
          { code: { $regex: new RegExp(`^${code}$`, 'i') }, isLive: true }
        ]
      });
      console.log('Test found:', test);
      if (test) {
        res.json({ success: true, testId: test._id });
      } else {
        // Check if the test exists but is not live
        const inactiveTest = await db.collection('tests').findOne({
          $or: [
            { _id: testId, code: { $regex: new RegExp(`^${code}$`, 'i') } },
            { code: { $regex: new RegExp(`^${code}$`, 'i') } }
          ]
        });
        if (inactiveTest) {
          res.json({ success: false, message: 'Test is not currently active' });
        } else {
          res.json({ success: false, message: 'Invalid test code' });
        }
      }
    } catch (error) {
      console.error('Error verifying test code:', error);
      res.status(500).json({ success: false, message: 'An error occurred while verifying the test code' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/student/start-test/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    let testId = req.params.testId;
    testId = testId.startsWith('#') ? testId : '#' + testId;
    try {
      const test = await db.collection('tests').findOne({ _id: testId, isLive: true });
      if (test) {
        console.log('Test found:', test);
        const totalMarks = test.questionCount * 10; // Assuming each question is worth 10 marks
        res.render('start-test', { 
          user: req.session.user, 
          test: {
            _id: test._id,
            subject: test.subject,
            duration: test.duration,
            questionCount: test.questionCount,
            questions: test.questions,
            totalMarks: totalMarks // Add total marks
          }
        });
      } else {
        res.status(404).send('Test not found or not active');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      res.status(500).send('An error occurred while starting the test');
    }
  } else {
    res.redirect('/login');
  }
});

// Add this new route
app.delete('/teacher/delete-test/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const { testId } = req.params;
    try {
      const result = await db.collection('tests').deleteOne({ _id: testId });
      if (result.deletedCount === 1) {
        // Also remove the test scores and answers from students
        await db.collection('students').updateMany(
          {},
          { 
            $unset: { 
              [`testScores.${testId}`]: "",
              [`testAnswers.${testId}`]: "",
              [`releasedScores.${testId}`]: ""
            }
          }
        );
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Test not found' });
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      res.status(500).json({ success: false, message: 'An error occurred while deleting the test' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.post('/teacher/add-questions', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const { testId, questions } = req.body;
    try {
      const result = await db.collection('tests').updateOne(
        { _id: testId },
        { $set: { questions: questions } }
      );
      if (result.modifiedCount === 1) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Test not found' });
      }
    } catch (error) {
      console.error('Error adding questions:', error);
      res.status(500).json({ success: false, message: 'An error occurred while adding questions' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.post('/teacher/update-score', async (req, res) => {
  if (req.session.user && req.session.user.role === 'teacher') {
    const { testId, studentName, questionIndex, newScore } = req.body;
    try {
      const result = await db.collection('students').updateOne(
        { username: studentName },
        { $set: { [`testScores.${testId}.${questionIndex}`]: parseInt(newScore) } }
      );
      
      if (result.modifiedCount === 1) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Student or test not found' });
      }
    } catch (error) {
      console.error('Error updating score:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the score' });
    }
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/student/detailed-score/:testId', async (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    const testId = req.params.testId;
    const studentName = req.session.user.username;
    try {
      const test = await db.collection('tests').findOne({ _id: testId });
      const student = await db.collection('students').findOne({ username: studentName });
      
      if (test && student && student.testScores && student.testScores[testId]) {
        const scores = student.testScores[testId];
        const answers = student.testAnswers[testId].answers;
        const attemptedAt = student.testAnswers[testId].submittedAt;
        const totalScore = scores.reduce((a, b) => a + b, 0);
        
        res.render('student-detailed-score', {
          user: req.session.user,
          test,
          testId,
          scores,
          answers,
          attemptedAt,
          totalScore,
          path: '/student/detailed-score'
        });
      } else {
        res.redirect('/student/view-scores');
      }
    } catch (error) {
      console.error('Error fetching detailed score:', error);
      res.status(500).send('An error occurred while fetching the detailed score');
    }
  } else {
    res.redirect('/login');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});