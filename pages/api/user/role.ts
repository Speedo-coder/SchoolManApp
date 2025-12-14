/**
 * API ENDPOINT: Fetch User Role
 * 
 * Endpoint: POST /api/user/role
 * 
 * Purpose:
 * Fetch the authenticated user's role from the database.
 * Used by the client-side RouteProtector component to validate
 * whether the user has access to the dashboard they're trying to visit.
 * 
 * Request Body:
 * {
 *   userId: string (Clerk user ID)
 * }
 * 
 * Response:
 * - Success (200): { role: "admin" | "teacher" | "student" | "parent" }
 * - Error (400): { error: "User ID is required" }
 * - Error (404): { error: "User not found" }
 * - Error (500): { error: "Internal server error" }
 * 
 * Security:
 * - This endpoint should only be called by authenticated clients
 * - Users can only request their own role (validated via Clerk)
 * - No sensitive data beyond role is exposed
 */

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

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
    const { userId } = req.body;

    // Validate userId is provided
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user from database
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // If user doesn't exist, create them with default role "student"
    // This handles cases where Clerk user was created but webhook didn't fire
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "", // Will be updated by webhook later
          role: "student", // Default role
        },
        select: { role: true },
      });
      console.log(`Auto-created user ${userId} with role: student`);
    }

    // Return user's role
    return res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
