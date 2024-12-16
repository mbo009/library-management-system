const BASE_URL = "http://localhost:8000";

const ENDPOINTS = {
  login: `${BASE_URL}/login`,
  register: `${BASE_URL}/register`,
  logout: `${BASE_URL}/logout`,
  check_access: () => `${BASE_URL}/checkAccess`,
};

export { ENDPOINTS };
