
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user/me`;

export const PLACE_URL = `${config.apiBaseUrl}/api/place`;
export const COMMUNITY_URL = `${config.apiBaseUrl}/api/community`;
export const STATIC_URL = `${config.apiBaseUrl}/api`;
export const PHOTO_URL = `${config.apiBaseUrl}/api/photo`;
export const YTPLACE_URL = `${config.apiBaseUrl}/api/ytplace`;
export const YTPLACEHISTORY_URL = `${config.apiBaseUrl}/api/ytplacehistory`;
export const EXTRA_PHOTOS_URL = `${config.apiBaseUrl}/api/extras/photos`;
export const PHOTO_BATCH_URL = `${config.apiBaseUrl}/api/photobatch`;
