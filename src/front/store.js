// Estado inicial para autenticación y perfil de usuario
export const initialStore = () => ({
  auth: {
    email: '',
    password: '',
    showPassword: false,
    isLoading: false,
    isLoggedIn: false,
    error: null,
    token: null,
    loginAttempts: 0,
    isBlocked: false,
    blockExpiresAt: null,
    sessionExpiresAt: null,
    redirectToRegister: false,
    prefillEmail: '',
  },
  profile: {
    userId: null,
    username: '',
    email: '',
    score: 0,
    totalPlayTime: 0,
    isOnline: false,
  },
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'SET_AUTH_FIELD':
      return {
        ...store,
        auth: {
          ...store.auth,
          [action.field]: action.value,
          error: null,
        },
      };
    case 'TOGGLE_SHOW_PASSWORD':
      return {
        ...store,
        auth: {
          ...store.auth,
          showPassword: !store.auth.showPassword,
        },
      };
    case 'LOGIN_REQUEST':
      return {
        ...store,
        auth: {
          ...store.auth,
          isLoading: true,
          error: null,
        },
      };
    case 'LOGIN_SUCCESS':
      return {
        ...store,
        auth: {
          ...store.auth,
          isLoading: false,
          isLoggedIn: true,
          token: action.payload.token,
          sessionExpiresAt: action.payload.sessionExpiresAt,
          loginAttempts: 0,
          isBlocked: false,
          blockExpiresAt: null,
          error: null,
        },
        profile: {
          ...store.profile,
          ...action.payload.profile,
          isOnline: true,
        },
      };
    case 'LOGIN_FAILURE':
      return {
        ...store,
        auth: {
          ...store.auth,
          isLoading: false,
          error: action.payload.error,
          loginAttempts: store.auth.loginAttempts + 1,
        },
      };
    case 'BLOCK_LOGIN':
      return {
        ...store,
        auth: {
          ...store.auth,
          isBlocked: true,
          blockExpiresAt: action.payload.blockExpiresAt,
        },
      };
    case 'UNBLOCK_LOGIN':
      return {
        ...store,
        auth: {
          ...store.auth,
          isBlocked: false,
          loginAttempts: 0,
          blockExpiresAt: null,
        },
      };
    case 'LOGOUT':
      return {
        ...store,
        auth: {
          ...initialStore().auth,
        },
        profile: {
          ...initialStore().profile,
        },
      };
    case 'SESSION_EXPIRED':
      return {
        ...store,
        auth: {
          ...store.auth,
          isLoggedIn: false,
          token: null,
          sessionExpiresAt: null,
        },
        profile: {
          ...store.profile,
          isOnline: false,
        },
      };
    case 'REDIRECT_TO_REGISTER':
      return {
        ...store,
        auth: {
          ...store.auth,
          redirectToRegister: true,
          prefillEmail: action.payload.email,
        },
      };
    case 'RESET_REDIRECT_TO_REGISTER':
      return {
        ...store,
        auth: {
          ...store.auth,
          redirectToRegister: false,
          prefillEmail: '',
        },
      };
    case 'UPDATE_PROFILE':
      return {
        ...store,
        profile: {
          ...store.profile,
          ...action.payload,
        },
      };
    default:
      throw Error('Unknown action.');
  }
}
