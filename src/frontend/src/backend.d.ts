import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BodyCompositionInput {
    weight: number;
    muscleMass: number;
    bodyFatPercentage: number;
}
export interface FastingSession {
    isCompleted: boolean;
    durationHours: bigint;
    endTimestamp: Time;
    startTimestamp: Time;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface DayRoutines {
    nutritionMetrics: NutritionMetrics;
    bodyComposition: BodyCompositionInput;
    stressMetrics: StressMetrics;
    fastingSession: FastingSession;
    sleepMetrics: SleepMetrics;
    trainingSessions: Array<Training>;
}
export interface BodyComposition {
    bmi: number;
    currentBodyFatPercentage: number;
    bmiCategory: BMIIndicatorCategory;
    history: Array<BodyCompentry>;
    currentMuscleMass: number;
    currentWeight: number;
}
export interface BodyCompentry {
    weight: number;
    muscleMass: number;
    timestamp: Time;
    bodyFatPercentage: number;
}
export interface AutophagyScore {
    sleepScore: bigint;
    stressScore: bigint;
    totalScore: bigint;
    fastingScore: bigint;
    trainingScore: bigint;
}
export interface SupplementResponse {
    supplements: Array<SupplementEntry>;
    message: string;
}
export interface TokenSupply {
    circulatingSupply: TokenBalance;
    supplyCap: TokenBalance;
    totalSupply: TokenBalance;
    remainingSupply: TokenBalance;
}
export interface LegalDisclaimerStatus {
    lastSeenTimestamp?: Time;
    hasSeenDisclaimer: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type RoutineDayId = bigint;
export interface QueryTokenTransaction {
    description: string;
    timestamp: Time;
    tokenType: TokenType;
    amount: bigint;
    transactionId: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface DayData {
    completionTime: Time;
    longevityScore: LongevityScore;
    routines: DayRoutines;
    autophagyScore: AutophagyScore;
}
export interface Preferences {
    language: Variant_de_en;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SortResponse {
    supplements: Array<SupplementEntry>;
    message: string;
}
export interface Training {
    durationMins: bigint;
    trainingType: TrainingType;
    intensity: TrainingIntensity;
}
export interface TokenDistribution {
    communityRewardPool: TokenBalance;
    creatorTreasury: TokenBalance;
    totalSupply: TokenBalance;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface LongevityScore {
    autophagyCouplingScore: bigint;
    totalScore: bigint;
    nutritionScore: bigint;
    bodyCompositionScore: bigint;
}
export interface JournalEntry {
    id: bigint;
    content: string;
    timestamp: Time;
}
export interface SupplementEntry {
    id: bigint;
    dosage: string;
    name: string;
    note?: string;
    time: string;
    completed: boolean;
}
export interface NutritionMetrics {
    veggieIntake: bigint;
    proteinTarget: bigint;
    proteinIntake: bigint;
    waterIntake: bigint;
}
export interface ResetResponse {
    supplements: Array<SupplementEntry>;
    message: string;
}
export interface SleepMetrics {
    durationHours: bigint;
    qualityRating: bigint;
}
export type TrainingType = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "yoga";
    yoga: null;
} | {
    __kind__: "strength";
    strength: null;
} | {
    __kind__: "cardio";
    cardio: null;
};
export interface StressMetrics {
    stressColorIndicator: ColorIndicator;
    bloodPressureDiastolic: bigint;
    pulse: bigint;
    bloodPressureSystolic: bigint;
}
export type TokenBalance = bigint;
export interface UserProfile {
    birthYear: bigint;
    name: string;
    preferences: Preferences;
    gender: Gender;
    bodyHeightCm: bigint;
}
export enum BMIIndicatorCategory {
    slightlyLow = "slightlyLow",
    tooHigh = "tooHigh",
    tooLow = "tooLow",
    slightlyHigh = "slightlyHigh",
    optimal = "optimal"
}
export enum ColorIndicator {
    red = "red",
    green = "green",
    yellow = "yellow"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum TokenType {
    goal = "goal",
    routine = "routine",
    bonus = "bonus"
}
export enum TrainingIntensity {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UtilityType {
    advancedAnalytics = "advancedAnalytics",
    longevityCircleMembership = "longevityCircleMembership",
    supplementPlans = "supplementPlans"
}
export enum Variant_de_en {
    de = "de",
    en = "en"
}
export interface backendInterface {
    addSupplement(name: string, dosage: string, time: string, note: string | null, completed: boolean): Promise<SupplementResponse>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cleanupInactiveAccounts(): Promise<void>;
    clearTrainings(): Promise<void>;
    completeRoutines(newRoutines: DayRoutines): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createJournalEntry(content: string): Promise<JournalEntry>;
    deleteJournalEntry(entryId: bigint): Promise<void>;
    deleteSupplement(supplementId: bigint): Promise<void>;
    getAllDailyRoutines(): Promise<[Array<[RoutineDayId, DayData]>, bigint]>;
    getAllSupplements(): Promise<Array<SupplementEntry>>;
    getAutophagyScore(dayId: bigint): Promise<AutophagyScore | null>;
    getBalance(p: Principal): Promise<TokenBalance>;
    getBodyComposition(): Promise<BodyComposition | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyRoutineStats(): Promise<bigint>;
    getJournalEntries(): Promise<Array<JournalEntry>>;
    getLegalDisclaimerStatus(): Promise<LegalDisclaimerStatus>;
    getLegalDisclaimerStatusFor(p: Principal): Promise<LegalDisclaimerStatus>;
    getLongevityScore(dayId: bigint): Promise<LongevityScore | null>;
    getPoolBalances(): Promise<TokenDistribution>;
    getPreferences(): Promise<Preferences>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSupplementStoreSize(): Promise<bigint>;
    getTokenBalance(): Promise<bigint>;
    getTokenSupplyInfo(): Promise<TokenSupply>;
    getTokenTransactions(): Promise<Array<QueryTokenTransaction>>;
    getTrainings(): Promise<Array<Training>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    mintRewardTokens(user: Principal, amount: TokenBalance): Promise<void>;
    resetAllSupplements(): Promise<ResetResponse>;
    resetAnalyses(): Promise<void>;
    resetLegalDisclaimerStatus(): Promise<void>;
    resetTokenDistribution(): Promise<TokenDistribution>;
    saveBodyComposition(weight: number, bodyFatPercentage: number, muscleMass: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveTraining(training: Training): Promise<void>;
    setLegalDisclaimerSeen(): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    sortSupplementsByTime(): Promise<SortResponse>;
    toggleSupplement(supplementId: bigint): Promise<void>;
    transferTokens(to: Principal, amount: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlockUtility(utilityType: UtilityType): Promise<void>;
    updateJournalEntry(entryId: bigint, newContent: string): Promise<void>;
    updateSupplement(supplementId: bigint, name: string, dosage: string, time: string, note: string | null): Promise<void>;
}
