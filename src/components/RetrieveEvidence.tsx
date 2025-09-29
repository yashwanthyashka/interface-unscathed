import { useState } from "react";
import { Search, Loader2, ExternalLink, Calendar, User, FileText, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EvidenceItem } from "@/types/web3";
import { toast } from "@/hooks/use-toast";

interface RetrieveEvidenceProps {
  contract: any;
}

export const RetrieveEvidence = ({ contract }: RetrieveEvidenceProps) => {
  const [evidenceId, setEvidenceId] = useState("");
  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(false);

  const getEvidence = async () => {
    if (!evidenceId) {
      toast({
        title: "Missing ID",
        description: "Please enter an Evidence ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      toast({
        title: "Retrieving Evidence",
        description: "Fetching evidence from blockchain...",
      });

      const result = await contract.getEvidence(evidenceId);
      const [id, caseId, description, ipfsHash, uploadedBy, timestamp] = result;

      const evidenceData: EvidenceItem = {
        id: id.toNumber(),
        caseId,
        description,
        ipfsHash,
        uploadedBy,
        timestamp: timestamp.toNumber(),
      };

      setEvidence(evidenceData);
      toast({
        title: "Evidence Retrieved",
        description: "Evidence successfully retrieved from blockchain.",
      });

    } catch (error: any) {
      console.error("Error getting evidence:", error);
      setEvidence(null);
      toast({
        title: "Retrieval Failed",
        description: error.reason || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-emerald-700 border-b border-emerald-200/60 pb-4">
          <Search className="w-6 h-6" />
          Retrieve Evidence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search Form */}
          <div>
            <Label htmlFor="evidenceId">Evidence ID</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="evidenceId"
                type="number"
                value={evidenceId}
                onChange={(e) => setEvidenceId(e.target.value)}
                placeholder="e.g., 1"
                className="flex-1"
              />
              <Button
                onClick={getEvidence}
                disabled={loading || !evidenceId}
                variant="glass"
                size="default"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Get
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Evidence Details */}
          <div className="min-h-[200px] p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
            {evidence ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Evidence Details (ID: {evidence.id})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Case ID</span>
                      </div>
                      <p className="text-foreground font-semibold">{evidence.caseId}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Timestamp</span>
                      </div>
                      <p className="text-foreground font-semibold">{formatDate(evidence.timestamp)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Uploaded By</span>
                      </div>
                      <p className="text-foreground font-semibold font-mono">
                        {formatAddress(evidence.uploadedBy)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">IPFS File</span>
                      </div>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${evidence.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-semibold text-sm break-all underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
                      >
                        View File →
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                  </div>
                  <p className="text-foreground font-medium leading-relaxed bg-white/50 p-3 rounded-lg border">
                    {evidence.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Evidence details will appear here...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};