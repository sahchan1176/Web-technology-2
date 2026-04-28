/* ============================================================
   IoTopia – auth.js
   User accounts, login, register, session management
   Uses localStorage to persist users and content
   ============================================================ */

const IoTopia = {

  // ── Storage keys ──────────────────────────────────────────
  KEYS: {
    users:     'iotopia_users',
    session:   'iotopia_session',
    articles:  'iotopia_articles',
    tutorials: 'iotopia_tutorials',
  },

  // ── Helpers ───────────────────────────────────────────────
  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.users) || '[]');
  },
  saveUsers(users) {
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },
  getSession() {
    return JSON.parse(localStorage.getItem(this.KEYS.session) || 'null');
  },
  saveSession(user) {
    localStorage.setItem(this.KEYS.session, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(this.KEYS.session);
  },
  getArticles() {
    return JSON.parse(localStorage.getItem(this.KEYS.articles) || '[]');
  },
  saveArticles(arr) {
    localStorage.setItem(this.KEYS.articles, JSON.stringify(arr));
  },
  getTutorials() {
    return JSON.parse(localStorage.getItem(this.KEYS.tutorials) || '[]');
  },
  saveTutorials(arr) {
    localStorage.setItem(this.KEYS.tutorials, JSON.stringify(arr));
  },

  // ── Register ──────────────────────────────────────────────
  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, msg: 'An account with this email already exists.' };
    }
    const user = {
      id:       Date.now(),
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      password: btoa(password), // simple encoding (not production-grade)
      avatar:   name.trim().charAt(0).toUpperCase(),
      joined:   new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    };
    users.push(user);
    this.saveUsers(users);
    this.saveSession(user);
    return { ok: true, user };
  },

  // ── Login ─────────────────────────────────────────────────
  login(email, password) {
    const users = this.getUsers();
    const user  = users.find(u => u.email === email.trim().toLowerCase() && u.password === btoa(password));
    if (!user) return { ok: false, msg: 'Incorrect email or password. Please try again.' };
    this.saveSession(user);
    return { ok: true, user };
  },

  // ── Logout ────────────────────────────────────────────────
  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  // ── Is logged in? ─────────────────────────────────────────
  isLoggedIn() {
    return !!this.getSession();
  },

  // ── Submit article ────────────────────────────────────────
  submitArticle(title, category, summary, content) {
    const session = this.getSession();
    if (!session) return { ok: false, msg: 'You must be logged in to submit an article.' };
    const articles = this.getArticles();
    const article = {
      id:        Date.now(),
      authorId:  session.id,
      authorName:session.name,
      title:     title.trim(),
      category:  category,
      summary:   summary.trim(),
      content:   content.trim(),
      date:      new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      status:    'published',
    };
    articles.unshift(article);
    this.saveArticles(articles);
    return { ok: true, article };
  },

  // ── Submit tutorial ───────────────────────────────────────
  submitTutorial(title, difficulty, duration, hardware, intro, steps) {
    const session = this.getSession();
    if (!session) return { ok: false, msg: 'You must be logged in to submit a tutorial.' };
    const tutorials = this.getTutorials();
    const tutorial = {
      id:          Date.now(),
      authorId:    session.id,
      authorName:  session.name,
      title:       title.trim(),
      difficulty:  difficulty,
      duration:    duration.trim(),
      hardware:    hardware.trim(),
      intro:       intro.trim(),
      steps:       steps, // array of {title, content}
      date:        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      status:      'published',
    };
    tutorials.unshift(tutorial);
    this.saveTutorials(tutorials);
    return { ok: true, tutorial };
  },

  // ── Delete own content ────────────────────────────────────
  deleteArticle(id) {
    const session = this.getSession();
    if (!session) return false;
    const articles = this.getArticles().filter(a => !(a.id === id && a.authorId === session.id));
    this.saveArticles(articles);
    return true;
  },
  deleteTutorial(id) {
    const session = this.getSession();
    if (!session) return false;
    const tuts = this.getTutorials().filter(t => !(t.id === id && t.authorId === session.id));
    this.saveTutorials(tuts);
    return true;
  },
};

// ── Update nav based on session ───────────────────────────────
function updateNavForSession() {
  const session = IoTopia.getSession();
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  // Remove old auth links
  navLinks.querySelectorAll('.nav-auth').forEach(el => el.remove());

  if (session) {
    // Logged in: show avatar + logout
    const li1 = document.createElement('li');
    li1.className = 'nav-auth';
    li1.innerHTML = `<a href="dashboard.html" class="nav-avatar" title="My Dashboard">
      <span class="avatar-circle">${session.avatar}</span>
      <span class="avatar-name">${session.name.split(' ')[0]}</span>
    </a>`;

    const li2 = document.createElement('li');
    li2.className = 'nav-auth';
    li2.innerHTML = `<a href="#" class="nav-logout" onclick="IoTopia.logout();return false;">Log Out</a>`;

    // Insert before Contact Us button
    const cta = navLinks.querySelector('.nav-cta');
    if (cta) {
      navLinks.insertBefore(li1, cta.parentElement);
      navLinks.insertBefore(li2, cta.parentElement);
    } else {
      navLinks.appendChild(li1);
      navLinks.appendChild(li2);
    }
  } else {
    // Not logged in: show Login link
    const li = document.createElement('li');
    li.className = 'nav-auth';
    li.innerHTML = `<a href="login.html" class="nav-login">Log In</a>`;
    const cta = navLinks.querySelector('.nav-cta');
    if (cta) navLinks.insertBefore(li, cta.parentElement);
    else navLinks.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', updateNavForSession);
