/**
 * Authentication Context for OAuth Proxy Integration
 * Handles user context and role-based access control
 */

import { writable } from 'svelte/stores';

// User authentication state
export const authState = writable({
  isAuthenticated: false,
  user: null,
  roles: [],
  permissions: []
});

// Role-based access control
export const ROLES = {
  CONSUMER: 'consumer',
  AUTHOR: 'author',
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_DASHBOARD: 'edit_dashboard',
  MANAGE_DASHBOARDS: 'manage_dashboards'
};

/**
 * Initialize authentication from OAuth proxy headers
 * Expected headers from OAuth proxy:
 * - X-User-Email: user@example.com
 * - X-User-Name: John Doe
 * - X-User-Roles: author,consumer
 * - X-User-Groups: team-a,team-b
 */
export function initializeAuth() {
  // In a real OAuth proxy setup, these would come from request headers
  // For now, we'll check for them in the global window object (set by OAuth proxy)
  const userInfo = window.__OAUTH_USER_INFO__ || {};
  
  const user = {
    email: userInfo.email || 'demo@example.com',
    name: userInfo.name || 'Demo User',
    roles: userInfo.roles || ['author'], // Default to author for development
    groups: userInfo.groups || []
  };

  const permissions = calculatePermissions(user.roles);

  authState.set({
    isAuthenticated: true,
    user,
    roles: user.roles,
    permissions
  });

  return user;
}

/**
 * Calculate permissions based on roles
 */
function calculatePermissions(roles) {
  const permissions = new Set();

  if (roles.includes(ROLES.CONSUMER)) {
    permissions.add(PERMISSIONS.VIEW_DASHBOARD);
  }

  if (roles.includes(ROLES.AUTHOR)) {
    permissions.add(PERMISSIONS.VIEW_DASHBOARD);
    permissions.add(PERMISSIONS.EDIT_DASHBOARD);
  }

  if (roles.includes(ROLES.ADMIN)) {
    permissions.add(PERMISSIONS.VIEW_DASHBOARD);
    permissions.add(PERMISSIONS.EDIT_DASHBOARD);
    permissions.add(PERMISSIONS.MANAGE_DASHBOARDS);
  }

  return Array.from(permissions);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission) {
  let currentAuth;
  authState.subscribe(auth => currentAuth = auth)();
  return currentAuth.permissions.includes(permission);
}

/**
 * Check if user can edit dashboards
 */
export function canEdit() {
  return hasPermission(PERMISSIONS.EDIT_DASHBOARD);
}

/**
 * Check if user can view dashboards
 */
export function canView() {
  return hasPermission(PERMISSIONS.VIEW_DASHBOARD);
}

/**
 * Logout function - redirects to OAuth proxy logout
 */
export function logout() {
  // Redirect to OAuth proxy logout endpoint
  window.location.href = '/oauth/logout';
}
