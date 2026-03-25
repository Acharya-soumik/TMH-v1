import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, majlisUsersTable, majlisMessagesTable, majlisInvitesTable, profilesTable } from "@workspace/db";
import { eq, desc, lt, sql, and, count } from "drizzle-orm";
import { cmsSessions } from "./cms";

const router = Router();

interface MajlisRequest extends Request {
  majlisUserId?: number;
}

interface MajlisUserUpdate {
  isActive?: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
}

const majlisSessions = new Map<string, { userId: number; createdAt: number }>();

function requireCmsAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-cms-token"] as string;
  if (!token || !cmsSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized — CMS authentication required" });
  }
  const session = cmsSessions.get(token)!;
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    cmsSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  next();
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function requireMajlisAuth(req: MajlisRequest, res: Response, next: NextFunction) {
  const token = req.headers["x-majlis-token"] as string;
  if (!token || !majlisSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const session = majlisSessions.get(token)!;
  if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
    majlisSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }

  const [dbUser] = await db.select().from(majlisUsersTable)
    .where(eq(majlisUsersTable.id, session.userId))
    .limit(1);

  if (!dbUser || !dbUser.isActive || dbUser.isBanned) {
    majlisSessions.delete(token);
    return res.status(403).json({ error: dbUser?.isBanned ? "Your account has been suspended" : "Your account is no longer active" });
  }

  req.majlisUserId = session.userId;
  next();
}

router.post("/majlis/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, inviteToken } = req.body;
    if (!email || !password || !inviteToken) {
      return res.status(400).json({ error: "Email, password, and invite token are required" });
    }

    const [invite] = await db.select().from(majlisInvitesTable)
      .where(eq(majlisInvitesTable.token, inviteToken))
      .limit(1);

    if (!invite) {
      return res.status(403).json({ error: "Invalid invite token" });
    }
    if (invite.isUsed) {
      return res.status(403).json({ error: "This invite has already been used" });
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return res.status(403).json({ error: "This invite has expired" });
    }
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: "Email does not match the invite" });
    }

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, invite.profileId))
      .limit(1);
    if (!profile) {
      return res.status(403).json({ error: "Associated profile not found" });
    }
    if (!profile.isVerified) {
      return res.status(403).json({ error: "Only verified Voices can register for The Majlis" });
    }

    const existingByProfile = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.profileId, invite.profileId))
      .limit(1);
    if (existingByProfile.length > 0) {
      return res.status(409).json({ error: "This Voice profile already has a Majlis account" });
    }

    const existingByEmail = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.email, email))
      .limit(1);
    if (existingByEmail.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const [user] = await db.insert(majlisUsersTable).values({
      profileId: invite.profileId,
      email,
      passwordHash: await hashPassword(password),
      displayName: profile.name,
    }).returning();

    await db.update(majlisInvitesTable)
      .set({ isUsed: true })
      .where(eq(majlisInvitesTable.id, invite.id));

    const token = generateToken();
    majlisSessions.set(token, { userId: user.id, createdAt: Date.now() });

    res.json({ token, user: { id: user.id, displayName: user.displayName, email: user.email } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(500).json({ error: message });
  }
});

router.post("/majlis/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.email, email))
      .limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Your account is not active" });
    }

    await db.update(majlisUsersTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(majlisUsersTable.id, user.id));

    const token = generateToken();
    majlisSessions.set(token, { userId: user.id, createdAt: Date.now() });

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, user.profileId))
      .limit(1);

    res.json({
      token,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        profileId: user.profileId,
        profile: profile
          ? { name: profile.name, role: profile.role, company: profile.company, imageUrl: profile.imageUrl, isVerified: profile.isVerified }
          : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({ error: message });
  }
});

router.post("/majlis/auth/verify", requireMajlisAuth, async (req: MajlisRequest, res: Response) => {
  try {
    const userId = req.majlisUserId!;
    const [user] = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.id, userId))
      .limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Your account is not active" });
    }

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, user.profileId))
      .limit(1);

    res.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        profileId: user.profileId,
        profile: profile
          ? { name: profile.name, role: profile.role, company: profile.company, imageUrl: profile.imageUrl, isVerified: profile.isVerified }
          : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    res.status(500).json({ error: message });
  }
});

