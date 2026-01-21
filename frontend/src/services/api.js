/**
 * 🛡️ API SERVICE - TESIS CIBERSEGURIDAD
 * Ryan Gallegos Mera - PUCESI
 * Última actualización: 03 de Enero, 2026
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://127.0.0.1:8000/api';

// Configurar interceptor para agregar token a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Corrección: usar 'access_token' consistente con AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar expiración de sesión (401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Redirigir al login si no estamos ya allí
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// 🔐 AUTENTICACIÓN
// ========================================

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      username,
      password
    });
    // Guardar token y usuario en localStorage si el login es exitoso
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.response?.data?.error || 'Error al iniciar sesión' };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al registrar usuario' };
  }
};

// ========================================
// 📋 INCIDENTES
// ========================================

export const createIncident = async (incidentData) => {
  try {


    const response = await axios.post(`${API_URL}/incidents/create`, incidentData);


    return response.data;
  } catch (error) {
    console.error('❌ Error al crear incidente:', error);
    throw error.response?.data || { error: 'Error al crear incidente' };
  }
};

export const getIncidents = async () => {
  try {
    const response = await axios.get(`${API_URL}/incidents/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener incidentes' };
  }
};

export const getIncidentDetail = async (incidentId) => {
  try {
    const response = await axios.get(`${API_URL}/incidents/${incidentId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener detalle del incidente' };
  }
};

export const updateIncidentStatus = async (incidentId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/incidents/${incidentId}/status/`,
      updateData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al actualizar incidente' };
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/incidents/stats/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener estadísticas' };
  }
};

export default {
  login,
  register,
  createIncident,
  getIncidents,
  getIncidentDetail,
  updateIncidentStatus,
  getDashboardStats
};
