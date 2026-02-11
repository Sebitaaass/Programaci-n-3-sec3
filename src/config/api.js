// URL base de la API - se adapta automáticamente al entorno
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default API_BASE_URL;
