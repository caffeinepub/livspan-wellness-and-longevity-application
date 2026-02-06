import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useGetTokenBalance, 
  useGetTokenTransactions, 
  useTransferTokens,
  useGetTokenSupplyInfo,
  useGetPerformanceRewards,
  useGetPoolBalances,
  useResetTokenDistribution
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Coins, TrendingUp, Send, Copy, Check, Link as LinkIcon, Award, Vault, RefreshCw, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Variant_de_en } from '../backend';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TokenWallet() {
  const { data: balance } = useGetTokenBalance();
  const { data: transactions } = useGetTokenTransactions();
  const { data: supplyInfo } = useGetTokenSupplyInfo();
  const { data: poolBalances } = useGetPoolBalances();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: performanceRewards } = useGetPerformanceRewards();
  const { identity } = useInternetIdentity();
  const transferTokens = useTransferTokens();
  const resetDistribution = useResetTokenDistribution();
  const { actor } = useActor();

  const isGerman = userProfile?.preferences.language === Variant_de_en.de;

  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const walletAddress = identity?.getPrincipal().toString() || '';

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor,
  });

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatNumber = (num: bigint | number) => {
    return Number(num).toLocaleString('de-DE');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success(isGerman ? 'Wallet-Adresse kopiert!' : 'Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = async () => {
    if (!recipientAddress || !transferAmount) {
      toast.error(isGerman ? 'Bitte alle Felder ausfüllen' : 'Please fill in all fields');
      return;
    }

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(isGerman ? 'Ungültiger Betrag' : 'Invalid amount');
      return;
    }

    if (balance !== undefined && amount > balance) {
      toast.error(isGerman ? 'Unzureichendes Guthaben' : 'Insufficient balance');
      return;
    }

    try {
      await transferTokens.mutateAsync({ to: recipientAddress, amount });
      toast.success(
        isGerman 
          ? `${amount} LIV-Token erfolgreich on-chain übertragen!` 
          : `Successfully transferred ${amount} LIV tokens on-chain!`
      );
      setRecipientAddress('');
      setTransferAmount('');
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error.message || (isGerman ? 'Übertragung fehlgeschlagen' : 'Transfer failed'));
    }
  };

  const handleResetDistribution = async () => {
    try {
      await resetDistribution.mutateAsync();
      toast.success(
        isGerman 
          ? 'Token-Verteilung erfolgreich zurückgesetzt! Alle Guthaben auf Null gesetzt und 21M LIV neu verteilt.' 
          : 'Token distribution successfully reset! All balances zeroed and 21M LIV redistributed.'
      );
    } catch (error: any) {
      console.error('Reset error:', error);
      toast.error(error.message || (isGerman ? 'Zurücksetzen fehlgeschlagen' : 'Reset failed'));
    }
  };

  // Calculate supply invariant verification
  const verifySupplyInvariant = () => {
    if (!poolBalances || balance === undefined) return null;
    
    const totalInPools = Number(poolBalances.creatorTreasury) + Number(poolBalances.communityRewardPool);
    const expectedTotal = 21_000_000;
    const isValid = totalInPools === expectedTotal;
    
    return { totalInPools, expectedTotal, isValid };
  };

  const invariantCheck = verifySupplyInvariant();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/liv-token-transparent.dim_64x64.png" alt="LIV" className="h-8 w-8" />
            <div>
              <CardTitle className="flex items-center gap-2">
                LIV Wallet
                <Badge variant="outline" className="text-xs font-normal">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  ICRC-1
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {isGerman 
                  ? 'LivSpan Ecosystem 3.0 Finale - Gesundheit verdient Belohnungen' 
                  : 'LivSpan Ecosystem 3.0 Finale - Health Earns Rewards'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-mono text-xl font-bold text-primary">
                {balance !== undefined ? Number(balance).toLocaleString('de-DE') : '0'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pools" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pools">
              <Vault className="h-4 w-4 mr-1" />
              {isGerman ? 'Pools' : 'Pools'}
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Award className="h-4 w-4 mr-1" />
              {isGerman ? 'Belohnungen' : 'Rewards'}
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <Send className="h-4 w-4 mr-1" />
              {isGerman ? 'Transfer' : 'Transfer'}
            </TabsTrigger>
          </TabsList>

          {/* Ecosystem Pools Tab - Final Dual-Pool Redistribution */}
          <TabsContent value="pools" className="space-y-4">
            <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src="/assets/generated/creator-treasury.dim_1024x600.png" alt="Ecosystem Pools" className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-sm font-semibold">
                      {isGerman ? 'LivSpan Ecosystem 3.0 Finale - Token-Verteilung' : 'LivSpan Ecosystem 3.0 Finale - Token Distribution'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isGerman ? 'Gesamtversorgung: 21.000.000 LIV (Fest)' : 'Total Supply: 21,000,000 LIV (Fixed)'}
                    </p>
                  </div>
                </div>
                
                {/* Admin Reset Button */}
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {isGerman ? 'Zurücksetzen' : 'Reset'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          {isGerman ? 'Token-Verteilung zurücksetzen?' : 'Reset Token Distribution?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            {isGerman 
                              ? 'Diese Aktion wird:' 
                              : 'This action will:'}
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>
                              {isGerman 
                                ? 'Alle Wallet-Guthaben auf Null setzen' 
                                : 'Reset all wallet balances to zero'}
                            </li>
                            <li>
                              {isGerman 
                                ? 'Alle Transaktionshistorien löschen' 
                                : 'Clear all transaction histories'}
                            </li>
                            <li>
                              {isGerman 
                                ? '21M LIV neu verteilen: 40% Creator Treasury, 60% Community Reward Pool' 
                                : 'Redistribute 21M LIV: 40% Creator Treasury, 60% Community Reward Pool'}
                            </li>
                          </ul>
                          <p className="text-destructive font-semibold mt-2">
                            {isGerman 
                              ? 'Diese Aktion kann nicht rückgängig gemacht werden!' 
                              : 'This action cannot be undone!'}
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {isGerman ? 'Abbrechen' : 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetDistribution}
                          disabled={resetDistribution.isPending}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {resetDistribution.isPending 
                            ? (isGerman ? 'Zurücksetzen...' : 'Resetting...') 
                            : (isGerman ? 'Zurücksetzen bestätigen' : 'Confirm Reset')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <div className="space-y-4">
                {/* Creator Treasury - 40% */}
                <div className="rounded-lg border border-primary/30 bg-background/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Vault className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold">
                        {isGerman ? 'Schöpfer-Schatzkammer' : 'Creator Treasury'}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {isGerman ? '40% - Community-Operationen & Belohnungen' : '40% - Community Operations & Rewards'}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {poolBalances ? formatNumber(poolBalances.creatorTreasury) : '8.400.000'} LIV
                    </Badge>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>

                {/* Community Reward Pool - 60% */}
                <div className="rounded-lg border border-accent/30 bg-background/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-accent/10 p-2">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold">
                        {isGerman ? 'Gemeinschafts-Belohnungspool' : 'Community Reward Pool'}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {isGerman ? '60% - Gesundheits-Leistungs-Belohnungen (Verringert sich bei Auszahlung)' : '60% - Health-Performance Rewards (Decreases as paid out)'}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {poolBalances ? formatNumber(poolBalances.communityRewardPool) : '12.600.000'} LIV
                    </Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                {/* Supply Invariant Verification */}
                {invariantCheck && (
                  <div className={`rounded-lg border p-3 ${invariantCheck.isValid ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {invariantCheck.isValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <h5 className="text-xs font-semibold">
                        {isGerman ? 'Versorgungsinvariante Überprüfung' : 'Supply Invariant Verification'}
                      </h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isGerman 
                        ? `Gesamt in Pools: ${formatNumber(invariantCheck.totalInPools)} LIV = ${formatNumber(invariantCheck.expectedTotal)} LIV (Erwartet)` 
                        : `Total in Pools: ${formatNumber(invariantCheck.totalInPools)} LIV = ${formatNumber(invariantCheck.expectedTotal)} LIV (Expected)`}
                    </p>
                    {invariantCheck.isValid && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {isGerman ? '✓ Invariante erfüllt' : '✓ Invariant satisfied'}
                      </p>
                    )}
                  </div>
                )}

                {/* Supply Info */}
                {supplyInfo && (
                  <div className="rounded-lg border border-border/50 bg-background/30 p-4 mt-4">
                    <h5 className="text-xs font-semibold mb-3">
                      {isGerman ? 'On-Chain Versorgungsstatistiken' : 'On-Chain Supply Statistics'}
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-background/50 p-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          {isGerman ? 'Gesamtversorgung' : 'Total Supply'}
                        </p>
                        <p className="font-mono text-sm font-bold">
                          21.000.000 LIV
                        </p>
                      </div>
                      <div className="rounded-md bg-background/50 p-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          {isGerman ? 'Zirkulierend' : 'Circulating'}
                        </p>
                        <p className="font-mono text-sm font-bold text-primary">
                          {formatNumber(supplyInfo.circulatingSupply)} LIV
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Health-Performance-Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/generated/performance-rewards.dim_1024x400.png" alt="Performance Rewards" className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <h4 className="text-sm font-semibold">
                    {isGerman ? 'Gesundheits-Leistungs-Belohnungen' : 'Health-Performance-Rewards'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isGerman ? 'Aus dem Gemeinschafts-Belohnungspool (60%)' : 'From Community Reward Pool (60%)'}
                  </p>
                </div>
              </div>

              {performanceRewards && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isGerman ? 'Gesamt verdient' : 'Total Earned'}
                      </p>
                      <p className="font-mono text-lg font-bold text-primary">
                        {performanceRewards.totalEarned} LIV
                      </p>
                    </div>
                    <div className="rounded-md bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isGerman ? 'Konsistenz-Bonus' : 'Consistency Bonus'}
                      </p>
                      <p className="font-mono text-lg font-bold text-accent">
                        {performanceRewards.consistencyBonus} LIV
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold">
                      {isGerman ? 'Letzte Score-Verbesserungen' : 'Recent Score Improvements'}
                    </h5>
                    <div className="space-y-2">
                      {performanceRewards.scoreImprovements.map((improvement, idx) => (
                        <div key={idx} className="rounded-md border border-border/50 bg-background/50 p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              <span className="text-xs">{improvement.date}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              +{improvement.tokensEarned} LIV
                            </Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {isGerman ? 'Autophagie' : 'Autophagy'}: +{improvement.autophagyImprovement} | 
                            {isGerman ? ' Langlebigkeit' : ' Longevity'}: +{improvement.longevityImprovement}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold">
                      {isGerman ? 'Meilensteine' : 'Milestones'}
                    </h5>
                    <div className="space-y-2">
                      {performanceRewards.milestones.map((milestone, idx) => (
                        <div key={idx} className="rounded-md border border-border/50 bg-background/50 p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {milestone.achieved ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Award className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-xs">{milestone.name}</span>
                            </div>
                            <Badge variant={milestone.achieved ? 'default' : 'outline'} className="text-xs">
                              {milestone.reward} LIV
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-4">
            {/* On-Chain Wallet Address */}
            <div className="rounded-lg border border-border/50 bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">
                  {isGerman ? 'On-Chain Wallet-Adresse' : 'On-Chain Wallet Address'}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {isGerman ? 'Internet Computer' : 'Internet Computer'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded bg-muted px-3 py-2 text-xs font-mono">
                  {walletAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* ICRC-1 Token Transfer */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Send className="h-4 w-4" />
                {isGerman ? 'LIV-Token on-chain senden' : 'Send LIV Tokens On-Chain'}
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="recipient" className="text-xs">
                    {isGerman ? 'Empfänger Principal-ID' : 'Recipient Principal ID'}
                  </Label>
                  <Input
                    id="recipient"
                    placeholder={isGerman ? 'Principal-ID eingeben' : 'Enter principal ID'}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-xs">
                    {isGerman ? 'Betrag (LIV)' : 'Amount (LIV)'}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="mt-1"
                    min="1"
                  />
                </div>
                <Button
                  onClick={handleTransfer}
                  disabled={transferTokens.isPending || !recipientAddress || !transferAmount}
                  className="w-full"
                >
                  {transferTokens.isPending ? (
                    isGerman ? 'On-Chain Übertragung...' : 'On-Chain Transfer...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {isGerman ? 'Token on-chain senden' : 'Send Tokens On-Chain'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="rounded-lg border border-border/50 bg-background/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  {isGerman ? 'On-Chain Transaktionshistorie' : 'On-Chain Transaction History'}
                </h4>
                <Badge variant="outline" className="text-xs">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  ICRC-1
                </Badge>
              </div>
              <ScrollArea className="h-48">
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 10).map((tx) => (
                      <div key={Number(tx.transactionId)} className="flex items-center justify-between rounded-md border border-border/30 bg-card/50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                          </div>
                        </div>
                        <span className="font-mono text-sm font-semibold text-primary">
                          {tx.description.includes('spent') || tx.description.includes('purchased') ? '-' : '+'}
                          {Number(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isGerman 
                        ? 'Noch keine On-Chain-Transaktionen' 
                        : 'No on-chain transactions yet'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isGerman 
                        ? 'Verbessern Sie Ihre Gesundheit, um LIV zu verdienen!' 
                        : 'Improve your health to earn LIV!'}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
