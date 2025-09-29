import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '@/config/contract';
import { Web3State } from '@/types/web3';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    userAddress: '',
    isConnected: false,
    isOwner: false,
    isPolice: false,
    isCourtOfficial: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const checkMetaMask = () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Required",
        description: "MetaMask is not installed. Please install it to use this dApp.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const connectWallet = useCallback(async () => {
    if (!checkMetaMask()) return;

    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setWeb3State(prev => ({
        ...prev,
        provider,
        signer,
        contract,
        userAddress,
        isConnected: true,
      }));

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask!",
      });

      // Check user roles
      await checkUserRoles(contract, userAddress);

    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || 'User rejected request.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkUserRoles = async (contract: any, userAddress: string) => {
    try {
      const owner = await contract.owner();
      const isPolice = await contract.isPolice(userAddress);
      const isCourtOfficial = await contract.isCourtOfficial(userAddress);

      setWeb3State(prev => ({
        ...prev,
        isOwner: userAddress.toLowerCase() === owner.toLowerCase(),
        isPolice,
        isCourtOfficial,
      }));
    } catch (error) {
      console.error("Error checking user roles:", error);
      toast({
        title: "Role Check Failed",
        description: "Could not verify user roles.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Listen for account changes
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    ...web3State,
    connectWallet,
    isLoading,
    checkUserRoles: () => checkUserRoles(web3State.contract, web3State.userAddress),
  };
};