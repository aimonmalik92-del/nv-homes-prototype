const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const closeModal = document.getElementById('closeModal');
const authModal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const authOptions = document.getElementById('authOptions');
const switchText = document.getElementById('switchText');
const switchAuth = document.getElementById('switchAuth');

let isLoginMode = true;

// Sidebar toggle
if (menuBtn && sidebar) menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    menuBtn.classList.toggle('open');
});

// Login / Sign-up popup (only runs on pages that still have it)
if (signInBtn && signUpBtn && authModal) {
    // Open Login
    signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = true;
        updateModal();
        authModal.classList.add('active');
    });

    // Open Signup
    signUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = false;
        updateModal();
        authModal.classList.add('active');
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        authModal.classList.remove('active');
    });

    // Close when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });

    // Switch between Login / Signup
    switchAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateModal();
    });

    // Update Modal Content
    function updateModal() {
        if (isLoginMode) {
            modalTitle.textContent = "Log into your account";
        
            authOptions.innerHTML = `
                <button class="login-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="Google">
                    Login with Google
                </button>
                <button class="login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Login with X
                </button>
                <button class="login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Login with Apple
                </button>
                <button class="login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Login with email
                </button>
            `;

            switchText.innerHTML = `Don't have an account? <a href="#" id="switchAuth">Sign up</a>`;
        } else {
            modalTitle.textContent = "Create your account";
        
            authOptions.innerHTML = `
                <button class="login-btn primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Sign up with X
                </button>
                <button class="login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Sign up with email
                </button>
                <button class="login-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Sign up with Apple
                </button>
                <button class="login-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="Google">
                    Sign up with Google
                </button>
            `;

            switchText.innerHTML = `Already have an account? <a href="#" id="switchAuth">Sign in</a>`;
        }

        // Re-attach switch event
        document.getElementById('switchAuth').addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateModal();
        });
    }
}

// Chips
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        // Special case: "Calculate Your House Budget" opens the Cost Calculator page
        if (chip.id === 'calculateBudgetChip') {
            window.location.href = 'calculate-budget.html';
            return;
        }
        // Special case: "Track Your Real-Time Construction Budget" opens the Budget Tracking System page
        if (chip.id === 'budgetTrackerChip') {
            window.location.href = 'budget-tracking-system.html';
            return;
        }
        // Special case: "Quality Checklist for Your House Construction" opens the Quality Checklists page
        if (chip.id === 'qualityChecklistChip') {
            window.location.href = 'quality-checklist.html';
            return;
        }
        // Special case: "Track Real-Time Progress of Your Project" opens the Project Timeline (Gantt) page
        if (chip.id === 'progressTimelineChip') {
            window.location.href = 'progress-timeline.html';
            return;
        }
        document.getElementById('searchInput').value = chip.textContent;
        document.getElementById('searchInput').focus();
    });
});

// Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) alert("You asked: " + query);
    }
});

// Send button
document.querySelector('.send-btn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) alert("You asked: " + query);
});