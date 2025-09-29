import { Shield, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TopBarProps {
  userAddress: string;
  isOwner: boolean;
  isPolice: boolean;
  isCourtOfficial: boolean;
}

export const TopBar = ({ userAddress, isOwner, isPolice, isCourtOfficial }: TopBarProps) => {
  const [copied, setCopied] = useState(false);

  const getUserRole = () => {
    if (isOwner) return "Owner";
    if (isPolice) return "Police";
    if (isCourtOfficial) return "Court Official";
    return "User";
  };

  const getRoleColor = () => {
    if (isOwner) return "text-yellow-600";
    if (isPolice) return "text-blue-600";
    if (isCourtOfficial) return "text-purple-600";
    return "text-slate-600";
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card border-0 mb-8">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-bold gradient-text text-lg">Evidence dApp</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <User className={`w-4 h-4 ${getRoleColor()}`} />
              <span className={`text-sm font-semibold ${getRoleColor()}`}>
                {getUserRole()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};