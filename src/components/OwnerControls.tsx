import { useState } from "react";
import { Shield, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ethers } from "ethers";
import { toast } from "@/hooks/use-toast";
import { SEPOLIA_CHAIN_ID } from "@/config/contract";
interface OwnerControlsProps {
  contract: any;
  onRoleChange: () => void;
}

export const OwnerControls = ({ contract, onRoleChange }: OwnerControlsProps) => {
  const [grantPoliceAddress, setGrantPoliceAddress] = useState("");
  const [grantCourtAddress, setGrantCourtAddress] = useState("");
  const [revokePoliceAddress, setRevokePoliceAddress] = useState("");
  const [revokeCourtAddress, setRevokeCourtAddress] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const validateAddress = (address: string) => {
    if (!ethers.utils.isAddress(address)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const grantRole = async (role: 'police' | 'court', address: string) => {
    if (!validateAddress(address)) return;

    const actionKey = `grant-${role}`;
    setLoading(actionKey);
    
    try {
      toast({
        title: "Granting Role",
        description: `Granting ${role} role...`,
      });

      // Ensure Sepolia network before sending tx
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== SEPOLIA_CHAIN_ID) {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: SEPOLIA_CHAIN_ID }] });
        }
      } catch (switchErr) {
        console.error('Network switch failed before tx:', switchErr);
        toast({ title: 'Wrong Network', description: 'Please switch to Sepolia testnet and try again.', variant: 'destructive' });
        setLoading(null);
        return;
      }

      const tx = role === 'police' 
        ? await contract.grantPoliceRole(address)
        : await contract.grantCourtOfficialRole(address);
      
      await tx.wait();

      toast({
        title: "Role Granted",
        description: `Successfully granted ${role} role!`,
      });

      if (role === 'police') {
        setGrantPoliceAddress("");
      } else {
        setGrantCourtAddress("");
      }

      onRoleChange();
    } catch (error: any) {
      console.error(`Error granting ${role} role:`, error);
      toast({
        title: "Grant Failed",
        description: error.reason || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const revokeRole = async (role: 'police' | 'court', address: string) => {
    if (!validateAddress(address)) return;

    const actionKey = `revoke-${role}`;
    setLoading(actionKey);
    
    try {
      toast({
        title: "Revoking Role",
        description: `Revoking ${role} role...`,
      });

      // Ensure Sepolia network before sending tx
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== SEPOLIA_CHAIN_ID) {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: SEPOLIA_CHAIN_ID }] });
        }
      } catch (switchErr) {
        console.error('Network switch failed before tx:', switchErr);
        toast({ title: 'Wrong Network', description: 'Please switch to Sepolia testnet and try again.', variant: 'destructive' });
        setLoading(null);
        return;
      }

      const tx = role === 'police'
        ? await contract.revokePoliceRole(address)
        : await contract.revokeCourtOfficialRole(address);
      
      await tx.wait();

      toast({
        title: "Role Revoked",
        description: `Successfully revoked ${role} role!`,
      });

      if (role === 'police') {
        setRevokePoliceAddress("");
      } else {
        setRevokeCourtAddress("");
      }

      onRoleChange();
    } catch (error: any) {
      console.error(`Error revoking ${role} role:`, error);
      toast({
        title: "Revoke Failed",
        description: error.reason || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-emerald-700 border-b border-emerald-200/60 pb-4">
          <Shield className="w-6 h-6" />
          Owner Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Grant Roles */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-slate-700 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Grant Roles
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="grantPoliceAddress">Grant Police Role</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="grantPoliceAddress"
                    value={grantPoliceAddress}
                    onChange={(e) => setGrantPoliceAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => grantRole('police', grantPoliceAddress)}
                    disabled={loading === 'grant-police' || !grantPoliceAddress}
                    variant="glass"
                    size="default"
                  >
                    {loading === 'grant-police' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Grant"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="grantCourtAddress">Grant Court Official Role</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="grantCourtAddress"
                    value={grantCourtAddress}
                    onChange={(e) => setGrantCourtAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => grantRole('court', grantCourtAddress)}
                    disabled={loading === 'grant-court' || !grantCourtAddress}
                    variant="glass"
                    size="default"
                  >
                    {loading === 'grant-court' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Grant"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          {/* Revoke Roles */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-slate-700 flex items-center gap-2">
              <UserMinus className="w-5 h-5" />
              Revoke Roles
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="revokePoliceAddress">Revoke Police Role</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="revokePoliceAddress"
                    value={revokePoliceAddress}
                    onChange={(e) => setRevokePoliceAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => revokeRole('police', revokePoliceAddress)}
                    disabled={loading === 'revoke-police' || !revokePoliceAddress}
                    variant="danger"
                    size="default"
                  >
                    {loading === 'revoke-police' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="revokeCourtAddress">Revoke Court Official Role</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="revokeCourtAddress"
                    value={revokeCourtAddress}
                    onChange={(e) => setRevokeCourtAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => revokeRole('court', revokeCourtAddress)}
                    disabled={loading === 'revoke-court' || !revokeCourtAddress}
                    variant="danger"
                    size="default"
                  >
                    {loading === 'revoke-court' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};