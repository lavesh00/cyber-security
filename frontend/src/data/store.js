const EMAILS_KEY = 'securemail_emails';

/**
 * Get all emails from localStorage
 */
export function getEmails() {
  try {
    const data = localStorage.getItem(EMAILS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save all emails to localStorage
 */
function saveEmails(emails) {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
}

/**
 * Add a new email to the store
 */
export function saveEmail(email) {
  const emails = getEmails();
  emails.unshift(email); // newest first
  saveEmails(emails);
}

/**
 * Get inbox emails for a user (where they are a recipient)
 */
export function getInboxEmails(userId) {
  return getEmails().filter((e) => e.to.includes(userId));
}

/**
 * Get sent emails for a user
 */
export function getSentEmails(userId) {
  return getEmails().filter((e) => e.from === userId);
}

/**
 * Get a single email by ID
 */
export function getEmailById(id) {
  return getEmails().find((e) => e.id === id) || null;
}

/**
 * Mark an email as read for a specific user
 */
export function markAsRead(emailId, userId) {
  const emails = getEmails();
  const email = emails.find((e) => e.id === emailId);
  if (email && email.read) {
    email.read[userId] = true;
    saveEmails(emails);
  }
}

/**
 * Get unread count for a user's inbox
 */
export function getUnreadCount(userId) {
  const inbox = getInboxEmails(userId);
  return inbox.filter((e) => e.read && !e.read[userId]).length;
}

/**
 * Delete an email by ID
 */
export function deleteEmail(emailId) {
  const emails = getEmails().filter((e) => e.id !== emailId);
  saveEmails(emails);
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
