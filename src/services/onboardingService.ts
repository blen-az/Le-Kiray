import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AgentStatus, InviteStatus, AgentInvite, AuditLog } from '../types';

const USERS_COLLECTION = 'users';
const INVITES_COLLECTION = 'agentInvites';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

/**
 * Generate secure random token
 */
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create agent and send onboarding invite
 */
export const createAgentWithInvite = async (
  adminId: string,
  agentData: {
    fullName: string;
    email: string;
    companyName: string;
    phone?: string;
    initialPlan?: string;
  }
): Promise<{ agentId: string; inviteToken: string; inviteLink: string }> => {
  try {
    // Generate agent ID and invite token
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create agent user document (no password yet)
    const agentUser = {
      id: agentId,
      name: agentData.fullName,
      email: agentData.email,
      role: 'AGENT',
      companyName: agentData.companyName,
      status: AgentStatus.PENDING,
      contactPhone: agentData.phone || '',
      passwordHash: null, // Will be set after activation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: adminId,
    };

    await setDoc(doc(db, USERS_COLLECTION, agentId), agentUser);
    console.log('Agent user created:', agentId);

    // Create invite record
    const invite: AgentInvite = {
      id: `invite_${agentId}`,
      agentId,
      email: agentData.email,
      token: inviteToken,
      status: InviteStatus.SENT,
      expiresAt: expiresAt.toISOString(),
      createdBy: adminId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, INVITES_COLLECTION, invite.id), invite);
    console.log('Invite created:', invite.id);

    // Log audit
    await logAudit(adminId, agentId, 'CREATE_AGENT', `Created agent: ${agentData.fullName}`);

    // Generate invite link (use window.location.origin if available, otherwise relative)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteLink = `${baseUrl}/agent/activate?token=${inviteToken}`;

    return { agentId, inviteToken, inviteLink };
  } catch (error) {
    console.error('Error creating agent with invite:', error);
    throw error;
  }
};

/**
 * Verify and activate agent invite
 */
export const verifyInviteToken = async (token: string): Promise<AgentInvite | null> => {
  try {
    console.log('Looking for token in invites collection...');
    const q = query(collection(db, INVITES_COLLECTION), where('token', '==', token));
    const querySnapshot = await getDocs(q);

    console.log('Query result count:', querySnapshot.size);
    if (querySnapshot.empty) {
      console.warn('Invite token not found in database');
      return null;
    }

    const inviteDoc = querySnapshot.docs[0];
    const invite = inviteDoc.data() as AgentInvite;
    console.log('Invite found:', invite);

    // Check if expired
    const expiryDate = new Date(invite.expiresAt);
    const now = new Date();
    console.log('Checking expiry - Now:', now.toISOString(), 'Expires:', invite.expiresAt);
    
    if (expiryDate < now) {
      console.warn('Invite token expired');
      await updateDoc(doc(db, INVITES_COLLECTION, inviteDoc.id), { status: InviteStatus.EXPIRED });
      return null;
    }

    // Check if already used
    if (invite.status === InviteStatus.USED) {
      console.warn('Invite token already used');
      return null;
    }

    console.log('Token verified successfully');
    return invite;
  } catch (error) {
    console.error('Error verifying invite token:', error);
    throw error;
  }
};

/**
 * Complete agent onboarding (set password + profile)
 */
export const completeAgentOnboarding = async (
  agentId: string,
  passwordHash: string,
  inviteToken: string
): Promise<void> => {
  try {
    // Update agent user with password
    await updateDoc(doc(db, USERS_COLLECTION, agentId), {
      passwordHash,
      status: AgentStatus.APPROVED,
      updatedAt: new Date().toISOString(),
    });

    // Mark invite as used
    const q = query(collection(db, INVITES_COLLECTION), where('token', '==', inviteToken));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      await updateDoc(doc(db, INVITES_COLLECTION, querySnapshot.docs[0].id), {
        status: InviteStatus.USED,
        usedAt: new Date().toISOString(),
      });
    }

    // Log audit
    await logAudit('system', agentId, 'AGENT_ACTIVATED', 'Agent completed onboarding');

    console.log('Agent onboarding completed:', agentId);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

/**
 * Resend invite to agent
 */
export const resendAgentInvite = async (agentId: string, adminId: string): Promise<string> => {
  try {
    const agentDoc = await getDoc(doc(db, USERS_COLLECTION, agentId));
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }

    const agentData = agentDoc.data();
    const newToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newInvite: AgentInvite = {
      id: `invite_${agentId}_${Date.now()}`,
      agentId,
      email: agentData.email,
      token: newToken,
      status: InviteStatus.SENT,
      expiresAt: expiresAt.toISOString(),
      createdBy: adminId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, INVITES_COLLECTION, newInvite.id), newInvite);

    await logAudit(adminId, agentId, 'RESEND_INVITE', 'Resent onboarding invite');

    return newToken;
  } catch (error) {
    console.error('Error resending invite:', error);
    throw error;
  }
};

/**
 * Get agent invite details
 */
export const getAgentInvite = async (agentId: string): Promise<AgentInvite | null> => {
  try {
    const q = query(
      collection(db, INVITES_COLLECTION),
      where('agentId', '==', agentId),
      where('status', '==', InviteStatus.SENT)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as AgentInvite;
  } catch (error) {
    console.error('Error getting agent invite:', error);
    throw error;
  }
};

/**
 * Log audit action
 */
export const logAudit = async (
  adminId: string,
  agentId: string | undefined,
  action: string,
  notes?: string
): Promise<void> => {
  try {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      adminId,
      agentId,
      action: action as any,
      timestamp: new Date().toISOString(),
      notes,
    };

    await setDoc(doc(db, AUDIT_LOGS_COLLECTION, auditLog.id), auditLog);
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

/**
 * Get all agents with pending invites
 */
export const getPendingAgents = async (): Promise<any[]> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', 'AGENT'));
    const querySnapshot = await getDocs(q);

    const agents = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const agentData = doc.data();
        const invite = await getAgentInvite(doc.id);
        return {
          ...agentData,
          id: doc.id,
          inviteToken: invite?.token,
          inviteStatus: invite?.status,
        };
      })
    );

    return agents;
  } catch (error) {
    console.error('Error getting pending agents:', error);
    throw error;
  }
};
