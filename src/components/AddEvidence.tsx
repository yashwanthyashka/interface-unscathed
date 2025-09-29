import { useState } from "react";
import { FileText, Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { uploadToPinata } from "@/config/pinata";
import { SEPOLIA_CHAIN_ID } from "@/config/contract";
import { toast } from "@/hooks/use-toast";
interface AddEvidenceProps {
  contract: any;
}

export const AddEvidence = ({ contract }: AddEvidenceProps) => {
  const [caseId, setCaseId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const addEvidence = async () => {
    if (!caseId || !description || !file) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Upload to IPFS
      toast({
        title: "Uploading to IPFS",
        description: "Step 1/2: Uploading file to IPFS...",
      });

      const ipfsHash = await uploadToPinata(file);

      // Step 2: Add to blockchain
      toast({
        title: "Adding to Blockchain",
        description: "Step 2/2: Adding evidence to blockchain...",
      });

      // Ensure we're on Sepolia before sending the transaction
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== SEPOLIA_CHAIN_ID) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        }
      } catch (switchErr) {
        console.error('Network switch failed before tx:', switchErr);
        toast({
          title: "Wrong Network",
          description: "Please switch to Sepolia testnet and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const tx = await contract.addEvidence(caseId, description, ipfsHash);
      await tx.wait();

      toast({
        title: "Evidence Added",
        description: "Evidence successfully added to the blockchain!",
      });

      // Reset form
      setCaseId("");
      setDescription("");
      setFile(null);
      const fileInput = document.getElementById('evidenceFile') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error: any) {
      console.error("Error adding evidence:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-emerald-700 border-b border-emerald-200/60 pb-4">
          <FileText className="w-6 h-6" />
          Add New Evidence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="caseId">Case ID</Label>
            <Input
              id="caseId"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="e.g., CASE-2025-001"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="evidenceDescription">Evidence Description</Label>
            <Textarea
              id="evidenceDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of the evidence..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="evidenceFile">Evidence File</Label>
            <div className="mt-2">
              <Input
                id="evidenceFile"
                type="file"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <LinkIcon className="w-4 h-4" />
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={addEvidence}
            disabled={loading || !caseId || !description || !file}
            variant="primary"
            size="lg"
            className="w-full mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Add to Blockchain
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};