import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 10000,
});

const register = async (registrationData) => {
    try {
        const response = await axiosInstance.post('/v1/register', registrationData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
      return response.data;
  } catch (error) {
      console.error('Error from axios:', error);
      throw error;
  }
};

const invitation = async (registrationData) => {
  try {
      const response = await axiosInstance.post('/v1/organization/register_member', registrationData, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    return response.data;
} catch (error) {
    console.error('Error from axios:', error);
    throw error;
}
};

const requestPassword = async (email) => {
  try {
      const response = await axiosInstance.post('/v1/request-password', email, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    return response.data;
} catch (error) {
    console.error('Error from axios:', error);
    throw error;
}
};

const restartPassword = async (resetData) => {
  try {
      const response = await axiosInstance.post('/v1/restart-password', resetData, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    return response.data;
} catch (error) {
    console.error('Error from axios:', error);
    throw error;
}
};

const login = async (email, password) => {
    try {
        const requestBody = {
            email: email,
            password: password,
        };
        const response = await axiosInstance.post('/login', requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
};

const validateToken = async (token) => {
    try {
      const response = await axiosInstance.get('/v1/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getSites = async (token) => {
    try {
      const response = await axiosInstance.get('/v1/website/getbyclient', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const postSites = async (site, token) => {
    try {
      const response = await axiosInstance.post('/v1/website/add', site, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const putSites = async (site,token) => {
    try {
      const response = await axiosInstance.put('/v1/website/update/'+ site.id, site, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const deleteSites = async (siteId,token) => {
    try {
      const response = await axiosInstance.delete('/v1/website/delete/'+ siteId, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getAllAlerts = async (token) => {
    try {
      const response = await axiosInstance.get('/v1/alerts/getbyclient', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Always as array, this is the result expected by the component
      const alertsArray = Object.values(response.data);
      return alertsArray;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getStatusBySite = async (token, siteId, filter = '7d') => {
    try {
      const response = await axiosInstance.get(`/v1/status/getbyhost/${siteId}?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error from axios:', error);
      throw error;
    }
  };

  const getStatusByMultipleHosts = async (token, websiteIds, filter = '7d') => {
    try {
      const response = await axiosInstance.post('/v1/status/getbymultiplehosts', { websiteIds, filter }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getMetricsBySite = async (token, siteId, filter = '7d') => {
    try {
      const response = await axiosInstance.get(`/v1/metrics/getbyhost/${siteId}?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error from axios:', error);
      throw error;
    }
  };

  const getMetricsByMultipleHosts = async (token, websiteIds) => {
    try {
      const response = await axiosInstance.post('/v1/metrics/getbymultiplehosts', { websiteIds }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getProfile = async (token) => {
    try {
      const response = await axiosInstance.get('/v1/profile/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const setProfile = async (token, profileData) => {
    try {
      const response = await axiosInstance.post('/v1/profile/set', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const inviteMember = async (member, token) => {
    try {
      const response = await axiosInstance.post('/v1/organization/invite', member, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getMembers = async (token) => {
    try {
      const response = await axiosInstance.get('/v1/organization/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const changeMember = async (member, token) => {
    try {
      const response = await axiosInstance.post(`/v1/organization/change_member/${member.id}`, member, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error from axios:', error);
      throw error;
    }
  };

  const removeMember = async (member, token) => {
    try {
      const response = await axiosInstance.delete(`/v1/organization/delete_members/${member}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error from axios:', error);
      throw error;
    }
  };

  const createSnapshot = async (url, token) => {
    try {
      const response = await axiosInstance.post('/v1/website/snapshot', url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  const getEvents = async (token, ack = false) => {
    try {
      const response = await axiosInstance.get('/v1/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: { ack }
      });
      return response.data;
    } catch (error) {
        console.error('Error from axios:', error);
        throw error;
    }
  };

  

export { axiosInstance, register, invitation, requestPassword, restartPassword, login, validateToken, getSites, postSites, putSites, deleteSites, getAllAlerts, getStatusBySite, getStatusByMultipleHosts, getMetricsBySite, getMetricsByMultipleHosts, getProfile, setProfile, inviteMember, getMembers, changeMember, removeMember, createSnapshot, getEvents };
