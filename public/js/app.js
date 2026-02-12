/* =================== STUDENT MANAGEMENT SYSTEM - SPA =================== */

// =================== CONFIG ===================
const API_BASE = '/api';
let authToken = localStorage.getItem('sms_token');
let currentUser = JSON.parse(localStorage.getItem('sms_user') || 'null');

// =================== TOAST SYSTEM ===================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// =================== API SERVICE ===================
async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// =================== AUTH ===================
function checkAuth() {
    if (authToken && currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('welcomeText').textContent = `Welcome, ${currentUser.username}`;
    loadDashboardData();
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showToast('Please fill in all fields.', 'warning');
        return;
    }

    try {
        const data = await apiRequest('/auth/login', 'POST', { username, password });
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('sms_token', authToken);
        localStorage.setItem('sms_user', JSON.stringify(currentUser));
        showToast('Login successful!', 'success');
        showDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    showLogin();
    document.getElementById('loginForm').reset();
}

// =================== NAVIGATION ===================
function navigateTo(sectionName) {
    // Update nav
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`section-${sectionName}`);
    if (target) {
        target.classList.add('active');
    }

    // Update page title
    const titles = {
        overview: 'Dashboard',
        students: 'Students',
        courses: 'Courses',
        enrollments: 'Enrollments'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

    // Load data for the section
    if (sectionName === 'students') loadStudents();
    else if (sectionName === 'courses') loadCourses();
    else if (sectionName === 'enrollments') loadEnrollments();
    else if (sectionName === 'overview') loadDashboardData();
}

// =================== DASHBOARD OVERVIEW ===================
async function loadDashboardData() {
    try {
        const [students, courses, enrollments] = await Promise.all([
            apiRequest('/students'),
            apiRequest('/courses'),
            apiRequest('/enrollments')
        ]);

        document.getElementById('statStudents').textContent = students.length;
        document.getElementById('statCourses').textContent = courses.length;
        document.getElementById('statEnrollments').textContent = enrollments.length;

        // Show recent 5 students
        const recent = students.slice(0, 5);
        const tbody = document.getElementById('recentStudentsBody');
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No students yet.</td></tr>';
        } else {
            tbody.innerHTML = recent.map(s => `
        <tr>
          <td class="td-name">${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td>${s.phone || '—'}</td>
          <td>${formatDate(s.created_at)}</td>
        </tr>
      `).join('');
        }
    } catch (err) {
        showToast('Error loading dashboard data.', 'error');
    }
}

// =================== STUDENTS ===================
let studentsData = [];

async function loadStudents() {
    try {
        const search = document.getElementById('studentSearch').value.trim();
        const sortValue = document.getElementById('studentSort').value;
        const [sortBy, order] = sortValue.split('-');

        let queryParams = `?sortBy=${sortBy}&order=${order}`;
        if (search) queryParams += `&search=${encodeURIComponent(search)}`;

        studentsData = await apiRequest(`/students${queryParams}`);
        renderStudentsTable();
    } catch (err) {
        showToast('Error loading students.', 'error');
    }
}

function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');

    if (studentsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No students found.</td></tr>';
        return;
    }

    tbody.innerHTML = studentsData.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="td-name">${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${formatDate(s.dob)}</td>
      <td>${s.phone || '—'}</td>
      <td>${formatDate(s.created_at)}</td>
      <td>
        <div class="td-actions">
          <button class="btn-icon edit" title="Edit" onclick="openEditStudent(${s.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Delete" onclick="deleteStudent(${s.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddStudent() {
    document.getElementById('studentModalTitle').textContent = 'Add Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    openModal('studentModal');
}

async function openEditStudent(id) {
    try {
        const student = await apiRequest(`/students/${id}`);
        document.getElementById('studentModalTitle').textContent = 'Edit Student';
        document.getElementById('studentId').value = student.id;
        document.getElementById('firstName').value = student.first_name;
        document.getElementById('lastName').value = student.last_name;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentDob').value = student.dob ? student.dob.split('T')[0] : '';
        document.getElementById('studentPhone').value = student.phone || '';
        document.getElementById('studentAddress').value = student.address || '';
        openModal('studentModal');
    } catch (err) {
        showToast('Error loading student data.', 'error');
    }
}

