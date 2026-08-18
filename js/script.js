let pageHistory = [];
let historyIndex = -1;
let isNavigating = false;
let currentProjectId = null;
let projects =
    JSON.parse(localStorage.getItem("devforgeProjects")) || [];
   
let users =
    JSON.parse(localStorage.getItem("devforgeUsers")) || [];

let currentUserEmail =
    localStorage.getItem("devforgeCurrentUser");

let currentUser =
    users.find(function(user) {
        return user.email === currentUserEmail;
    }) || null;
 function getUserProjects() {

    if (!currentUser) {
        return [];
    }
    return projects.filter(function(project) {
        return project.owner === currentUser.email;
    });
}
function goBack() {

    if (historyIndex <= 0) {
        return;
    }
    historyIndex--;

    const previousPage =
        pageHistory[historyIndex];

    isNavigating = true;

    showPage(previousPage, false);

    isNavigating = false;

    updateNavigationButtons();
}
function goForward() {

    if (historyIndex >= pageHistory.length - 1) {
        return;
    }

    historyIndex++;

    const nextPage =
        pageHistory[historyIndex];

    isNavigating = true;

    showPage(nextPage, false);

    isNavigating = false;

    updateNavigationButtons();
}
function updateNavigationButtons() {

    const backButton =
        document.querySelector(
            ".nav-arrow:first-child"
        );

    const forwardButton =
        document.querySelector(
            ".nav-arrow:last-child"
        );

    if (backButton) {

        backButton.disabled =
            historyIndex <= 0;
    }

    if (forwardButton) {

        forwardButton.disabled =
            historyIndex >= pageHistory.length - 1;
    }
}
/* PAGE NAVIGATION */
function showLogoutConfirmation() {

    const modal =
        document.getElementById("logoutModal");

    if (modal) {
        modal.classList.add("show");
    }
}

function closeLogoutConfirmation() {

    const modal =
        document.getElementById("logoutModal");

    if (modal) {
        modal.classList.remove("show");
    }
}
function confirmLogout() {

    closeLogoutConfirmation();

    logout();
}
function logout(event) {

    if (event) {
        event.stopPropagation();
    }
    // Remove only the active login session
    localStorage.removeItem("devforgeCurrentUser");

    // Clear current user from JavaScript memory
    currentUser = null;

    // Rebuild navbar as logged-out
    updateNavbar();
    // Go to Home
    showPage("home");
}

function updateNavbar() {

    const navButtons =
        document.getElementById("navButtons");

    if (!navButtons) {
        return;
    }
    // =========================
    // LOGGED-IN USER
    // =========================

    if (currentUser) {

        navButtons.innerHTML = `

            <div class="user-menu">
                <button
                    type="button"
                    class="user-button"
                    onclick="toggleUserMenu(event)">

                    <span class="user-avatar">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </span>

                    <span>
                        ${currentUser.name}
                    </span>

                    <span class="user-arrow">
                        ▾
                    </span>

                </button>
                <div
                    class="user-dropdown"
                    id="userDropdown">

                    <div class="dropdown-user-info">

                        <strong>
                            ${currentUser.name}
                        </strong>

                        <span>
                            ${currentUser.email}
                        </span>

                    </div>
                    <button
                        type="button"
                        onclick="showPage('dashboard')">

                        Dashboard

                    </button>
                    <button
                        type="button"
                        onclick="showPage('projects')">

                        My Projects

                    </button>
                    <button
                        type="button">

                        Settings

                    </button>
                    <div class="dropdown-divider"></div>

                    <button
                       type="button"
                       class="logout-option"
                    onclick="showLogoutConfirmation()">

                         Logout

                    </button>

                </div>

            </div>
        `;
    }

    // =========================
    // LOGGED-OUT USER
    // =========================
    else {
        navButtons.innerHTML = `
            <button
                type="button"
                class="btn-outline"
                onclick="showPage('login')">

                Login

            </button>
            <button
                type="button"
                class="btn-primary"
                onclick="showPage('signup')">
                Sign Up
            </button>
        `;
    }
    // =========================
    // SIDEBAR LOGOUT
    // =========================

    const sidebarLogout =
        document.getElementById("sidebarLogout");

    if (sidebarLogout) {

        sidebarLogout.style.display =
            currentUser ? "flex" : "none";
    }
}
function toggleUserMenu(event) {

    if (event) {
        event.stopPropagation();
    }

    const dropdown =
        document.getElementById("userDropdown");

    if (!dropdown) {
        return;
    }

    dropdown.classList.toggle("show");
}
function showPage(page, addToHistory = true) {

    const protectedPages = [
        "dashboard",
        "projects",
        "create",
        "details"
    ];

    // Don't allow logged-out users into workspace pages
    if (protectedPages.includes(page) && !currentUser) {
        page = "login";
    }

    // Add page to our navigation history
    if (addToHistory && !isNavigating) {

        // Remove forward history
        pageHistory =
            pageHistory.slice(0, historyIndex + 1);

        // Add new page
        pageHistory.push(page);

        historyIndex =
            pageHistory.length - 1;
    }

    // Hide all pages
    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function(currentPage) {
        currentPage.classList.add("hidden");
    });

    // Show selected page
    const selectedPage =
        document.getElementById(page + "Page");

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    // Load page data
    if (page === "home") {
    loadHomeProjects();
}
    if (page === "dashboard") {
        loadDashboard();
    }
    if (page === "projects") {
        displayProjects();
    }
    updateNavigationButtons();
}
/* SIGNUP */

