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