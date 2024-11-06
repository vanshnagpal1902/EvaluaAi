document.addEventListener('DOMContentLoaded', () => {
    const editTestForm = document.getElementById('editTestForm');
    const questionCountInput = document.getElementById('questionCount');
    
    if (questionCountInput) {
        questionCountInput.addEventListener('change', updateQuestionInputs);
    }
    
    if (editTestForm) {
        editTestForm.addEventListener('submit', handleFormSubmit);
    }
});

function updateQuestionInputs() {
    const questionCount = parseInt(document.getElementById('questionCount').value);
    const questionInputs = document.getElementById('questionInputs');
    const currentQuestions = questionInputs.querySelectorAll('textarea');
    
    // Save current question values
    const currentValues = Array.from(currentQuestions).map(q => q.value);
    
    // Clear existing inputs
    questionInputs.innerHTML = '';
    
    // Create new inputs
    for (let i = 0; i < questionCount; i++) {
        const textarea = document.createElement('textarea');
        textarea.id = `question${i}`;
        textarea.name = `question${i}`;
        textarea.placeholder = `Question ${i + 1}`;
        textarea.required = true;
        textarea.value = currentValues[i] || ''; // Preserve existing values
        questionInputs.appendChild(textarea);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const testId = document.getElementById('testId').value;
    const subject = document.getElementById('subject').value;
    const duration = document.getElementById('duration').value;
    const questionCount = document.getElementById('questionCount').value;
    const questions = Array.from(document.querySelectorAll('#questionInputs textarea')).map(textarea => textarea.value);

    try {
        const response = await fetch(`/teacher/update-test/${testId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject,
                duration,
                questionCount,
                questions
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert('Test updated successfully');
            window.location.href = '/teacher';
        } else {
            throw new Error(result.message || 'Failed to update test');
        }
    } catch (error) {
        console.error('Error updating test:', error);
        alert('An error occurred while updating the test: ' + error.message);
    }
}