async function toggleTestLive(testId) {
    const response = await fetch('/teacher/toggle-test-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
    });
    const result = await response.json();
    if (result.success) {
        window.location.reload();
    } else {
        alert('Failed to toggle test status');
    }
}

async function viewTestScores(testId) {
    const response = await fetch(`/teacher/test-scores/${testId}`);
    const result = await response.json();
    if (result.success) {
        const testScoresDetail = document.getElementById('testScoresDetail');
        const selectedTestTitle = document.getElementById('selectedTestTitle');
        const testScoresDetailList = document.getElementById('testScoresDetailList');
        
        selectedTestTitle.textContent = `Scores for ${result.testInfo.subject}`;
        testScoresDetailList.innerHTML = '';
        
        Object.entries(result.testScores).forEach(([studentName, score]) => {
            const li = document.createElement('li');
            li.textContent = `${studentName}: ${score}`;
            testScoresDetailList.appendChild(li);
        });
        
        testScoresDetail.style.display = 'block';
    } else {
        alert('Failed to fetch test scores');
    }
}