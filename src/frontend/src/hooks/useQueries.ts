import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import type { UserProfile, DayRoutines, UtilityType, LegalDisclaimerStatus, BodyComposition, JournalEntry, DayData, RoutineDayId, SupplementEntry, AutophagyScore, LongevityScore, TokenSupply, TokenDistribution, Training } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCompleteRoutines() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routines: DayRoutines) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeRoutines(routines);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyRoutineStats'] });
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['allDailyRoutines'] });
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      queryClient.invalidateQueries({ queryKey: ['tokenSupplyInfo'] });
      queryClient.invalidateQueries({ queryKey: ['performanceRewards'] });
      queryClient.invalidateQueries({ queryKey: ['poolBalances'] });
    },
  });
}

export function useGetDailyRoutineStats() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['dailyRoutineStats'],
    queryFn: async () => {
      if (!actor) return 0;
      const stats = await actor.getDailyRoutineStats();
      return Number(stats);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllDailyRoutines() {
  const { actor, isFetching } = useActor();

  return useQuery<{ routines: Array<[RoutineDayId, DayData]>; count: number }>({
    queryKey: ['allDailyRoutines'],
    queryFn: async () => {
      if (!actor) return { routines: [], count: 0 };
      const [routines, count] = await actor.getAllDailyRoutines();
      return { routines, count: Number(count) };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAutophagyScore() {
  const { actor, isFetching } = useActor();

  return useMutation({
    mutationFn: async (dayId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAutophagyScore(dayId);
    },
  });
}

export function useGetLongevityScore() {
  const { actor, isFetching } = useActor();

  return useMutation({
    mutationFn: async (dayId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLongevityScore(dayId);
    },
  });
}

export function useGetTokenBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['tokenBalance'],
    queryFn: async () => {
      if (!actor) return 0;
      const balance = await actor.getTokenBalance();
      return Number(balance);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTokenTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['tokenTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTokenTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTokenSupplyInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<TokenSupply | null>({
    queryKey: ['tokenSupplyInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTokenSupplyInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPoolBalances() {
  const { actor, isFetching } = useActor();

  return useQuery<TokenDistribution | null>({
    queryKey: ['poolBalances'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPoolBalances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useResetTokenDistribution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetTokenDistribution();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['tokenSupplyInfo'] });
      queryClient.invalidateQueries({ queryKey: ['poolBalances'] });
      queryClient.invalidateQueries({ queryKey: ['performanceRewards'] });
    },
  });
}

export function useResetAnalyses() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAnalyses();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDailyRoutines'] });
      queryClient.invalidateQueries({ queryKey: ['bodyComposition'] });
      queryClient.invalidateQueries({ queryKey: ['dailyRoutineStats'] });
    },
  });
}

export function useTransferTokens() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, amount }: { to: string; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      const toPrincipal = Principal.fromText(to);
      return actor.transferTokens(toPrincipal, BigInt(amount));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['tokenSupplyInfo'] });
      queryClient.invalidateQueries({ queryKey: ['poolBalances'] });
    },
  });
}

// LivSpan Ecosystem 3.0 Finale Hooks

// Health-Performance-Rewards System
export function useGetPerformanceRewards() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    totalEarned: number;
    scoreImprovements: Array<{ date: string; autophagyImprovement: number; longevityImprovement: number; tokensEarned: number }>;
    milestones: Array<{ name: string; achieved: boolean; reward: number }>;
    consistencyBonus: number;
  }>({
    queryKey: ['performanceRewards'],
    queryFn: async () => {
      if (!actor) return { totalEarned: 0, scoreImprovements: [], milestones: [], consistencyBonus: 0 };
      // TODO: Implement actor.getPerformanceRewards() when backend is ready
      // Placeholder data for UI development
      return {
        totalEarned: 150,
        scoreImprovements: [
          { date: '2025-01-20', autophagyImprovement: 5, longevityImprovement: 3, tokensEarned: 15 },
          { date: '2025-01-21', autophagyImprovement: 8, longevityImprovement: 6, tokensEarned: 20 },
        ],
        milestones: [
          { name: 'First Week Streak', achieved: true, reward: 50 },
          { name: 'Autophagy Master (80+)', achieved: false, reward: 100 },
        ],
        consistencyBonus: 25,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnlockUtility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (utilityType: UtilityType) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlockUtility(utilityType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
      queryClient.invalidateQueries({ queryKey: ['utilityFeatures'] });
      queryClient.invalidateQueries({ queryKey: ['tokenTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['tokenSupplyInfo'] });
      queryClient.invalidateQueries({ queryKey: ['poolBalances'] });
    },
  });
}

export function useGetLegalDisclaimerStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<LegalDisclaimerStatus>({
    queryKey: ['legalDisclaimerStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLegalDisclaimerStatus();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSetLegalDisclaimerSeen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.setLegalDisclaimerSeen();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalDisclaimerStatus'] });
    },
  });
}

export function useGetBodyComposition() {
  const { actor, isFetching } = useActor();

  return useQuery<BodyComposition | null>({
    queryKey: ['bodyComposition'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBodyComposition();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBodyComposition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ weight, bodyFat, muscleMass }: { weight: number; bodyFat: number; muscleMass: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveBodyComposition(weight, bodyFat, muscleMass);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyComposition'] });
    },
  });
}

export function useGetJournalEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJournalEntry(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

export function useUpdateJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId, content }: { entryId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateJournalEntry(entryId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteJournalEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },
  });
}

// Supplement hooks
export function useGetSupplements() {
  const { actor, isFetching } = useActor();

  return useQuery<SupplementEntry[]>({
    queryKey: ['supplements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSupplements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSupplement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, dosage, time, note }: { name: string; dosage: string; time: string; note: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSupplement(name, dosage, time, note, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

export function useUpdateSupplement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplementId, name, dosage, time, note }: { supplementId: bigint; name: string; dosage: string; time: string; note: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSupplement(supplementId, name, dosage, time, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

export function useDeleteSupplement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplementId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSupplement(supplementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

export function useToggleSupplement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplementId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleSupplement(supplementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
    },
  });
}

// Training persistence hooks
export function useGetTrainings() {
  const { actor, isFetching } = useActor();

  return useQuery<Training[]>({
    queryKey: ['trainings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrainings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveAllTrainings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainings: Training[]) => {
      if (!actor) throw new Error('Actor not available');
      
      // Clear existing trainings first
      await actor.clearTrainings();
      
      // Save each training sequentially
      for (const training of trainings) {
        await actor.saveTraining(training);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

export function useClearTrainings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearTrainings();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}