document.getElementById("signupForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    const message =
        document.getElementById("signupMessage");

    /* Check if account already exists */
    const existingUser = users.find(function(user) {
        return user.email.toLowerCase() === email.toLowerCase();
    });
    if (existingUser) {
        message.textContent =
            "An account with this email already exists. Please login.";
        message.className = "message error";
        return;
    }

    /* Validate password */
    if (password.length < 6) {
        message.textContent =
            "Password must contain at least 6 characters.";
        message.className = "message error";
        return;
    }

    /* Create new account */
    const user = {
        name: name,
        email: email,
        password: password
    };

    /* Save account permanently */
    users.push(user);
    localStorage.setItem(
        "devforgeUsers",
        JSON.stringify(users)
    );

    /* Create login session */
    currentUser = user;
    localStorage.setItem(
        "devforgeCurrentUser",
        user.email
    );
    updateNavbar();
    message.textContent =
        "Account created successfully!";
    message.className =
        "message success";
    setTimeout(function() {
        showPage("dashboard");
    }, 800);
});

/* LOGIN */

document.getElementById("loginForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");

    /* Find account */
    const user = users.find(function(user) {
        return user.email.toLowerCase() === email.toLowerCase();
    });

    /* Account doesn't exist */
    if (!user) {
        message.textContent =
            "No account found with this email. Please sign up.";
        message.className =
            "message error";
        return;
    }

    /* Wrong password */
    if (password !== user.password) {
        message.textContent =
            "Incorrect password.";
        message.className =
            "message error";
        return;
    }
    /* Login successful */

    currentUser = user;
    localStorage.setItem(
        "devforgeCurrentUser",
        user.email
    );
    updateNavbar();
    message.textContent =
        "Login successful!";

    message.className =
        "message success";
    setTimeout(function() {
        showPage("dashboard");

    }, 600);
});
/* CREATE FROM HOME */

function createFromHome() {

    const input =
        document.getElementById("homeProjectInput");

    const description = input.value.trim();

    if (description === "") {
        alert("Please describe your project first.");
        return;
    }

    document.getElementById("projectDescription").value =
        description;

    showPage("create");
}
/* CREATE PROJECT */

document.getElementById("projectForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("projectName").value.trim();

    const description =
        document.getElementById("projectDescription").value.trim();

    const type =
        document.getElementById("projectType").value;

    const message =
        document.getElementById("projectMessage");

    if (name.length < 3) {
        message.textContent = "Project name is too short.";
        message.className = "message error";
        return;
    }

    if (description.length < 10) {
        message.textContent = "Please provide a detailed description.";
        message.className = "message error";
        return;
    }
    const project = {

        id: Date.now(),
        owner: currentUser.email,
        name: name,

        description: description,

        type: type,

        frontend: [
            "Landing Page",
            "Navigation",
            "User Interface",
            "Responsive Design"
        ],

        backend: [
            "User Authentication",
            "REST API",
            "Server Logic"
        ],

        database: [
            "Users Collection",
            "Projects Collection",
            "Project Details"
        ],

        features: [
            "User Registration",
            "User Login",
            "Project Creation",
            "Project Management"
        ],

        createdAt: new Date().toLocaleDateString()

    };

    projects.push(project);

    localStorage.setItem(
        "devforgeProjects",
        JSON.stringify(projects)
    );
    message.textContent = "Project generated successfully!";
    message.className = "message success";

    document.getElementById("projectForm").reset();

    setTimeout(function() {
        showPage("projects");
    }, 800);

});
/* DISPLAY PROJECTS */

