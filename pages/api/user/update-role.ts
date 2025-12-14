/**
 * API ENDPOINT: Update User Role
 * 
 * Endpoint: POST /api/user/update-role
 * 
 * Purpose:
 * Update a user's role in both Prisma and Clerk.
 * When admin changes a user's role, this syncs it to Clerk's custom claims.
 * 
 * Request Body:
 * {
 *   userId: string (Clerk user ID)
 *   newRole: string ("admin" | "teacher" | "student" | "parent")
 * }
 * 
 * Response:
 * - Success (200): { role: "admin" | "teacher" | "student" | "parent" }
 * - Error (400): { error: "..." }
 * - Error (500): { error: "Internal server error" }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

type ResponseData = 
  | { role: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, newRole } = req.body;

    // Validate inputs
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!newRole || !["admin", "teacher", "student", "parent"].includes(newRole)) {
      return res.status(400).json({ error: "Valid role is required" });
    }

    // Update role in Prisma database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { role: true },
    });

    // Also update in Clerk's custom metadata
    // This syncs the role to the JWT token for middleware
    const clerkClientInstance = await clerkClient();
    await clerkClientInstance.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: newRole,
      },
    });

    console.log(`Updated user ${userId} role to: ${newRole}`);

    return res.status(200).json({ role: updatedUser.role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
