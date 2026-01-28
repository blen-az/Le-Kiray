import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserRole } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Admin service to manage users and platform operations
 */

export const createAgentAsAdmin = async (
  agentData: {
    id: string; // Firebase UID
    name: string;
    email: string;
    companyName: string;
  }
): Promise<User> => {
  try {
    const userData = {
      id: agentData.id,
      name: agentData.name,
      email: agentData.email,
      role: UserRole.AGENT,
      companyName: agentData.companyName,
      isApproved: true, // Admin creates agents already approved
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    await setDoc(doc(db, USERS_COLLECTION, agentData.id), userData);
    console.log('Agent created successfully:', agentData.id);

    return {
      id: agentData.id,
      name: agentData.name,
      email: agentData.email,
      role: UserRole.AGENT,
      companyName: agentData.companyName,
      isApproved: true,
    };
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

/**
 * Get all agents
 */
export const getAllAgents = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', UserRole.AGENT));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      role: doc.data().role,
      companyName: doc.data().companyName,
      isApproved: doc.data().isApproved,
    }));
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

/**
 * Approve/Deny agent
 */
export const updateAgentApproval = async (
  agentId: string,
  isApproved: boolean
): Promise<void> => {
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, agentId),
      { isApproved, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    console.log('Agent approval status updated:', agentId);
  } catch (error) {
    console.error('Error updating agent approval:', error);
    throw error;
  }
};
