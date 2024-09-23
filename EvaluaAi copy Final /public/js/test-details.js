function updateQuestion(index) {
    const newQuestion = prompt("Enter the updated question:");
    if (newQuestion) {
        fetch('/teacher/update-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                testId: new URLSearchParams(window.location.search).get('id'),
                questionIndex: index,
                newQuestion: newQuestion
            }),
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                document.querySelector(`#questionList li:nth-child(${parseInt(index) + 1}) p`).textContent = newQuestion;
            } else {
                alert('Failed to update question');
            }
        });
    }
}