import authorizedAxiosInstance from './axios';

export const fetchTasksAPI = async (params) => {
    const response = await authorizedAxiosInstance.get('/tasks', { params });
    return response.data;
};

export const fetchTaskDetailsAPI = async (id) => {
    const response = await authorizedAxiosInstance.get(`/tasks/${id}`);
    return response.data;
};

export const createTaskAPI = async (data) => {
    const response = await authorizedAxiosInstance.post('/tasks', data);
    return response.data;
};

export const updateTaskAPI = async (id, data) => {
    const response = await authorizedAxiosInstance.put(`/tasks/${id}`, data);
    return response.data;
};

export const deleteTaskAPI = async (id) => {
    const response = await authorizedAxiosInstance.delete(`/tasks/${id}`);
    return response.data;
};

export const exportTasksAPI = async () => {
    const response = await authorizedAxiosInstance.get('/tasks/export', { responseType: 'blob' });
    return response.data;
};

// Subtasks
export const fetchSubtasksAPI = async (taskId) => {
    const response = await authorizedAxiosInstance.get(`/tasks/${taskId}/subtasks`);
    return response.data;
};

export const createSubtaskAPI = async (taskId, data) => {
    const response = await authorizedAxiosInstance.post(`/tasks/${taskId}/subtasks`, data);
    return response.data;
};

export const updateSubtaskAPI = async (subtaskId, data) => {
    const response = await authorizedAxiosInstance.put(`/subtasks/${subtaskId}`, data);
    return response.data;
};

export const deleteSubtaskAPI = async (subtaskId) => {
    const response = await authorizedAxiosInstance.delete(`/subtasks/${subtaskId}`);
    return response.data;
};

// Comments
export const fetchCommentsAPI = async (taskId) => {
    const response = await authorizedAxiosInstance.get(`/tasks/${taskId}/comments`);
    return response.data;
};

export const createCommentAPI = async (taskId, data) => {
    const response = await authorizedAxiosInstance.post(`/tasks/${taskId}/comments`, data);
    return response.data;
};

// Logs
export const fetchLogsAPI = async (taskId) => {
    const response = await authorizedAxiosInstance.get(`/tasks/${taskId}/logs`);
    return response.data;
};
