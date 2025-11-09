import api from '../lib/api'

export const projectService = {
  // Récupérer mes projets
  getMyProjects: async () => {
    const response = await api.get('/projects/user')
    return response.data
  },

  // Récupérer un projet
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  // Télécharger fichier projet
  downloadProjectFile: async (projectId, fileId) => {
    const response = await api.get(`/projects/${projectId}/files/${fileId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}