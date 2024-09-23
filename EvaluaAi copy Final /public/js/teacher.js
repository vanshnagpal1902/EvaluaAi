document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadTests();

    // Move all event listeners and initializations here
    const createTestLink = document.getElementById('createTestLink');
    if (createTestLink) {
        createTestLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/teacher/create-test';
        });
    }

    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const question = document.getElementById('questionInput').value;
            const response = await fetch('/teacher/add-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });
            const result = await response.json();
            if (result.success) {
                const li = document.createElement('li');
                li.textContent = question;
                document.getElementById('questionList').appendChild(li);
                document.getElementById('questionInput').value = '';
            } else {
                alert(result.message);
            }
        });
    }

    const newTestForm = document.getElementById('newTestForm');
    if (newTestForm) {
        newTestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subject = document.getElementById('subject').value;
            const duration = document.getElementById('duration').value;
            const questionCount = document.getElementById('questionCount').value;

            const response = await fetch('/teacher/create-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, duration, questionCount }),
            });
            const result = await response.json();
            if (result.success) {
                alert(`Test created with ID: ${result.testId}`);
                loadTests();
            } else {
                alert('Failed to create test');
            }
        });
    }
});

async function loadTests() {
    try {
        const response = await fetch('/teacher/tests');
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
                        <p><strong>Code:</strong> ${test._id}</p>
                        <p><strong>Created:</strong> ${new Date(test.createdAt).toLocaleString()}</p>
                        <p><strong>Duration:</strong> ${test.duration} minutes | <strong>Questions:</strong> ${test.questionCount}</p>
                        <p><strong>Students Attempted:</strong> ${test.studentsAttempted || 0} | <strong>Status:</strong> ${test.isLive ? 'Live' : 'Not Live'}</p>
                    </div>
                    <div class="test-actions">
                        <button onclick="toggleTestLive('${test._id}')">${test.isLive ? 'Make Offline' : 'Make Live'}</button>
                        <button onclick="viewTestScores('${test._id}')">View Scores</button>
                        <button onclick="editTest('${test._id}')">Edit Test</button>
                        <button class="delete-btn" onclick="deleteTest('${test._id}')">Delete Test</button>
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

// Call loadTests when the page loads
document.addEventListener('DOMContentLoaded', loadTests);

async function updateScore(testId, student, questionIndex) {
    const newScore = document.getElementById(`input-${student}-${questionIndex}`).value;
    try {
        const response = await fetch('/teacher/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testId, studentName: student, questionIndex, newScore }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            document.getElementById(`score-${student}-${questionIndex}`).textContent = newScore;
            alert('Score updated successfully');
        } else {
            throw new Error(result.message || 'Failed to update score');
        }
    } catch (error) {
        console.error('Error updating score:', error);
        alert('An error occurred while updating the score: ' + error.message);
    }
}

async function sendScoresToStudent(student) {
    const response = await fetch('/teacher/send-scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName: student }),
    });
    const result = await response.json();
    if (result.success) {
        alert(`Scores sent to ${student} successfully!`);
    } else {
        alert(result.message);
    }
}

async function toggleTestLive(testId) {
    console.log('Toggling test live status for:', testId);
    try {
        const response = await fetch('/teacher/toggle-test-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId }),
        });
        const result = await response.json();
        if (result.success) {
            console.log('Test status toggled successfully');
            loadTests(); // Reload the tests to reflect the changes
        } else {
            console.error('Failed to toggle test status:', result.message);
            alert('Failed to toggle test status: ' + result.message);
        }
    } catch (error) {
        console.error('Error toggling test status:', error);
        alert('An error occurred while toggling test status');
    }
}

function editTest(testId) {
    console.log('Editing test:', testId);
    window.location.href = `/teacher/edit-test/${testId}`;
}

function viewTestScores(testId) {
    console.log('Viewing scores for test:', testId);
    window.location.href = `/teacher/test-scores/${testId}`;
}

async function deleteTest(testId) {
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
        try {
            const response = await fetch(`/teacher/delete-test/${testId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                alert('Test deleted successfully');
                loadTests(); // Reload the tests to reflect the changes
            } else {
                alert('Failed to delete test: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('An error occurred while deleting the test: ' + error.message);
        }
    }
}