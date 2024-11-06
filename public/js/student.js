window.onpopstate = function(event) {
    if (document.getElementById('quiz').style.display !== 'none') {
        event.preventDefault();
        if (confirm('Are you sure you want to leave the test? Your progress will be lost.')) {
            window.location.href = '/student';
        } else {
            history.pushState(null, '', window.location.pathname);
        }
    }
};

let currentTest = null;
let currentQuestion = 0;
let answers = [];
let timer = null;

document.addEventListener('DOMContentLoaded', () => {
    loadTests();

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            answers[currentQuestion] = document.getElementById('answerInput').value;
            currentQuestion--;
            updateQuestion();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            answers[currentQuestion] = document.getElementById('answerInput').value;
            if (currentQuestion < currentTest.questions.length - 1) {
                currentQuestion++;
                updateQuestion();
            } else {
                // Last question reached, show submit button
                nextBtn.style.display = 'none';
                if (submitBtn) submitBtn.style.display = 'inline';
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', submitTest);
    }
});

async function loadTests() {
    try {
        const response = await fetch('/student/live-tests');
        const result = await response.json();
        if (result.success) {
            const testList = document.getElementById('testListItems');
            testList.innerHTML = '';
            result.tests.forEach((test) => {
                const div = document.createElement('div');
                div.className = 'test-item';
                div.innerHTML = `
                    <div class="test-info">
                        <h3>${test.subject}</h3>
                        <p><strong>Duration:</strong> ${test.duration} minutes | <strong>Questions:</strong> ${test.questionCount}</p>
                    </div>
                    <div class="test-code-input">
                        <input type="text" id="testCode-${test._id}" placeholder="Enter Test Code" maxlength="6">
                        <button onclick="verifyTestCode('${test._id}')">Start Test</button>
                    </div>
                `;
                testList.appendChild(div);
            });
        } else {
            console.error('Failed to load tests:', result.message);
        }
    } catch (error) {
        console.error('Error loading tests:', error);
    }
}

async function verifyTestCode(testId) {
    const testCode = document.getElementById(`testCode-${testId}`).value.trim().toUpperCase();
    if (testCode.length !== 6) {
        alert('Please enter a valid 6-character test code.');
        return;
    }

    console.log('Sending verification request for:', { testId, code: testCode });

    try {
        const response = await fetch('/student/verify-test-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testId, code: testCode }),
        });
        const result = await response.json();
        console.log('Verification result:', result);
        if (result.success) {
            console.log('Test code verified successfully');
            startTest(result.testId);
        } else {
            console.error('Invalid test code:', result.message);
            if (result.message === 'Test is not currently active') {
                alert('This test is not currently active. Please contact your teacher.');
            } else {
                alert('Invalid test code. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error verifying test code:', error);
        alert('An error occurred while verifying the test code.');
    }
}

async function startTest(testId) {
    try {
        const response = await fetch(`/student/start-test/${testId}`);
        const result = await response.json();
        if (result.success) {
            currentTest = result.test;
            initializeTestUI();
        } else {
            alert('Failed to start the test: ' + result.message);
        }
    } catch (error) {
        console.error('Error starting test:', error);
        alert('An error occurred while starting the test.');
    }
}

function initializeTestUI() {
    // Hide the test list and show the quiz interface
    document.getElementById('testList').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    
    // Initialize the first question
    currentQuestion = 0;
    answers = new Array(currentTest.questionCount).fill('');
    updateQuestion();
    
    // Start the timer
    startTimer(currentTest.duration * 60);
}

function startTimer(duration) {
    let timeLeft = duration;
    updateTimerDisplay(timeLeft);
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            autoSubmitTest();
        }
    }, 1000);
}

function updateTimerDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function autoSubmitTest() {
    alert('Time is up! Your test will be submitted automatically.');
    await submitTest();
}

async function submitTest() {
    clearInterval(timer);
    answers[currentQuestion] = document.getElementById('answerInput').value;
    console.log("Submitting answers:", answers);
    console.log("Current test:", currentTest);
    
    // Ensure all questions are answered
    if (answers.some(answer => answer.trim() === '')) {
        alert('Please answer all questions before submitting.');
        return;
    }
    
    try {
        const response = await fetch('/student/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                testId: currentTest._id,
                answers: answers
            }),
        });
        console.log("Submit response:", response);
        if (!response.ok) {
            const errorText = await response.text();
            console.log("Error response text:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const result = await response.json();
        if (result.success) {
            alert('Test submitted successfully!');
            window.location.href = '/student';
        } else {
            alert('Failed to submit answers: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting test:', error);
        alert('An error occurred while submitting the test: ' + error.message);
    }
}

function updateQuestion() {
    console.log('Updating question:', currentQuestion);
    console.log('Current test:', currentTest);
    if (currentTest && Array.isArray(currentTest.questions) && currentQuestion < currentTest.questions.length) {
        document.getElementById('questionText').textContent = `Question ${currentQuestion + 1}: ${currentTest.questions[currentQuestion]}`;
        document.getElementById('answerInput').value = answers[currentQuestion] || '';
        document.getElementById('prevBtn').style.display = currentQuestion > 0 ? 'inline' : 'none';
        document.getElementById('nextBtn').style.display = currentQuestion < currentTest.questions.length - 1 ? 'inline' : 'none';
        document.getElementById('submitBtn').style.display = currentQuestion === currentTest.questions.length - 1 ? 'inline' : 'none';
    } else {
        console.error('Question not found or end of test reached:', currentQuestion);
        console.error('Current test:', currentTest);
        if (currentTest && currentQuestion >= currentTest.questions.length) {
            // End of test reached
            document.getElementById('quiz').style.display = 'none';
            document.getElementById('result').style.display = 'block';
        } else {
            alert('An error occurred while loading the question. Please try again.');
        }
    }
}

document.getElementById('prevBtn').addEventListener('click', () => {
    answers[currentQuestion] = document.getElementById('answerInput').value;
    currentQuestion--;
    updateQuestion();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    answers[currentQuestion] = document.getElementById('answerInput').value;
    if (currentQuestion < currentTest.questions.length - 1) {
        currentQuestion++;
        updateQuestion();
    } else {
        // Last question reached, show submit button
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline';
    }
});

document.getElementById('submitBtn').addEventListener('click', submitTest);