router.get("/majlis/messages", requireMajlisAuth, async (req: MajlisRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const before = req.query.before ? parseInt(req.query.before as string) : null;

    const conditions = [eq(majlisMessagesTable.isDeleted, false)];
    if (before) {
      conditions.push(lt(majlisMessagesTable.id, before));
    }

    const messages = await db
      .select({
        id: majlisMessagesTable.id,
        content: majlisMessagesTable.content,
        replyToId: majlisMessagesTable.replyToId,
        isEdited: majlisMessagesTable.isEdited,
        createdAt: majlisMessagesTable.createdAt,
        userId: majlisMessagesTable.userId,
        userName: majlisUsersTable.displayName,
        profileId: majlisUsersTable.profileId,
        profileName: profilesTable.name,
        profileRole: profilesTable.role,
        profileCompany: profilesTable.company,
        profileImage: profilesTable.imageUrl,
        profileVerified: profilesTable.isVerified,
      })
      .from(majlisMessagesTable)
      .innerJoin(majlisUsersTable, eq(majlisMessagesTable.userId, majlisUsersTable.id))
      .innerJoin(profilesTable, eq(majlisUsersTable.profileId, profilesTable.id))
      .where(and(...conditions))
      .orderBy(desc(majlisMessagesTable.id))
      .limit(limit);

    const userId = req.majlisUserId!;
    await db.update(majlisUsersTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(majlisUsersTable.id, userId));

    res.json({ messages: messages.reverse() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages";
    res.status(500).json({ error: message });
  }
});

router.post("/majlis/messages", requireMajlisAuth, async (req: MajlisRequest, res: Response) => {
  try {
    const userId = req.majlisUserId!;
    const { content, replyToId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    const [user] = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.id, userId))
      .limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been suspended" });
    }
    if (user.isMuted) {
      return res.status(403).json({ error: "You are currently muted" });
    }

    const [newMessage] = await db.insert(majlisMessagesTable).values({
      userId,
      content: content.trim(),
      replyToId: replyToId || null,
    }).returning();

    await db.update(majlisUsersTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(majlisUsersTable.id, userId));

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, user.profileId))
      .limit(1);

    res.json({
      message: {
        ...newMessage,
        userName: user.displayName,
        profileId: user.profileId,
        profileName: profile?.name,
        profileRole: profile?.role,
        profileCompany: profile?.company,
        profileImage: profile?.imageUrl,
        profileVerified: profile?.isVerified,
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to send message";
    res.status(500).json({ error: errMsg });
  }
});

router.get("/majlis/members", requireMajlisAuth, async (_req: MajlisRequest, res: Response) => {
  try {
    const members = await db
      .select({
        id: majlisUsersTable.id,
        displayName: majlisUsersTable.displayName,
        profileId: majlisUsersTable.profileId,
        lastSeenAt: majlisUsersTable.lastSeenAt,
        isActive: majlisUsersTable.isActive,
        profileName: profilesTable.name,
        profileRole: profilesTable.role,
        profileCompany: profilesTable.company,
        profileImage: profilesTable.imageUrl,
        profileVerified: profilesTable.isVerified,
        profileCountry: profilesTable.country,
      })
      .from(majlisUsersTable)
      .innerJoin(profilesTable, eq(majlisUsersTable.profileId, profilesTable.id))
      .where(and(eq(majlisUsersTable.isActive, true), eq(majlisUsersTable.isBanned, false)));

    const now = Date.now();
    const membersWithStatus = members.map(m => ({
      ...m,
      isOnline: m.lastSeenAt ? (now - new Date(m.lastSeenAt).getTime()) < 5 * 60 * 1000 : false,
    }));

    res.json({ members: membersWithStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch members";
    res.status(500).json({ error: message });
  }
});

router.get("/majlis/messages/poll", requireMajlisAuth, async (req: MajlisRequest, res: Response) => {
  try {
    const after = parseInt(req.query.after as string) || 0;

    const messages = await db
      .select({
        id: majlisMessagesTable.id,
        content: majlisMessagesTable.content,
        replyToId: majlisMessagesTable.replyToId,
        isEdited: majlisMessagesTable.isEdited,
        createdAt: majlisMessagesTable.createdAt,
        userId: majlisMessagesTable.userId,
        userName: majlisUsersTable.displayName,
        profileId: majlisUsersTable.profileId,
        profileName: profilesTable.name,
        profileRole: profilesTable.role,
        profileCompany: profilesTable.company,
        profileImage: profilesTable.imageUrl,
        profileVerified: profilesTable.isVerified,
      })
      .from(majlisMessagesTable)
      .innerJoin(majlisUsersTable, eq(majlisMessagesTable.userId, majlisUsersTable.id))
      .innerJoin(profilesTable, eq(majlisUsersTable.profileId, profilesTable.id))
      .where(and(
        eq(majlisMessagesTable.isDeleted, false),
        sql`${majlisMessagesTable.id} > ${after}`
      ))
      .orderBy(majlisMessagesTable.id)
      .limit(50);

    res.json({ messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to poll messages";
    res.status(500).json({ error: message });
  }
});

router.post("/cms/majlis/invites", requireCmsAuth, async (req: Request, res: Response) => {
  try {
    const { profileId, email } = req.body;
    if (!profileId || !email) {
      return res.status(400).json({ error: "profileId and email are required" });
    }

    const [profile] = await db.select().from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .limit(1);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    if (!profile.isVerified) {
      return res.status(400).json({ error: "Only verified Voices can be invited" });
    }

    const existingUser = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.profileId, profileId))
      .limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "This Voice already has a Majlis account" });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invite] = await db.insert(majlisInvitesTable).values({
      profileId,
      email,
      token,
      expiresAt,
    }).returning();

    res.json({ invite: { ...invite, profileName: profile.name } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create invite";
    res.status(500).json({ error: message });
  }
});

router.get("/cms/majlis/invites", requireCmsAuth, async (_req: Request, res: Response) => {
  try {
    const invites = await db
      .select({
        id: majlisInvitesTable.id,
        profileId: majlisInvitesTable.profileId,
        token: majlisInvitesTable.token,
        email: majlisInvitesTable.email,
        isUsed: majlisInvitesTable.isUsed,
        expiresAt: majlisInvitesTable.expiresAt,
        createdAt: majlisInvitesTable.createdAt,
        profileName: profilesTable.name,
      })
      .from(majlisInvitesTable)
      .innerJoin(profilesTable, eq(majlisInvitesTable.profileId, profilesTable.id))
      .orderBy(desc(majlisInvitesTable.createdAt));

    res.json({ invites });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch invites";
    res.status(500).json({ error: message });
  }
});

router.get("/cms/majlis/users", requireCmsAuth, async (_req: Request, res: Response) => {
  try {
    const users = await db
      .select({
        id: majlisUsersTable.id,
        email: majlisUsersTable.email,
        displayName: majlisUsersTable.displayName,
        profileId: majlisUsersTable.profileId,
        isActive: majlisUsersTable.isActive,
        isBanned: majlisUsersTable.isBanned,
        isMuted: majlisUsersTable.isMuted,
        lastSeenAt: majlisUsersTable.lastSeenAt,
        createdAt: majlisUsersTable.createdAt,
        profileName: profilesTable.name,
        profileRole: profilesTable.role,
        profileCompany: profilesTable.company,
        profileImage: profilesTable.imageUrl,
      })
      .from(majlisUsersTable)
      .innerJoin(profilesTable, eq(majlisUsersTable.profileId, profilesTable.id))
      .orderBy(desc(majlisUsersTable.createdAt));

    res.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    res.status(500).json({ error: message });
  }
});

router.patch("/cms/majlis/users/:id", requireCmsAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive, isBanned, isMuted } = req.body;

    const updates: MajlisUserUpdate = {};
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (typeof isBanned === "boolean") updates.isBanned = isBanned;
    if (typeof isMuted === "boolean") updates.isMuted = isMuted;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const [updated] = await db.update(majlisUsersTable)
      .set(updates)
      .where(eq(majlisUsersTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "User not found" });

    if (isBanned || isActive === false) {
      for (const [token, session] of majlisSessions.entries()) {
        if (session.userId === id) majlisSessions.delete(token);
      }
    }

    res.json({ user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    res.status(500).json({ error: message });
  }
});

