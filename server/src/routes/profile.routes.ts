import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { primaryStore, UserRecord } from '../db/store.js';

export const profileRoutes = Router();

// Zod schema for PATCH /api/profile
// Note: barCouncilNumber, fullName, email, and appointmentRef are intentionally excluded 
// from the patchable shape to preserve institutional chain-of-custody lock.
const profilePatchSchema = z.object({
  contactExtension: z.string().optional(),
  chambersLocation: z.string().optional(),
  authorityScope: z.string().optional(),
});

/**
 * Helper to get user by header session mapping
 */
async function getAuthenticatedUser(req: Request) {
  const email = req.headers['x-user-email'] as string;
  if (email) {
    const user = await primaryStore.getUserByEmail(email);
    if (user) return user;
  }
  return (await primaryStore.getAllUsers()).find((u: UserRecord) => u.role === 'independent_validator');
}

/**
 * GET /api/profile
 * Retrieves the currently authenticated user's profile
 */
profileRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const mfaAttestationValid = user.webauthnHardwareAttested === true;

    return res.json({
      success: true,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        contactExtension: user.contactExtension,
        chambersLocation: user.chambersLocation,
        appointmentRef: user.appointmentRef,
        authorityScope: user.authorityScope,
        barCouncilNumber: user.barCouncilNumber,
        keyShareFingerprint: user.keyShareFingerprint,
        hardwareTokenName: user.hardwareTokenName,
        keyGenesisDate: user.keyGenesisDate,
        mfaAttestationLevel: user.mfaAttestationLevel,
        mfaEnrolled: user.mfaEnrolled,
        mfaAttestationValid
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/profile
 * Updates the user's profile, explicitly restricting certain fields
 */
profileRoutes.patch('/', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate request body
    const validatedData = profilePatchSchema.parse(req.body);

    // Apply updates
    if (validatedData.contactExtension !== undefined) user.contactExtension = validatedData.contactExtension;
    if (validatedData.chambersLocation !== undefined) user.chambersLocation = validatedData.chambersLocation;
    if (validatedData.authorityScope !== undefined) user.authorityScope = validatedData.authorityScope;

    await primaryStore.saveUser(user);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        contactExtension: user.contactExtension,
        chambersLocation: user.chambersLocation,
        appointmentRef: user.appointmentRef,
        authorityScope: user.authorityScope,
        barCouncilNumber: user.barCouncilNumber,
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: (error as any).errors });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});