async function saveStudent() {
    const id = document.getElementById('studentId').value;
    const data = {
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        dob: document.getElementById('studentDob').value,
        phone: document.getElementById('studentPhone').value.trim(),
        address: document.getElementById('studentAddress').value.trim()
    };

    // Frontend validation
    if (!data.first_name || !data.last_name || !data.email || !data.dob) {
        showToast('Please fill in all required fields.', 'warning');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showToast('Please enter a valid email address.', 'warning');
        return;
    }

    if (data.phone && !/^[\d\s\-\+\(\)]{7,15}$/.test(data.phone)) {
        showToast('Please enter a valid phone number.', 'warning');
        return;
    }

    try {
        if (id) {
            await apiRequest(`/students/${id}`, 'PUT', data);
            showToast('Student updated successfully!', 'success');
        } else {
            await apiRequest('/students', 'POST', data);
            showToast('Student added successfully!', 'success');
        }
        closeModal('studentModal');
        loadStudents();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student? This will also remove all their enrollments.')) return;

    try {
        await apiRequest(`/students/${id}`, 'DELETE');
        showToast('Student deleted successfully.', 'success');
        loadStudents();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// =================== COURSES ===================
let coursesData = [];

async function loadCourses() {
    try {
        coursesData = await apiRequest('/courses');
        renderCoursesTable();
    } catch (err) {
        showToast('Error loading courses.', 'error');
    }
}

function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');

    if (coursesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No courses found.</td></tr>';
        return;
    }

    tbody.innerHTML = coursesData.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="td-name">${escapeHtml(c.course_name)}</td>
      <td>${escapeHtml(c.course_code)}</td>
      <td>${c.credits}</td>
      <td>
        <div class="td-actions">
          <button class="btn-icon edit" title="Edit" onclick="openEditCourse(${c.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Delete" onclick="deleteCourse(${c.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddCourse() {
    document.getElementById('courseModalTitle').textContent = 'Add Course';
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    openModal('courseModal');
}

async function openEditCourse(id) {
    try {
        const course = await apiRequest(`/courses/${id}`);
        document.getElementById('courseModalTitle').textContent = 'Edit Course';
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseName').value = course.course_name;
        document.getElementById('courseCode').value = course.course_code;
        document.getElementById('courseCredits').value = course.credits;
        openModal('courseModal');
    } catch (err) {
        showToast('Error loading course data.', 'error');
    }
}

async function saveCourse() {
    const id = document.getElementById('courseId').value;
    const data = {
        course_name: document.getElementById('courseName').value.trim(),
        course_code: document.getElementById('courseCode').value.trim().toUpperCase(),
        credits: parseInt(document.getElementById('courseCredits').value)
    };

    if (!data.course_name || !data.course_code || isNaN(data.credits)) {
        showToast('Please fill in all required fields.', 'warning');
        return;
    }

    if (data.credits < 1 || data.credits > 10) {
        showToast('Credits must be between 1 and 10.', 'warning');
        return;
    }

    try {
        if (id) {
            await apiRequest(`/courses/${id}`, 'PUT', data);
            showToast('Course updated successfully!', 'success');
        } else {
            await apiRequest('/courses', 'POST', data);
            showToast('Course added successfully!', 'success');
        }
        closeModal('courseModal');
        loadCourses();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        await apiRequest(`/courses/${id}`, 'DELETE');
        showToast('Course deleted successfully.', 'success');
        loadCourses();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// =================== ENROLLMENTS ===================
let enrollmentsData = [];

async function loadEnrollments() {
    try {
        enrollmentsData = await apiRequest('/enrollments');
        renderEnrollmentsTable();
    } catch (err) {
        showToast('Error loading enrollments.', 'error');
    }
}

function renderEnrollmentsTable() {
    const tbody = document.getElementById('enrollmentsTableBody');

    if (enrollmentsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No enrollments found.</td></tr>';
        return;
    }

    tbody.innerHTML = enrollmentsData.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="td-name">${escapeHtml(e.student_name)}</td>
      <td>${escapeHtml(e.course_name)}</td>
      <td>${escapeHtml(e.course_code)}</td>
      <td>${formatDate(e.enrollment_date)}</td>
      <td><span class="grade-badge ${e.grade ? '' : 'none'}">${e.grade || 'N/A'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn-icon grade" title="Update Grade" onclick="openGradeModal(${e.id}, '${e.grade || ''}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Unenroll" onclick="deleteEnrollment(${e.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function openEnrollmentModal() {
    try {
        const [students, courses] = await Promise.all([
            apiRequest('/students'),
            apiRequest('/courses')
        ]);

        const studentSelect = document.getElementById('enrollStudent');
        studentSelect.innerHTML = '<option value="">Select a student</option>' +
            students.map(s => `<option value="${s.id}">${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)} (${escapeHtml(s.email)})</option>`).join('');

        const courseSelect = document.getElementById('enrollCourse');
        courseSelect.innerHTML = '<option value="">Select a course</option>' +
            courses.map(c => `<option value="${c.id}">${escapeHtml(c.course_name)} (${escapeHtml(c.course_code)})</option>`).join('');

        openModal('enrollmentModal');
    } catch (err) {
        showToast('Error loading data for enrollment.', 'error');
    }
}

async function saveEnrollment() {
    const student_id = document.getElementById('enrollStudent').value;
    const course_id = document.getElementById('enrollCourse').value;

    if (!student_id || !course_id) {
        showToast('Please select both a student and a course.', 'warning');
        return;
    }

    try {
        await apiRequest('/enrollments', 'POST', { student_id: parseInt(student_id), course_id: parseInt(course_id) });
        showToast('Student enrolled successfully!', 'success');
        closeModal('enrollmentModal');
        loadEnrollments();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openGradeModal(enrollmentId, currentGrade) {
    document.getElementById('gradeEnrollmentId').value = enrollmentId;
    document.getElementById('gradeValue').value = currentGrade;
    openModal('gradeModal');
}

async function saveGrade() {
    const id = document.getElementById('gradeEnrollmentId').value;
    const grade = document.getElementById('gradeValue').value || null;

    try {
        await apiRequest(`/enrollments/${id}/grade`, 'PUT', { grade });
        showToast('Grade updated successfully!', 'success');
        closeModal('gradeModal');
        loadEnrollments();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteEnrollment(id) {
    if (!confirm('Are you sure you want to unenroll this student?')) return;

    try {
        await apiRequest(`/enrollments/${id}`, 'DELETE');
        showToast('Student unenrolled successfully.', 'success');
        loadEnrollments();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// =================== MODAL HELPERS ===================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// =================== UTILITY ===================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// =================== DEBOUNCE ===================
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// =================== EVENT LISTENERS ===================
document.addEventListener('DOMContentLoaded', () => {
    // Auth
    checkAuth();

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });

    // Student controls
    document.getElementById('addStudentBtn').addEventListener('click', openAddStudent);
    document.getElementById('studentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStudent();
    });
    document.getElementById('studentSearch').addEventListener('input', debounce(loadStudents, 400));
    document.getElementById('studentSort').addEventListener('change', loadStudents);

    // Course controls
    document.getElementById('addCourseBtn').addEventListener('click', openAddCourse);
    document.getElementById('courseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCourse();
    });

    // Enrollment controls
    document.getElementById('addEnrollmentBtn').addEventListener('click', openEnrollmentModal);
    document.getElementById('enrollmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEnrollment();
    });

    // Grade form
    document.getElementById('gradeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveGrade();
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
            }
        });
    });

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
        }
    });
});