function loadHomeProjects() {

    const container =
        document.getElementById("homeRecentProjects");

    if (!container) {
        return;
    }
    container.innerHTML = "";
    const userProjects =
        getUserProjects();

    if (userProjects.length === 0) {

        container.innerHTML = `
            <div class="project-card">

                <h3>No Projects Yet</h3>

                <p>
                    Create your first project to see it here.
                </p>

            </div>
        `;
        return;
    }
    userProjects
        .slice(-3)
        .reverse()
        .forEach(function(project) {

            const card =
                document.createElement("div");

            card.className = "home-project-card";
            card.innerHTML = `

                <div class="project-type">
                    ${project.type}
                </div>

                <h3>
                    ${project.name}
                </h3>

                <p>
                    ${project.description}
                </p>

                <p>
                    Created: ${project.createdAt}
                </p>

                <button
                    class="btn-primary"
                    onclick="viewProject(${project.id})">

                    View Project

                </button>
            `;
            container.appendChild(card);

        });
}
    function displayProjects() {

    const container =
        document.getElementById("allProjects");

    container.innerHTML = "";

    // ONLY current user's projects
    const userProjects = getUserProjects();

    if (userProjects.length === 0) {
        container.innerHTML = `
            <div class="project-card">

                <h3>No Projects Yet</h3>

                <p>
                    Create your first project to see it here.
                </p>

            </div>
        `;
        return;
    }

    userProjects.forEach(function(project) {

        const card =
            document.createElement("div");

        card.className = "project-card";
        card.innerHTML = `
            <div class="project-type">
                ${project.type}
            </div>

            <h3>${project.name}</h3>

            <p>
                ${project.description}
            </p>

            <p>
                Created: ${project.createdAt}
            </p>

          <div class="project-card-actions">

    <button
        class="btn-primary"
        onclick="viewProject(${project.id})">
        View Project
    </button>

    <button
        class="delete-project-btn"
        onclick="showDeleteConfirmation(${project.id})">
        Delete
    </button>

</div>
        `;
        container.appendChild(card);
    });
}
let projectToDelete = null;

function showDeleteConfirmation(projectId) {

    projectToDelete = projectId;

    const projects = getUserProjects();

    const project =
        projects.find(function(p) {
            return p.id === projectId;
        });

    const message =
        document.getElementById("deleteProjectMessage");

    if (project && message) {

        message.textContent =
            `Are you sure you want to delete "${project.name}"? This action cannot be undone.`;
    }

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.add("show");
    }
}
function closeDeleteConfirmation() {

    projectToDelete = null;

    const modal =
        document.getElementById("deleteModal");

    if (modal) {
        modal.classList.remove("show");
    }
}
function confirmDeleteProject() {

    if (projectToDelete === null) {
        return;
    }

    // Remove the project from the main projects array
    projects = projects.filter(function(project) {
        return project.id !== projectToDelete;
    });

    // Save the updated projects array
    localStorage.setItem(
        "devforgeProjects",
        JSON.stringify(projects)
    );

    // Close the confirmation popup
    closeDeleteConfirmation();

    // Refresh the projects page
    displayProjects();

    // Refresh dashboard if needed
    if (typeof loadDashboard === "function") {
        loadDashboard();
    }
    // Clear selected project
    projectToDelete = null;
}
/* VIEW PROJECT */

