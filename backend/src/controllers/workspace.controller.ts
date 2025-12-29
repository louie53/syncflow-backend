import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Workspace } from '../models/workspace.model';
import { WorkspaceMember } from '../models/workspaceMember.model';

/**
 * Handle workspace creation.
 */
export const createWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }

        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Workspace name is required' });
        }

        // 1. Create the Workspace
        const workspace = await Workspace.create({
            name,
            ownerId: userId,
        });

        // 2. Add the creator as an Admin in WorkspaceMember
        const member = await WorkspaceMember.create({
            userId,
            workspaceId: workspace._id,
            role: 'admin',
        });

        // 3. Update the Workspace members array
        workspace.members.push(member._id as any);
        await workspace.save();

        return res.status(StatusCodes.CREATED).json({
            message: 'Workspace created successfully',
            workspace,
        });
    } catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error creating workspace',
            error: error.message,
        });
    }
};

/**
 * Get all workspaces for the authenticated user.
 */
export const getMyWorkspaces = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        // Find all memberships for this user
        const memberships = await WorkspaceMember.find({ userId }).populate('workspaceId');

        const workspaces = memberships.map((m) => m.workspaceId);

        return res.status(StatusCodes.OK).json({ workspaces });
    } catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error fetching workspaces',
            error: error.message,
        });
    }
};
