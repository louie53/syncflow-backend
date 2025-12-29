import { Router } from 'express';
import { createWorkspace, getMyWorkspaces } from '../controllers/workspace.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all workspace routes
router.use(authMiddleware);

router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);

export default router;
