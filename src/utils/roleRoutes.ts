export type LansaUserType = 'job_seeker' | 'employer' | 'mentor';

type RoleRouteInput = {
  userType?: LansaUserType;
  isAdmin?: boolean;
  fallback?: string;
};

type PostAuthRouteInput = RoleRouteInput & {
  requestedPath?: string | null;
  hasCompletedOnboarding: boolean;
};

const AUTH_ENTRY_PATHS = new Set([
  '/',
  '/auth',
  '/auth/callback',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]);

const PUBLIC_PATH_PREFIXES = [
  '/help',
  '/privacy',
  '/terms',
  '/for-business',
  '/pricing',
  '/profile/share/',
  '/verify/',
];

const COMMON_AUTH_PATH_PREFIXES = [
  '/notifications',
  '/chat',
  '/card',
];

const ROLE_PATH_PREFIXES: Record<LansaUserType, string[]> = {
  job_seeker: [
    '/dashboard',
    '/jobs',
    '/profile',
    '/profile/resume-editor',
    '/discovery',
    '/opportunity-discovery',
    '/resources',
    '/content',
    '/certification',
  ],
  employer: [
    '/employer-dashboard',
    '/organization/settings',
    '/browse-candidates',
  ],
  mentor: [
    '/mentor-dashboard',
    '/content',
  ],
};

const ROLE_HOME_PATHS = new Set(['/dashboard', '/employer-dashboard', '/mentor-dashboard', '/admin']);

function pathMatches(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);
}

export function getSafeInternalPath(path?: string | null) {
  if (!path) return undefined;

  try {
    const decodedPath = decodeURIComponent(path);
    if (!decodedPath.startsWith('/') || decodedPath.startsWith('//')) return undefined;
    if (decodedPath.includes('://') || decodedPath.startsWith('/\\')) return undefined;
    return decodedPath;
  } catch {
    return undefined;
  }
}

export function getRoleHomePath({ userType, isAdmin = false, fallback = '/onboarding' }: RoleRouteInput = {}) {
  if (isAdmin) return '/admin';
  if (userType === 'employer') return '/employer-dashboard';
  if (userType === 'mentor') return '/mentor-dashboard';
  if (userType === 'job_seeker') return '/dashboard';
  return fallback;
}

export function isRoleHomePath(pathname: string) {
  return ROLE_HOME_PATHS.has(pathname);
}

export function getPostAuthDestination({
  requestedPath,
  userType,
  isAdmin = false,
  hasCompletedOnboarding,
  fallback,
}: PostAuthRouteInput) {
  if (!hasCompletedOnboarding && !isAdmin) return '/onboarding';

  const homePath = getRoleHomePath({ userType, isAdmin, fallback });
  const safeRequestedPath = getSafeInternalPath(requestedPath);
  if (!safeRequestedPath) return homePath;

  const requestedUrl = new URL(safeRequestedPath, window.location.origin);
  const pathname = requestedUrl.pathname;

  if (AUTH_ENTRY_PATHS.has(pathname) || pathname === '/onboarding' || pathname === '/profile-starter') {
    return homePath;
  }

  if (isAdmin) {
    return pathname.startsWith('/admin') ? safeRequestedPath : homePath;
  }

  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathMatches(pathname, prefix))) {
    return safeRequestedPath;
  }

  if (COMMON_AUTH_PATH_PREFIXES.some((prefix) => pathMatches(pathname, prefix))) {
    return safeRequestedPath;
  }

  if (userType && ROLE_PATH_PREFIXES[userType].some((prefix) => pathMatches(pathname, prefix))) {
    return safeRequestedPath;
  }

  return homePath;
}