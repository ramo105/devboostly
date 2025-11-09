import express from 'express'
import {
  getAllProjects,
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  addProjectFile,
  deleteProjectFile,
  addProjectComment,
  deleteProject
} from '../controllers/projectController.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Routes protégées
router.get('/user', protect, getUserProjects)
router.get('/:id', protect, getProjectById)
router.post('/:id/comments', protect, addProjectComment)

// Routes admin
router.get('/', protect, admin, getAllProjects)
router.post('/', protect, admin, createProject)
router.put('/:id', protect, admin, updateProject)
router.post('/:id/files', protect, admin, addProjectFile)
router.delete('/:id/files/:fileId', protect, admin, deleteProjectFile)
router.delete('/:id', protect, admin, deleteProject)

export default router