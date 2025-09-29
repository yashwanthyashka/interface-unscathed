import { Wallet, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroBackground from "@/assets/hero-background.jpg";

interface ConnectWalletProps {
  onConnect: () => void;
  isLoading: boolean;
}

export const ConnectWallet = ({ onConnect, isLoading }: ConnectWalletProps) => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/95 to-cyan-100/95" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 glass-card rounded-full animate-glow">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold gradient-text tracking-tight mb-4">
            Evidence Management
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Secure, Immutable, Decentralized.
          </p>
        </header>

        {/* Connect Card */}
        <Card className="glass-card border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-muted-foreground text-sm">
                Access the secure evidence management system
              </p>
            </div>
            
            <Button
              onClick={onConnect}
              disabled={isLoading}
              variant="primary"
              size="xl"
              className="w-full"
            >
              <Wallet className="w-5 h-5" />
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card p-4 rounded-xl">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground">Blockchain Secured</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground">Immutable Records</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground">Role-Based Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};