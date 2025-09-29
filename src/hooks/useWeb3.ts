import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI, SEPOLIA_CHAIN_ID, SEPOLIA_NETWORK } from '@/config/contract';
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

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
          toast({
            title: "Network Error",
            description: "Failed to add Sepolia network to MetaMask",
            variant: "destructive",
          });
          return false;
        }
      } else {
        console.error("Error switching to Sepolia:", switchError);
        toast({
          title: "Network Switch Failed", 
          description: "Please manually switch to Sepolia testnet in MetaMask",
          variant: "destructive",
        });
        return false;
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!checkMetaMask()) return;

    setIsLoading(true);
    try {
      // First request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Switching to Sepolia testnet...",
        });
        
        const switched = await switchToSepolia();
        if (!switched) {
          setIsLoading(false);
          return;
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
        description: "Successfully connected to Sepolia testnet!",
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

      // Listen for chain changes - check if still on Sepolia
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (chainId !== SEPOLIA_CHAIN_ID && web3State.isConnected) {
          toast({
            title: "Network Changed",
            description: "Please switch back to Sepolia testnet",
            variant: "destructive",
          });
        }
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [web3State.isConnected]);

  return {
    ...web3State,
    connectWallet,
    isLoading,
    checkUserRoles: () => checkUserRoles(web3State.contract, web3State.userAddress),
  };
};