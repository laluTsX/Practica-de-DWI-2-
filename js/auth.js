const STORAGE_KEY = 'nutrix_session';

export function login(userName) {
    if (!userName) return false;
    const session = { userName, timestamp: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
}

export function getCurrentUser() {
    const session = localStorage.getItem(STORAGE_KEY);
    if (!session) return null;
    const data = JSON.parse(session);
    return data.userName;
}

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
}

export function checkAuthAndRedirect() {
    const user = getCurrentUser();
    if (!user && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
    return user;
}