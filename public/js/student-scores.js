document.addEventListener('DOMContentLoaded', loadScores);

async function loadScores() {
    const response = await fetch('/student/scores');
    const result = await response.json();
    if (result.success) {
        const scoreList = document.getElementById('scoreListItems');
        scoreList.innerHTML = '';
        if (Object.keys(result.scores).length === 0) {
            scoreList.innerHTML = '<li>You haven\'t taken any tests yet.</li>';
        } else {
            Object.entries(result.scores).forEach(([testId, testData]) => {
                const li = document.createElement('li');
                const totalScore = testData.scores.reduce((a, b) => a + b, 0);
                li.innerHTML = `
                    <strong>Test ID:</strong> ${testId}<br>
                    <strong>Subject:</strong> ${testData.subject}<br>
                    <strong>Attempted:</strong> ${new Date(testData.attemptedAt).toLocaleString()}<br>
                    <strong>Score:</strong> ${totalScore} / ${testData.scores.length * 10}
                    <button onclick="viewDetailedScore('${testId}')">View Details</button>
                `;
                scoreList.appendChild(li);
            });
        }
    } else {
        alert('Failed to load scores: ' + (result.message || 'Unknown error'));
    }
}

function viewDetailedScore(testId) {
    window.location.href = `/student/detailed-score/${testId}`;
}