router.get("/cms/majlis/messages", requireCmsAuth, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const messages = await db
      .select({
        id: majlisMessagesTable.id,
        content: majlisMessagesTable.content,
        isEdited: majlisMessagesTable.isEdited,
        isDeleted: majlisMessagesTable.isDeleted,
        createdAt: majlisMessagesTable.createdAt,
        userId: majlisMessagesTable.userId,
        userName: majlisUsersTable.displayName,
        profileName: profilesTable.name,
      })
      .from(majlisMessagesTable)
      .innerJoin(majlisUsersTable, eq(majlisMessagesTable.userId, majlisUsersTable.id))
      .innerJoin(profilesTable, eq(majlisUsersTable.profileId, profilesTable.id))
      .orderBy(desc(majlisMessagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(majlisMessagesTable);

    res.json({ messages, total, page, limit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch messages";
    res.status(500).json({ error: message });
  }
});

router.delete("/cms/majlis/messages/:id", requireCmsAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(majlisMessagesTable)
      .set({ isDeleted: true })
      .where(eq(majlisMessagesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete message";
    res.status(500).json({ error: message });
  }
});

router.get("/cms/majlis/stats", requireCmsAuth, async (_req: Request, res: Response) => {
  try {
    const [{ userCount }] = await db.select({ userCount: count() }).from(majlisUsersTable);
    const [{ messageCount }] = await db.select({ messageCount: count() }).from(majlisMessagesTable).where(eq(majlisMessagesTable.isDeleted, false));
    const [{ activeCount }] = await db.select({ activeCount: count() }).from(majlisUsersTable).where(eq(majlisUsersTable.isActive, true));
    const [{ bannedCount }] = await db.select({ bannedCount: count() }).from(majlisUsersTable).where(eq(majlisUsersTable.isBanned, true));

    res.json({ userCount, messageCount, activeCount, bannedCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats";
    res.status(500).json({ error: message });
  }
});

export default router;
