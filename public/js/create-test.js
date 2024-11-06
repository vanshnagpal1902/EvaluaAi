let currentTestId = '';

document.getElementById('newTestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject').value;
    const duration = document.getElementById('duration').value;
    const questionCount = document.getElementById('questionCount').value;

    try {
        const response = await fetch('/teacher/create-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, duration, questionCount }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            currentTestId = result.testId;
            document.getElementById('testCode').textContent = result.testCode;
            document.getElementById('newTestForm').style.display = 'none';
            document.getElementById('questionForm').style.display = 'block';
            createQuestionInputs(parseInt(questionCount));
        } else {
            throw new Error(result.message || 'Failed to create test');
        }
    } catch (error) {
        console.error('Error creating test:', error);
        alert('Failed to create test: ' + error.message);
    }
});

function createQuestionInputs(count) {
    const container = document.getElementById('questionInputs');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('textarea');
        input.placeholder = `Question ${i + 1}`;
        input.required = true;
        container.appendChild(input);
    }
}

document.getElementById('submitQuestions').addEventListener('click', async () => {
    const questions = Array.from(document.getElementById('questionInputs').children)
        .map(input => input.value);
    
    try {
        const response = await fetch('/teacher/add-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId: currentTestId, questions }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            alert('Test created successfully with questions!');
            window.location.href = '/teacher';
        } else {
            throw new Error(result.message || 'Failed to add questions');
        }
    } catch (error) {
        console.error('Error adding questions:', error);
        alert('Failed to add questions: ' + error.message);
    }
});