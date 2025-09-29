import { useWeb3 } from "@/hooks/useWeb3";
import { ConnectWallet } from "@/components/ConnectWallet";
import { TopBar } from "@/components/TopBar";
import { OwnerControls } from "@/components/OwnerControls";
import { AddEvidence } from "@/components/AddEvidence";
import { RetrieveEvidence } from "@/components/RetrieveEvidence";

export const EvidenceApp = () => {
  const web3 = useWeb3();

  if (!web3.isConnected) {
    return (
      <ConnectWallet
        onConnect={web3.connectWallet}
        isLoading={web3.isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <TopBar
          userAddress={web3.userAddress}
          isOwner={web3.isOwner}
          isPolice={web3.isPolice}
          isCourtOfficial={web3.isCourtOfficial}
        />

        <main className="space-y-8">
          {/* Owner Controls */}
          {web3.isOwner && (
            <OwnerControls
              contract={web3.contract}
              onRoleChange={web3.checkUserRoles}
            />
          )}

          {/* Add Evidence - Only for Police */}
          {web3.isPolice && (
            <AddEvidence contract={web3.contract} />
          )}

          {/* Retrieve Evidence - For Police and Court Officials */}
          {(web3.isPolice || web3.isCourtOfficial) && (
            <RetrieveEvidence contract={web3.contract} />
          )}

          {/* No Access Message */}
          {!web3.isOwner && !web3.isPolice && !web3.isCourtOfficial && (
            <div className="text-center py-16">
              <div className="glass-card p-8 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-muted-foreground mb-4">
                  Access Restricted
                </h3>
                <p className="text-muted-foreground">
                  You don't have the required permissions to access this system.
                  Please contact an administrator to request access.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};