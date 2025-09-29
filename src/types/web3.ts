export interface EvidenceItem {
  id: number;
  caseId: string;
  description: string;
  ipfsHash: string;
  uploadedBy: string;
  timestamp: number;
}

export interface Web3State {
  provider: any;
  signer: any;
  contract: any;
  userAddress: string;
  isConnected: boolean;
  isOwner: boolean;
  isPolice: boolean;
  isCourtOfficial: boolean;
}

export type UserRole = 'owner' | 'police' | 'court' | 'none';

export interface ContractMethods {
  addEvidence: (caseId: string, description: string, ipfsHash: string) => Promise<any>;
  getEvidence: (evidenceId: number) => Promise<EvidenceItem>;
  grantPoliceRole: (address: string) => Promise<any>;
  grantCourtOfficialRole: (address: string) => Promise<any>;
  revokePoliceRole: (address: string) => Promise<any>;
  revokeCourtOfficialRole: (address: string) => Promise<any>;
  isPolice: (address: string) => Promise<boolean>;
  isCourtOfficial: (address: string) => Promise<boolean>;
  owner: () => Promise<string>;
  evidenceCount: () => Promise<number>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}