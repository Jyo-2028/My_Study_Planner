
        // State
        let currentUser = null;
        let studyPlans = [];

        // DOM Elements
        const loginScreen = document.getElementById('loginScreen');
        const appScreen = document.getElementById('appScreen');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const generateBtn = document.getElementById('generateBtn');
        const subjectInput = document.getElementById('subjectInput');
        const examDateInput = document.getElementById('examDateInput');
        const plansContainer = document.getElementById('plansContainer');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const loginError = document.getElementById('loginError');
        const formError = document.getElementById('formError');

        // Set minimum date to today
        examDateInput.min = new Date().toISOString().split('T')[0];

        // Initialize app
        function init() {
            const savedUser = localStorage.getItem('studyPlannerUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showApp();
                loadStudyPlans();
            }
        }

        // Login
        loginBtn.addEventListener('click', async () => {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
            
            // Simulate login delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create demo user
            currentUser = {
                uid: 'user_' + Date.now(),
                email: 'user@example.com',
                displayName: 'Demo User',
                photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=667eea&color=fff'
            };

            localStorage.setItem('studyPlannerUser', JSON.stringify(currentUser));
            showApp();
            loadStudyPlans();
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            currentUser = null;
            studyPlans = [];
            localStorage.removeItem('studyPlannerUser');
            if (currentUser) {
                localStorage.removeItem('studyPlans_' + currentUser.uid);
            }
            showLogin();
        });

        // Show app screen
        function showApp() {
            loginScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
            userName.textContent = currentUser.displayName;
            userAvatar.src = currentUser.photoURL;
        }

        // Show login screen
        function showLogin() {
            appScreen.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
            `;
        }

        // Generate study plan
        generateBtn.addEventListener('click', async () => {
            const subject = subjectInput.value.trim();
            const examDate = examDateInput.value;

            formError.innerHTML = '';

            if (!subject || !examDate) {
                showError(formError, 'Please enter both subject and exam date');
                return;
            }

            const today = new Date();
            const exam = new Date(examDate);
            const daysUntilExam = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));

            if (daysUntilExam < 1) {
                showError(formError, 'Exam date must be in the future');
                return;
            }

            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="spinner"></span> Generating AI Study Schedule...';

            try {
                const sessions = await generateWithGemini(subject, examDate, daysUntilExam);
                
                const newPlan = {
                    id: 'plan_' + Date.now(),
                    subject,
                    examDate,
                    createdAt: new Date().toISOString(),
                    sessions
                };

                studyPlans.push(newPlan);
                saveStudyPlans();
                renderPlans();

                subjectInput.value = '';
                examDateInput.value = '';
            } catch (error) {
                showError(formError, 'Failed to generate study schedule. Please try again.');
                console.error(error);
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '📅 Generate Study Schedule with AI';
            }
        });

        // Generate study schedule with Gemini AI
        async function generateWithGemini(subject, examDate, daysUntilExam) {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate study sessions
            const sessions = [];
            const topics = generateTopics(subject);
            const weeksToStudy = Math.floor(daysUntilExam / 7);
            const sessionsPerWeek = Math.min(5, Math.ceil(topics.length / weeksToStudy));

            let sessionCount = 0;
            for (let week = 0; week < weeksToStudy && sessionCount < topics.length; week++) {
                for (let day = 0; day < sessionsPerWeek && sessionCount < topics.length; day++) {
                    const sessionDate = new Date();
                    sessionDate.setDate(sessionDate.getDate() + (week * 7) + day + 1);
                    
                    sessions.push({
                        id: 'session_' + Date.now() + '_' + sessionCount,
                        title: topics[sessionCount],
                        date: sessionDate.toISOString().split('T')[0],
                        duration: '2 hours',
                        description: `Study session ${sessionCount + 1}: Focus on ${topics[sessionCount].toLowerCase()}`
                    });
                    sessionCount++;
                }
            }

            return sessions;
        }

        // Generate topics
        function generateTopics(subject) {
            const topics = [
                'Introduction and Fundamentals',
                'Core Concepts Review',
                'Advanced Topics - Part 1',
                'Advanced Topics - Part 2',
                'Practice Problems',
                'Case Studies and Applications',
                'Review and Synthesis',
                'Mock Exam Practice',
                'Weak Areas Focus',
                'Final Comprehensive Review'
            ];
            return topics.map(topic => `${subject} - ${topic}`);
        }

        // Load study plans
        function loadStudyPlans() {
            const stored = localStorage.getItem('studyPlans_' + currentUser.uid);
            if (stored) {
                studyPlans = JSON.parse(stored);
                renderPlans();
            } else {
                renderPlans();
            }
        }

        // Save study plans
        function saveStudyPlans() {
            localStorage.setItem('studyPlans_' + currentUser.uid, JSON.stringify(studyPlans));
        }

        // Render plans
        function renderPlans() {
            if (studyPlans.length === 0) {
                plansContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📅</div>
                        <h3>No study plans yet</h3>
                        <p>Create your first AI-powered study schedule above</p>
                    </div>
                `;
                return;
            }

            plansContainer.innerHTML = studyPlans.map(plan => `
                <div class="plan-card">
                    <div class="plan-header">
                        <div>
                            <h3>${plan.subject}</h3>
                            <p>Exam Date: ${new Date(plan.examDate).toLocaleDateString()}</p>
                        </div>
                        <button class="delete-btn" onclick="deletePlan('${plan.id}')">🗑️ Delete</button>
                    </div>
                    <div class="plan-sessions">
                        ${plan.sessions.map((session, idx) => `
                            <div class="session-item">
                                <div class="session-info">
                                    <div class="session-badges">
                                        <span class="badge">Session ${idx + 1}</span>
                                        <span class="session-date">${formatDate(session.date)}</span>
                                    </div>
                                    <div class="session-title">${session.title}</div>
                                    <div class="session-desc">${session.description}</div>
                                    <div class="session-duration">Duration: ${session.duration}</div>
                                </div>
                                <button class="calendar-btn" onclick='addToCalendar(${JSON.stringify(session)})'>
                                    📥 Add to Calendar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // Delete plan
        window.deletePlan = function(planId) {
            studyPlans = studyPlans.filter(p => p.id !== planId);
            saveStudyPlans();
            renderPlans();
        };

        // Add to calendar
        window.addToCalendar = function(session) {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    
    // Format dates for Google (YYYYMMDDTHHMMSSZ)
    const startDate = session.date.replace(/-/g, '') + 'T090000Z';
    const endDate = session.date.replace(/-/g, '') + 'T110000Z';
    
    const details = encodeURIComponent(session.description);
    const text = encodeURIComponent(session.title);
    
    const googleCalendarUrl = `${baseUrl}&text=${text}&dates=${startDate}/${endDate}&details=${details}&sf=true&output=xml`;
    
    window.open(googleCalendarUrl, '_blank');
};

        // Format date
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Show error
        function showError(element, message) {
            element.innerHTML = `<div class="alert alert-error">${message}</div>`;
            setTimeout(() => {
                element.innerHTML = '';
            }, 5000);
        }

        // Initialize
        init();