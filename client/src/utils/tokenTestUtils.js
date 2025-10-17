/**
 * Token Refresh Test Utility
 *
 * This file provides utilities to test the token refresh mechanism.
 * Use these functions in the browser console to test token refresh.
 */

// Test 1: Check current tokens
export function checkTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const loginData = localStorage.getItem('loginData');
  const userData = localStorage.getItem('userData');

  console.log('=== Current Token Status ===');
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT SET');
  console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NOT SET');
  console.log('Login Data:', loginData ? 'SET' : 'NOT SET');
  console.log('User Data:', userData ? 'SET' : 'NOT SET');

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const timeLeft = Math.floor((expiresAt - now) / 1000 / 60);

      console.log('Token Expires At:', expiresAt.toLocaleString());
      console.log('Time Left:', timeLeft > 0 ? `${timeLeft} minutes` : 'EXPIRED');
    } catch (e) {
      console.log('Could not decode token');
    }
  }
}

// Test 2: Force token expiration for testing
export function expireToken() {
  const oldToken = localStorage.getItem('accessToken');
  if (!oldToken) {
    console.error('No access token found');
    return;
  }

  // Set a clearly expired token (but keep the structure valid)
  const parts = oldToken.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1]));
      // Set expiration to 1 minute ago
      payload.exp = Math.floor(Date.now() / 1000) - 60;
      const newPayload = btoa(JSON.stringify(payload));
      const expiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;

      localStorage.setItem('accessToken', expiredToken);

      // Also update loginData
      const loginData = localStorage.getItem('loginData');
      if (loginData) {
        const obj = JSON.parse(loginData);
        obj.accessToken = expiredToken;
        localStorage.setItem('loginData', JSON.stringify(obj));
      }

      console.log('✅ Token marked as expired');
      console.log('⚠️ Note: Server will still reject this token');
      console.log('💡 To properly test, wait for natural expiration or adjust backend JWT_SECRET');
    } catch (e) {
      console.error('Failed to expire token:', e);
    }
  }
}

// Test 3: Test an API call (will trigger refresh if token expired)
export async function testApiCall() {
  console.log('=== Testing API Call ===');
  console.log('This will trigger token refresh if access token is expired');

  try {
    // Import axiosInstance dynamically
    const { default: axiosInstance } = await import('./axiosInstance.js');

    console.log('Making request to /user/profile...');
    const response = await axiosInstance.get('/user/profile');

    console.log('✅ API call successful!');
    console.log('Response:', response.data);

    // Check if token was refreshed
    console.log('\n=== After API Call ===');
    checkTokens();
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test 4: Clear all tokens
export function clearAllTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('loginData');
  localStorage.removeItem('userData');
  console.log('✅ All tokens cleared');
}

// Test 5: Monitor token refresh in real-time
export function monitorTokenRefresh() {
  console.log('=== Token Refresh Monitor Started ===');
  console.log('Watch for [RefreshToken] and [AxiosInterceptor] logs');
  console.log('Make an API call to trigger refresh if token is expired');
  console.log('\nTips:');
  console.log('1. Open Network tab to see refresh-token API call');
  console.log('2. Check Console for detailed logs');
  console.log('3. Use testApiCall() to trigger a request');
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  window.tokenTest = {
    checkTokens,
    expireToken,
    testApiCall,
    clearAllTokens,
    monitorTokenRefresh,
    help: () => {
      console.log(`
=== Token Refresh Test Utilities ===

Available commands:
  tokenTest.checkTokens()         - Show current token status and expiration
  tokenTest.expireToken()          - Mark access token as expired for testing
  tokenTest.testApiCall()          - Make a test API call (triggers refresh if expired)
  tokenTest.clearAllTokens()       - Clear all tokens from localStorage
  tokenTest.monitorTokenRefresh()  - Show monitoring tips
  tokenTest.help()                 - Show this help message

Example workflow:
  1. tokenTest.checkTokens()       // Check current status
  2. tokenTest.expireToken()       // Mark token as expired
  3. tokenTest.testApiCall()       // Make API call (should refresh)
  4. tokenTest.checkTokens()       // Verify new token

Note: Token refresh only works if refresh token is still valid (7 days)
      `);
    }
  };

  console.log('Token test utilities loaded. Type "tokenTest.help()" for usage.');
}

export default {
  checkTokens,
  expireToken,
  testApiCall,
  clearAllTokens,
  monitorTokenRefresh
};
