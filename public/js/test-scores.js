async function sendScoreToStudent(testId, studentName) {
    try {
        const response = await fetch('/teacher/send-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId, studentName }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            alert('Score sent to student successfully!');
        } else {
            alert('Failed to send score: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error sending score:', error);
        alert('An error occurred while sending the score: ' + error.message);
    }
}

async function updateScore(studentName, testId, questionIndex) {
    const newScore = document.getElementById(`input-${studentName}-${questionIndex}`).value;
    try {
        const response = await fetch('/teacher/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testId, studentName, questionIndex, newScore }),
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById(`score-${studentName}-${questionIndex}`).textContent = newScore;
            alert('Score updated successfully');
        } else {
            alert('Failed to update score: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating score:', error);
        alert('An error occurred while updating the score');
    }
}