function viewProject(id) {
    currentProjectId = id;

    const project =
        projects.find(function(item) {
            return item.id === id;
        });

    if (!project) {
        return;
    }

    const container =
        document.getElementById("projectDetails");
    container.innerHTML = `

    <div class="details-box">

        <div class="details-top">

            <div>
                <p class="small-text">${project.type}</p>
                <h1>${project.name}</h1>
                <p class="details-description">
                    ${project.description}
                </p>
            </div>

            <div class="project-status">
                Project Plan
            </div>

        </div>

        <div class="roadmap-grid">

            <div class="roadmap-card">

                <div class="roadmap-icon">
                    UI
                </div>

                <h2>Frontend</h2>

                <ul>
                    ${project.frontend
                        .map(function(item) {
                            return `<li>${item}</li>`;
                        })
                        .join("")}
                </ul>

            </div>

            <div class="roadmap-card">

                <div class="roadmap-icon">
                    API
                </div>

                <h2>Backend</h2>

                <ul>
                    ${project.backend
                        .map(function(item) {
                            return `<li>${item}</li>`;
                        })
                        .join("")}
                </ul>

            </div>

            <div class="roadmap-card">

                <div class="roadmap-icon">
                    DB
                </div>

                <h2>Database</h2>

                <ul>
                    ${project.database
                        .map(function(item) {
                            return `<li>${item}</li>`;
                        })
                        .join("")}
                </ul>

            </div>

            <div class="roadmap-card">

                <div class="roadmap-icon">
                    +
                </div>

                <h2>Features</h2>

                <ul>
                    ${project.features
                        .map(function(item) {
                            return `<li>${item}</li>`;
                        })
                        .join("")}
                </ul>

            </div>

        </div>

    </div>
`;
    showPage("details");
}
/* HTML PAGE GENERATOR */

function generateHTMLPage() {

    const project =
        projects.find(function(item) {
            return item.id === currentProjectId;
        });

    if (!project) {
        alert("Please open a project first.");
        return;
    }

    const generatedHTML = `
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>${project.name}</title>

</head>

<body>

    <nav>

        <h2>${project.name}</h2>

        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#contact">Contact</a>

    </nav>


    <section id="home">

        <h1>
            Welcome to ${project.name}
        </h1>

        <p>
            ${project.description}
        </p>

        <button>
            Get Started
        </button>

    </section>


    <section id="features">

        <h2>Features</h2>

        <ul>

            ${project.features
                .map(function(feature) {
                    return `<li>${feature}</li>`;
                })
                .join("")}

        </ul>

    </section>


    <section id="contact">

        <h2>Contact</h2>

        <p>
            Thank you for visiting ${project.name}.
        </p>

    </section>


</body>

</html>
`;

   const preview =
    document.getElementById("generatedPagePreview");

const frame =
    document.getElementById("generatedPreviewFrame");

const code =
    document.getElementById("generatedHTMLCode");

if (preview && frame) {

    frame.srcdoc = generatedHTML;

    preview.classList.remove("hidden");
}

if (code) {

    code.textContent = generatedHTML;
}
}
function toggleHTMLCode() {

    const codeSection =
        document.getElementById("generatedCodeSection");

    if (!codeSection) {
        return;
    }

    codeSection.classList.toggle("hidden");
}
function copyGeneratedHTML() {

    const code =
        document.getElementById("generatedHTMLCode");

    if (!code) {
        return;
    }

    navigator.clipboard.writeText(code.textContent);

    alert("HTML code copied successfully!");
}
function downloadGeneratedHTML() {

    const code =
        document.getElementById("generatedHTMLCode");

    if (!code) {
        return;
    }

    const blob =
        new Blob(
            [code.textContent],
            { type: "text/html" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = "devforge-generated-page.html";

    link.click();

    URL.revokeObjectURL(url);
}

/* DASHBOARD */
function loadDashboard() {

    const nameElement =
        document.getElementById("dashboardName");

    if (currentUser) {
        nameElement.textContent = currentUser.name;
    } else {
        nameElement.textContent = "Guest";
    }

    // Get ONLY the current user's projects
    const userProjects = getUserProjects();

    // Total projects
    document.getElementById("totalProjects").textContent =
        userProjects.length;

    // Frontend plans
    document.getElementById("frontendCount").textContent =
        userProjects.length;

    // Backend plans
    document.getElementById("backendCount").textContent =
        userProjects.length;

        // Recent projects
    const recent =
        document.getElementById("recentProjects");

    recent.innerHTML = "";

    if (userProjects.length === 0) {
        recent.innerHTML = `
            <div class="project-card">
                <h3>No Projects Yet</h3>

                <p>
                    Create your first project to see it here.
                </p>
            </div>
        `;
        return;
    }
    userProjects
        .slice(-3)
        .reverse()
        .forEach(function(project) {

            const card =
                document.createElement("div");

            card.className = "project-card";

            card.innerHTML = `
                <div class="project-type">
                    ${project.type}
                </div>

                <h3>${project.name}</h3>

                <p>${project.description}</p>

                <button
                    class="btn-primary"
                    onclick="viewProject(${project.id})">
                    View
                </button>
            `;

            recent.appendChild(card);
        });
}
/* INITIAL PAGE */

updateNavbar();
showPage("home");