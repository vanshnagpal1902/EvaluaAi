async function updateScore(testId, studentName, questionIndex) {
    const newScore = document.getElementById(`score-${questionIndex}`).value;
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
            alert('Score updated successfully');
        } else {
            alert('Failed to update score: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating score:', error);
        alert('An error occurred while updating the score');
    }
}