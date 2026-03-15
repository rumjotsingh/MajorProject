import axios from 'axios';

const COLLEGE_API_BASE_URL = 'https://colleges-api-india.fly.dev';

/**
 * Search colleges from external API
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} - Array of colleges
 */
export const searchColleges = async (keyword) => {
  try {
    const response = await axios.post(`${COLLEGE_API_BASE_URL}/colleges/search`, null, {
      headers: {
        'Keyword': keyword
      },
      timeout: 10000 // 10 second timeout
    });
    
    // API returns array of arrays: [id, university, college, type, state, district]
    const colleges = response.data.map(college => ({
      externalId: college[0],
      university: college[1]?.trim(),
      collegeName: college[2]?.trim(),
      type: college[3]?.trim(),
      state: college[4]?.trim(),
      district: college[5]?.trim()
    }));
    
    return colleges;
  } catch (error) {
    console.error('Error searching colleges from external API:', error.message);
    return [];
  }
};

/**
 * Get colleges by state
 * @param {string} state - State name
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} - Array of colleges
 */
export const getCollegesByState = async (state, offset = 0) => {
  try {
    const response = await axios.post(`${COLLEGE_API_BASE_URL}/colleges/state`, null, {
      headers: {
        'State': state,
        'Offset': offset.toString()
      },
      timeout: 10000
    });
    
    const colleges = response.data.map(college => ({
      externalId: college[0],
      university: college[1]?.trim(),
      collegeName: college[2]?.trim(),
      type: college[3]?.trim(),
      state: college[4]?.trim(),
      district: college[5]?.trim()
    }));
    
    return colleges;
  } catch (error) {
    console.error('Error getting colleges by state:', error.message);
    return [];
  }
};

/**
 * Get all states
 * @returns {Promise<Array>} - Array of state names
 */
export const getAllStates = async () => {
  try {
    const response = await axios.post(`${COLLEGE_API_BASE_URL}/allstates`, null, {
      timeout: 10000
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error getting states:', error.message);
    return [];
  }
};

export default {
  searchColleges,
  getCollegesByState,
  getAllStates
};
