import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Auth "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Int "mo:core/Int";



actor {
  public type ColorIndicator = {
    #green;
    #yellow;
    #red;
  };

  public type AutophagyScore = {
    totalScore : Nat;
    fastingScore : Nat;
    trainingScore : Nat;
    sleepScore : Nat;
    stressScore : Nat;
  };

  public type LongevityScore = {
    totalScore : Nat;
    bodyCompositionScore : Nat;
    nutritionScore : Nat;
    autophagyCouplingScore : Nat;
  };

  public type RoutineDayId = Nat;
  public type TokenTransactionId = Nat;
  public type TokenBalance = Nat;

  public type SleepMetrics = {
    durationHours : Nat;
    qualityRating : Nat;
  };

  public type StressMetrics = {
    bloodPressureSystolic : Nat;
    bloodPressureDiastolic : Nat;
    pulse : Nat;
    stressColorIndicator : ColorIndicator;
  };

  public type FastingSession = {
    startTimestamp : Time.Time;
    endTimestamp : Time.Time;
    durationHours : Nat;
    isCompleted : Bool;
  };

  public type Training = {
    trainingType : TrainingType;
    durationMins : Nat;
    intensity : TrainingIntensity;
  };

  public type NutritionMetrics = {
    proteinIntake : Nat;
    veggieIntake : Nat;
    waterIntake : Nat;
    proteinTarget : Nat;
  };

  public type BodyCompositionInput = {
    weight : Float;
    bodyFatPercentage : Float;
    muscleMass : Float;
  };

  public type DayRoutines = {
    fastingSession : FastingSession;
    trainingSessions : [Training];
    sleepMetrics : SleepMetrics;
    stressMetrics : StressMetrics;
    nutritionMetrics : NutritionMetrics;
    bodyComposition : BodyCompositionInput;
  };

  public type DayData = {
    routines : DayRoutines;
    completionTime : Time.Time;
    autophagyScore : AutophagyScore;
    longevityScore : LongevityScore;
  };

  public type TokenTransaction = {
    amount : Nat;
    timestamp : Time.Time;
    tokenType : TokenType;
    description : Text;
  };

  public type QueryTokenTransaction = {
    transactionId : Nat;
    amount : Nat;
    tokenType : TokenType;
    timestamp : Time.Time;
    description : Text;
  };

  public type TokenType = {
    #routine;
    #goal;
    #bonus;
  };

  public type TrainingType = {
    #cardio;
    #strength;
    #yoga;
    #other : Text;
  };

  public type TrainingIntensity = {
    #low;
    #medium;
    #high;
  };

  public type Preferences = {
    language : { #en; #de };
  };

  module Preferences {
    public func compare(_p1 : Preferences, _p2 : Preferences) : Order.Order {
      #equal;
    };
  };

  public type Gender = {
    #male;
    #female;
    #other;
  };

  public type UserProfile = {
    name : Text;
    preferences : Preferences;
    birthYear : Nat;
    bodyHeightCm : Nat;
    gender : Gender;
  };

  public type UtilityType = {
    #advancedAnalytics;
    #supplementPlans;
    #longevityCircleMembership;
  };

  public type UtilityStatus = {
    #locked;
    #unlocked;
    #active;
    #expired;
    #pending;
  };

  public type UtilityFeatureInfo = {
    utilityId : Nat;
    utilityType : UtilityType;
    status : UtilityStatus;
    stakeAmount : Nat;
  };

  public type LegalDisclaimerStatus = {
    hasSeenDisclaimer : Bool;
    lastSeenTimestamp : ?Time.Time;
  };

  public type BodyCompentry = {
    timestamp : Time.Time;
    weight : Float;
    bodyFatPercentage : Float;
    muscleMass : Float;
  };

  public type BodyComposition = {
    currentWeight : Float;
    currentBodyFatPercentage : Float;
    currentMuscleMass : Float;
    bmi : Float;
    bmiCategory : BMIIndicatorCategory;
    history : [BodyCompentry];
  };

  public type BMIIndicatorCategory = {
    #optimal;
    #slightlyHigh;
    #slightlyLow;
    #tooHigh;
    #tooLow;
  };

  public type JournalEntry = {
    id : Nat;
    content : Text;
    timestamp : Time.Time;
  };

  public type SupplementEntry = {
    id : Nat;
    name : Text;
    dosage : Text;
    time : Text;
    note : ?Text;
    completed : Bool;
  };

  public type SupplementResponse = {
    message : Text;
    supplements : [SupplementEntry];
  };

  public type ResetResponse = {
    message : Text;
    supplements : [SupplementEntry];
  };

  public type SortResponse = {
    message : Text;
    supplements : [SupplementEntry];
  };

  public type TokenSupply = {
    totalSupply : TokenBalance;
    circulatingSupply : TokenBalance;
    remainingSupply : TokenBalance;
    supplyCap : TokenBalance;
  };

  public type TokenDistribution = {
    creatorTreasury : TokenBalance;
    communityRewardPool : TokenBalance;
    totalSupply : TokenBalance;
  };

  let legalDisclaimerStore = Map.empty<Principal, LegalDisclaimerStatus>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var dailyRoutineStore = Map.empty<Principal, Map.Map<Nat, DayData>>();
  let tokenStore = Map.empty<Principal, Map.Map<Nat, TokenTransaction>>();
  let utilityFeaturesStore = Map.empty<Principal, Map.Map<Nat, UtilityFeatureInfo>>();
  var tokenBalances = Map.empty<Principal, TokenBalance>();
  let bodyCompositionStore = Map.empty<Principal, Map.Map<Time.Time, BodyCompentry>>();
  let journalStore = Map.empty<Principal, Map.Map<Nat, JournalEntry>>();
  let supplementStore = Map.empty<Principal, Map.Map<Nat, SupplementEntry>>();
  var trainingStore = Map.empty<Principal, [Training]>();

  var nextJournalId : Nat = 0;
  var nextSupplementId : Nat = 0;

  let defaultPrefs : Preferences = {
    language = #de;
  };

  let accessControlState = Auth.initState();

  // LIV Token Supply and Distribution for Ecosystem 3.0
  let TOKEN_SUPPLY_CAP : TokenBalance = 21_000_000;
  var circulatedSupply : TokenBalance = 0;
  var adminTokensAssigned : Bool = false;

  // Ecosystem 3.0 Pools
  let creatorTreasuryId = "CreatorTreasury";
  let communityRewardPoolId = "CommunityRewardPool";

  var poolBalances = Map.empty<Text, TokenBalance>();

  func newUtilityFeature(id : Nat, utilityType : UtilityType) : UtilityFeatureInfo {
    {
      utilityId = id;
      utilityType;
      status = #locked;
      stakeAmount = 0;
    };
  };

  func updateUtilityFeatureStatus(feature : UtilityFeatureInfo, newStatus : UtilityStatus) : UtilityFeatureInfo {
    {
      feature with status = newStatus;
    };
  };

  func updateUtilityFeatureStakeAmount(feature : UtilityFeatureInfo, newAmount : Nat) : UtilityFeatureInfo {
    {
      feature with stakeAmount = newAmount;
    };
  };

  func getJournalDayId(_timestamp : Time.Time) : Nat {
    (Int.abs(Time.now()) / Int.abs(24 * 60 * 60 * 1_000_000_000)).toNat();
  };

  func getUtilityCost(utilityType : UtilityType) : Nat {
    switch (utilityType) {
      case (#advancedAnalytics) { 100 };
      case (#supplementPlans) { 80 };
      case (#longevityCircleMembership) { 500 };
    };
  };

  func getTodayDayId() : Nat {
    let now = Int.abs(Time.now());
    let msInDay : Int = Int.abs(24 * 60 * 60 * 1_000_000_000);
    let dayDifference = Int.abs(now / msInDay);
    dayDifference.toNat();
  };

  func hasCompletedToday(user : Principal) : Bool {
    let today = getTodayDayId();
    switch (dailyRoutineStore.get(user)) {
      case (null) { false };
      case (?userRoutines) { userRoutines.containsKey(today) };
    };
  };

  func tokenAmount(tokenType : TokenType) : Nat {
    switch (tokenType) {
      case (#routine) { 10 };
      case (#goal) { 50 };
      case (#bonus) { 100 };
    };
  };

  func createRewardTransaction(tokenType : TokenType, description : Text) : TokenTransaction {
    {
      amount = tokenAmount(tokenType);
      timestamp = Time.now();
      tokenType;
      description;
    };
  };

  func processTokens(user : Principal, transaction : TokenTransaction) {
    switch (tokenStore.get(user)) {
      case (null) { };
      case (?userTokens) {
        let nextId = userTokens.size();
        userTokens.add(nextId, transaction);
      };
    };
  };

  func validateAndGetUserTransactions(p : Principal) : Map.Map<TokenTransactionId, TokenTransaction> {
    switch (tokenStore.get(p)) {
      case (null) { Runtime.trap("No transaction data found for principal") };
      case (?transactionData) { transactionData };
    };
  };

  func validateAndGetUtilityData(p : Principal, _utilityType : UtilityType) : Map.Map<Nat, UtilityFeatureInfo> {
    switch (utilityFeaturesStore.get(p)) {
      case (null) { Runtime.trap("No utility data found for principal") };
      case (?utilityData) { utilityData };
    };
  };

  func getLegalDisclaimerStatusCaller(p : Principal) : LegalDisclaimerStatus {
    switch (legalDisclaimerStore.get(p)) {
      case (null) { { hasSeenDisclaimer = false; lastSeenTimestamp = null } };
      case (?status) { status };
    };
  };

  func setLegalDisclaimerSeenFor(p : Principal) {
    legalDisclaimerStore.add(p, {
      hasSeenDisclaimer = true;
      lastSeenTimestamp = ?Time.now();
    });
  };

  func resetLegalDisclaimerStatusFor(p : Principal) {
    legalDisclaimerStore.add(p, {
      hasSeenDisclaimer = false;
      lastSeenTimestamp = null;
    });
  };

  // Reward User - With Cap Enforced
  func mintRewardTokensInternal(user : Principal, amount : TokenBalance) {
    if (circulatedSupply + amount > TOKEN_SUPPLY_CAP) {
      Runtime.trap("Cannot mint above total supply cap");
    };

    let currentBalance = switch (tokenBalances.get(user)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    tokenBalances.add(user, currentBalance + amount);
    circulatedSupply += amount;
  };

  func calculateBMI(entry : BodyCompentry, heightCm : Nat) : Float {
    let heightMeters = heightCm.toFloat() / 100.0;
    (entry.weight) / (heightMeters * heightMeters);
  };

  func determineBMICategory(bmi : Float) : BMIIndicatorCategory {
    if (bmi >= 18.5 and bmi <= 24.9) { #optimal } else if (bmi >= 25.0 and bmi <= 29.9) {
      #slightlyHigh;
    } else if (bmi >= 17.0 and bmi < 18.5) {
      #slightlyLow;
    } else if (bmi < 17.0) { #tooLow } else { #tooHigh };
  };

  func getCallerJournalEntries(p : Principal) : Map.Map<Nat, JournalEntry> {
    switch (journalStore.get(p)) {
      case (null) { Map.empty<Nat, JournalEntry>() };
      case (?data) { data };
    };
  };

  func validateAndGetSupplements(p : Principal) : Map.Map<Nat, SupplementEntry> {
    switch (supplementStore.get(p)) {
      case (null) { Runtime.trap("No supplements found for principal") };
      case (?supplements) { supplements };
    };
  };

  func getSupplements(p : Principal) : Map.Map<Nat, SupplementEntry> {
    switch (supplementStore.get(p)) {
      case (null) { Map.empty<Nat, SupplementEntry>() };
      case (?supplements) { supplements };
    };
  };

  // Autophagy Score Calculation
  func getScoreFasting(durationHours : Nat) : Nat {
    if (durationHours < 12) { 0 } else if (durationHours < 14) {
      10;
    } else if (durationHours < 16) {
      25;
    } else if (durationHours < 20) {
      35;
    } else { 40 };
  };

  func getScoreTraining(sessions : [Training]) : Nat {
    var totalScore = 0;
    for (session in sessions.values()) {
      let intensityValue = switch (session.intensity) {
        case (#low) { 1 };
        case (#medium) { 2 };
        case (#high) { 3 };
      };
      let sessionScore = (session.durationMins * intensityValue) / 10;
      totalScore += sessionScore;
    };
    if (totalScore > 30) { 30 } else { totalScore };
  };

  func getScoreSleep(durationHours : Nat, qualityRating : Nat) : Nat {
    let durPoints = if (durationHours < 5) { 0 } else if (durationHours < 7) {
      5;
    } else { 10 };

    let qualityPoints = if (qualityRating <= 5) {
      (qualityRating * 10) / 5;
    } else { 10 };

    let total = durPoints + qualityPoints;
    if (total > 20) { 20 } else { total };
  };

  func getScoreStress(pulse : Nat, bloodPressureSystolic : Nat, bloodPressureDiastolic : Nat) : Nat {
    let rhrPoints = if (pulse < 60) { 5 } else if (pulse < 75) { 3 } else { 0 };

    let bpPoints = if (bloodPressureSystolic < 120 and bloodPressureDiastolic < 80) {
      5;
    } else if (bloodPressureSystolic > 130 or bloodPressureDiastolic > 85) {
      0;
    } else { 3 };

    let total = rhrPoints + bpPoints;
    if (total > 10) { 10 } else { total };
  };

  func calculateAutophagy(routines : DayRoutines) : AutophagyScore {
    let fasting = getScoreFasting(routines.fastingSession.durationHours);
    let training = getScoreTraining(routines.trainingSessions);
    let sleep = getScoreSleep(routines.sleepMetrics.durationHours, routines.sleepMetrics.qualityRating);
    let stress = getScoreStress(
      routines.stressMetrics.pulse,
      routines.stressMetrics.bloodPressureSystolic,
      routines.stressMetrics.bloodPressureDiastolic
    );

    {
      fastingScore = fasting;
      trainingScore = training;
      sleepScore = sleep;
      stressScore = stress;
      totalScore = Nat.min(
        100,
        fasting + training + sleep + stress,
      );
    };
  };

  // Longevity Score Calculation
  func calculateBodyCompositionScore(bodyFat : Float, muscleMass : Float, gender : Gender) : Nat {
    let idealBodyFat = switch (gender) {
      case (#male) { 14.0 };
      case (#female) { 21.5 };
      case (#other) { 17.75 };
    };

    let bodyFatScore = if (bodyFat >= 10.0 and bodyFat <= 25.0) {
      50.0;
    } else {
      let diff = Float.abs(bodyFat - idealBodyFat);
      let score = 50.0 - (diff * 2.0);
      if (score < 0.0) { 0.0 } else { score };
    };

    let muscleMassScore = if (muscleMass >= 10.0 and muscleMass <= 100.0) {
      let normalized = (muscleMass - 10.0) / 90.0;
      50.0 * normalized;
    } else { 0.0 };

    let combinedScore = (bodyFatScore + muscleMassScore) / 2.0;
    combinedScore.toInt().toNat();
  };

  func calculateNutritionScore(proteinIntake : Nat, veggieIntake : Nat, waterIntake : Nat, proteinTarget : Nat) : Nat {
    let proteinScore = if (proteinIntake >= proteinTarget) { 10 } else {
      (proteinIntake * 10) / proteinTarget;
    };

    let veggieScore = if (veggieIntake >= 400) { 10 } else {
      (veggieIntake * 10) / 400;
    };

    let waterScore = if (waterIntake >= 2000) { 10 } else {
      (waterIntake * 10) / 2000;
    };

    let totalScore = proteinScore + veggieScore + waterScore;
    if (totalScore > 30) { 30 } else { totalScore };
  };

  func calculateLongevityScore(
    bodyFat : Float,
    muscleMass : Float,
    gender : Gender,
    proteinIntake : Nat,
    veggieIntake : Nat,
    waterIntake : Nat,
    proteinTarget : Nat,
    autophagyScore : Nat,
  ) : LongevityScore {
    let bodyCompScore = calculateBodyCompositionScore(bodyFat, muscleMass, gender);
    let nutritionScore = calculateNutritionScore(proteinIntake, veggieIntake, waterIntake, proteinTarget);
    let autophagyCouplingScore = (autophagyScore * 20) / 100;

    let totalScore = Nat.min(
      100,
      bodyCompScore + nutritionScore + autophagyCouplingScore,
    );

    {
      bodyCompositionScore = bodyCompScore;
      nutritionScore;
      autophagyCouplingScore;
      totalScore;
    };
  };

  public shared ({ caller }) func resetTokenDistribution() : async TokenDistribution {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can reset token distribution");
    };

    let entries = tokenBalances.toArray();
    for ((p, _) in entries.values()) {
      tokenBalances.add(p, 0);
    };

    circulatedSupply := 0;

    poolBalances.add(creatorTreasuryId, 8_400_000);
    poolBalances.add(communityRewardPoolId, 12_600_000);

    {
      creatorTreasury = 8_400_000;
      communityRewardPool = 12_600_000;
      totalSupply = TOKEN_SUPPLY_CAP;
    };
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    Auth.initialize(accessControlState, caller);

    if (not tokenStore.containsKey(caller)) {
      tokenStore.add(caller, Map.empty<TokenTransactionId, TokenTransaction>());
    };
  };

  public query ({ caller }) func getCallerUserRole() : async Auth.UserRole {
    Auth.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : Auth.UserRole) : async () {
    Auth.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    Auth.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);

    if (not dailyRoutineStore.containsKey(caller)) {
      dailyRoutineStore.add(caller, Map.empty<RoutineDayId, DayData>());
    };
    if (not tokenStore.containsKey(caller)) {
      tokenStore.add(caller, Map.empty<TokenTransactionId, TokenTransaction>());
    };
    if (not utilityFeaturesStore.containsKey(caller)) {
      utilityFeaturesStore.add(caller, Map.empty<Nat, UtilityFeatureInfo>());
    };
    if (not supplementStore.containsKey(caller)) {
      supplementStore.add(caller, Map.empty<Nat, SupplementEntry>());
    };
    if (not trainingStore.containsKey(caller)) {
      trainingStore.add(caller, []);
    };
  };

  public query ({ caller }) func getLegalDisclaimerStatus() : async LegalDisclaimerStatus {
    getLegalDisclaimerStatusCaller(caller);
  };

  public query ({ caller }) func getLegalDisclaimerStatusFor(p : Principal) : async LegalDisclaimerStatus {
    if (not (Auth.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access legal disclaimer for other users");
    };
    getLegalDisclaimerStatusCaller(p);
  };

  public shared ({ caller }) func setLegalDisclaimerSeen() : async () {
    setLegalDisclaimerSeenFor(caller);
  };

  public shared ({ caller }) func resetLegalDisclaimerStatus() : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset legal disclaimer");
    };
    resetLegalDisclaimerStatusFor(caller);
  };

  public shared ({ caller }) func completeRoutines(newRoutines : DayRoutines) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete routines");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please create a profile first") };
      case (?p) { p };
    };

    if (hasCompletedToday(caller)) {
      Runtime.trap("Routine already completed today");
    };

    let today = getTodayDayId();
    let autophagyScore = calculateAutophagy(newRoutines);

    let longevityScore = calculateLongevityScore(
      newRoutines.bodyComposition.bodyFatPercentage,
      newRoutines.bodyComposition.muscleMass,
      profile.gender,
      newRoutines.nutritionMetrics.proteinIntake,
      newRoutines.nutritionMetrics.veggieIntake,
      newRoutines.nutritionMetrics.waterIntake,
      newRoutines.nutritionMetrics.proteinTarget,
      autophagyScore.totalScore,
    );

    let routinesForToday : DayData = {
      routines = newRoutines;
      completionTime = Time.now();
      autophagyScore;
      longevityScore;
    };

    switch (dailyRoutineStore.get(caller)) {
      case (null) { Runtime.trap("User data not initialized") };
      case (?userRoutines) {
        userRoutines.add(today, routinesForToday);
        processTokens(caller, createRewardTransaction(#routine, "Daily Routine"));
        mintRewardTokensInternal(caller, tokenAmount(#routine));
      };
    };

    let bodyCompEntry : BodyCompentry = {
      timestamp = Time.now();
      weight = newRoutines.bodyComposition.weight;
      bodyFatPercentage = newRoutines.bodyComposition.bodyFatPercentage;
      muscleMass = newRoutines.bodyComposition.muscleMass;
    };

    let currentBodyData = switch (bodyCompositionStore.get(caller)) {
      case (null) { Map.empty<Time.Time, BodyCompentry>() };
      case (?data) { data };
    };

    currentBodyData.add(Time.now(), bodyCompEntry);
    bodyCompositionStore.add(caller, currentBodyData);

    if (not supplementStore.containsKey(caller)) {
      supplementStore.add(caller, Map.empty<Nat, SupplementEntry>());
    };
    switch (supplementStore.get(caller)) {
      case (null) { Runtime.trap("Supplement store not initialized") };
      case (?supplements) {
        let updatedSupplements = supplements.map<Nat, SupplementEntry, SupplementEntry>(
          func(_id, s) {
            {
              s with completed = false;
            };
          }
        );
        supplementStore.add(caller, updatedSupplements);
      };
    };
  };

  public query ({ caller }) func getAllDailyRoutines() : async ([(RoutineDayId, DayData)], Int) {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily routines");
    };

    switch (dailyRoutineStore.get(caller)) {
      case (null) { ([], 0) };
      case (?dailyRoutines) {
        let count = Int.abs(dailyRoutines.size());
        let routinesArray = dailyRoutines.toArray();
        (routinesArray, count);
      };
    };
  };

  public query ({ caller }) func getTokenTransactions() : async [QueryTokenTransaction] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access token transactions");
    };

    switch (tokenStore.get(caller)) {
      case (null) { [] };
      case (?tokenMap) {
        tokenMap.values().toArray().map<TokenTransaction, QueryTokenTransaction>(
          func(t) {
            {
              transactionId = t.timestamp.toNat();
              amount = t.amount;
              tokenType = t.tokenType;
              timestamp = t.timestamp;
              description = t.description;
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getTokenBalance() : async Nat {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access token balance");
    };

    switch (tokenBalances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getPreferences() : async Preferences {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access preferences");
    };

    switch (userProfiles.get(caller)) {
      case (null) { defaultPrefs };
      case (?profile) { profile.preferences };
    };
  };

  public shared ({ caller }) func transferTokens(to : Principal, amount : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer tokens");
    };

    // Verify recipient has a valid user profile and is at least a user
    if (not userProfiles.containsKey(to)) {
      Runtime.trap("Unauthorized: Can only transfer tokens to registered users with profiles");
    };

    if (not Auth.hasPermission(accessControlState, to, #user)) {
      Runtime.trap("Unauthorized: Recipient must be a registered user");
    };

    if (caller == to) {
      Runtime.trap("Cannot transfer tokens to yourself");
    };

    let fromBalance = switch (tokenBalances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (fromBalance < amount) {
      Runtime.trap("Insufficient balance");
    };

    let toBalance = switch (tokenBalances.get(to)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    tokenBalances.add(caller, Int.max(fromBalance.toInt() - amount.toInt(), 0).toNat());
    tokenBalances.add(to, toBalance + amount);

    let transaction = {
      amount = amount;
      timestamp = Time.now();
      tokenType = #routine;
      description = "Tokens transferred to " # to.toText();
    };
    let transactions = validateAndGetUserTransactions(caller);
    transactions.add(transactions.size(), transaction);
    tokenStore.add(caller, transactions);
  };

  public query ({ caller }) func getBalance(p : Principal) : async TokenBalance {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query balances");
    };

    // Verify the queried principal has a profile (is a registered user)
    if (not userProfiles.containsKey(p)) {
      Runtime.trap("Unauthorized: Can only query balances of registered users");
    };

    if (caller != p and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only query your own balance unless you are an admin");
    };

    switch (tokenBalances.get(p)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func mintRewardTokens(user : Principal, amount : TokenBalance) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mint reward tokens");
    };

    // Verify the target user has a profile (is a registered user)
    if (not userProfiles.containsKey(user)) {
      Runtime.trap("Unauthorized: Can only mint tokens for registered users with profiles");
    };

    mintRewardTokensInternal(user, amount);
  };

  public query ({ caller }) func getTokenSupplyInfo() : async TokenSupply {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access token supply information");
    };

    {
      totalSupply = circulatedSupply;
      circulatingSupply = circulatedSupply;
      remainingSupply = TOKEN_SUPPLY_CAP - circulatedSupply;
      supplyCap = TOKEN_SUPPLY_CAP;
    };
  };

  public shared ({ caller }) func unlockUtility(utilityType : UtilityType) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock utilities");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please create a profile first") };
      case (?_) {};
    };

    let cost = getUtilityCost(utilityType);
    let currentBalance = switch (tokenBalances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };

    if (currentBalance < cost) {
      Runtime.trap("Insufficient token balance to unlock this utility");
    };

    let utilityFeatures = validateAndGetUtilityData(caller, utilityType);
    let utilityId = utilityFeatures.size();
    if (utilityFeatures.containsKey(utilityId)) {
      Runtime.trap("Utility feature already exists");
    };

    tokenBalances.add(caller, Int.max(currentBalance.toInt() - cost.toInt(), 0).toNat());

    let transaction = {
      amount = cost;
      timestamp = Time.now();
      tokenType = #routine;
      description = "Tokens spent on utility feature";
    };
    let transactions = validateAndGetUserTransactions(caller);
    transactions.add(transactions.size(), transaction);

    let utilityFeature = newUtilityFeature(utilityId, utilityType);
    let updatedFeature = updateUtilityFeatureStatus(utilityFeature, #unlocked);
    utilityFeatures.add(utilityId, updatedFeature);

    tokenStore.add(caller, transactions);
    utilityFeaturesStore.add(caller, utilityFeatures);
  };

  public query ({ caller }) func getDailyRoutineStats() : async Nat {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access routine stats");
    };

    switch (dailyRoutineStore.get(caller)) {
      case (null) { 0 };
      case (?dailyRoutines) { dailyRoutines.size() };
    };
  };

  public shared ({ caller }) func saveBodyComposition(weight : Float, bodyFatPercentage : Float, muscleMass : Float) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save body composition data");
    };

    let bodyCompEntry : BodyCompentry = {
      timestamp = Time.now();
      weight;
      bodyFatPercentage;
      muscleMass;
    };

    let currentData = switch (bodyCompositionStore.get(caller)) {
      case (null) { Map.empty<Time.Time, BodyCompentry>() };
      case (?data) { data };
    };

    currentData.add(Time.now(), bodyCompEntry);
    bodyCompositionStore.add(caller, currentData);
  };

  public query ({ caller }) func getBodyComposition() : async ?BodyComposition {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get body composition data");
    };

    switch (bodyCompositionStore.get(caller), userProfiles.get(caller)) {
      case (null, _) { null };
      case (_, null) { null };
      case (?bodyMap, ?profile) {
        let now = Time.now();
        let isRecent = switch (bodyMap.size()) {
          case (0) { false };
          case (1) { true };
          case (_) { false };
        };
        let recentEntry = switch (isRecent, profile.bodyHeightCm) {
          case (false, _) {
            ?{
              timestamp = now;
              weight = 0.0;
              bodyFatPercentage = 0.0;
              muscleMass = 0.0;
            };
          };
          case (true, _) {
            let valueIter = bodyMap.values();
            switch (valueIter.next()) {
              case (null) { null };
              case (?entry) { ?entry };
            };
          };
        };

        switch (recentEntry) {
          case (null) { null };
          case (?entry) {
            let bmi = calculateBMI(entry, profile.bodyHeightCm);
            let bmiCategory = determineBMICategory(bmi);

            let history = bodyMap.toArray().map<(?Time.Time, BodyCompentry), BodyCompentry>(
              func((_, v)) { v }
            );

            ?{
              currentWeight = entry.weight;
              currentBodyFatPercentage = entry.bodyFatPercentage;
              currentMuscleMass = entry.muscleMass;
              bmi;
              bmiCategory;
              history;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func createJournalEntry(content : Text) : async JournalEntry {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };

    let newEntry : JournalEntry = {
      id = nextJournalId;
      content;
      timestamp = Time.now();
    };

    nextJournalId += 1;

    let currentData = getCallerJournalEntries(caller);
    currentData.add(newEntry.id, newEntry);
    journalStore.add(caller, currentData);

    newEntry;
  };

  public query ({ caller }) func getJournalEntries() : async [JournalEntry] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access journal entries");
    };

    getCallerJournalEntries(caller).values().toArray();
  };

  public shared ({ caller }) func updateJournalEntry(entryId : Nat, newContent : Text) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update journal entries");
    };

    let currentData = getCallerJournalEntries(caller);

    switch (currentData.get(entryId)) {
      case (null) { Runtime.trap("Journal entry not found") };
      case (?existingEntry) {
        let updatedEntry : JournalEntry = {
          id = existingEntry.id;
          content = newContent;
          timestamp = existingEntry.timestamp;
        };
        currentData.add(entryId, updatedEntry);
        journalStore.add(caller, currentData);
      };
    };
  };

  public shared ({ caller }) func deleteJournalEntry(entryId : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete journal entries");
    };

    let currentData = getCallerJournalEntries(caller);

    if (not currentData.containsKey(entryId)) {
      Runtime.trap("Journal entry not found");
    };

    currentData.remove(entryId);
    journalStore.add(caller, currentData);
  };

  public shared ({ caller }) func addSupplement(name : Text, dosage : Text, time : Text, note : ?Text, completed : Bool) : async SupplementResponse {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add supplements");
    };

    let newSupplement : SupplementEntry = {
      id = nextSupplementId;
      name;
      dosage;
      time;
      note;
      completed;
    };

    nextSupplementId += 1;

    let currentData = getSupplements(caller);
    currentData.add(newSupplement.id, newSupplement);
    supplementStore.add(caller, currentData);

    {
      message = "Supplement added successfully";
      supplements = currentData.values().toArray();
    };
  };

  public shared ({ caller }) func updateSupplement(supplementId : Nat, name : Text, dosage : Text, time : Text, note : ?Text) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update supplements");
    };

    let currentData = getSupplements(caller);

    switch (currentData.get(supplementId)) {
      case (null) { Runtime.trap("Supplement not found") };
      case (?existingSupplement) {
        let updatedSupplement : SupplementEntry = {
          id = existingSupplement.id;
          name;
          dosage;
          time;
          note;
          completed = existingSupplement.completed;
        };
        currentData.add(supplementId, updatedSupplement);
        supplementStore.add(caller, currentData);
      };
    };
  };

  public shared ({ caller }) func toggleSupplement(supplementId : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle supplements");
    };

    let currentData = getSupplements(caller);

    switch (currentData.get(supplementId)) {
      case (null) { Runtime.trap("Supplement not found") };
      case (?existingSupplement) {
        let updatedSupplement : SupplementEntry = {
          existingSupplement with completed = not existingSupplement.completed;
        };
        currentData.add(supplementId, updatedSupplement);
        supplementStore.add(caller, currentData);
      };
    };
  };

  public shared ({ caller }) func deleteSupplement(supplementId : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete supplements");
    };

    let currentData = getSupplements(caller);

    if (not currentData.containsKey(supplementId)) {
      Runtime.trap("Supplement not found");
    };

    currentData.remove(supplementId);
    supplementStore.add(caller, currentData);
  };

  public query ({ caller }) func getAllSupplements() : async [SupplementEntry] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access supplements");
    };
    getSupplements(caller).values().toArray();
  };

  public shared ({ caller }) func resetAllSupplements() : async ResetResponse {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset supplements");
    };

    let currentData = getSupplements(caller);
    let updatedData = currentData.map<Nat, SupplementEntry, SupplementEntry>(
      func(_id, s) {
        { s with completed = false };
      }
    );
    supplementStore.add(caller, updatedData);
    {
      message = "All supplements have been reset";
      supplements = updatedData.values().toArray();
    };
  };

  // Helper function to convert time string "HH:MM" to Nat
  func timeStringToNat(time : Text) : Nat {
    let parts = time.split(#char ':').toArray();
    if (parts.size() == 2) {
      let hoursText = parts[0];
      let minutesText = parts[1];
      let hours = hoursText.toNat();
      let minutes = minutesText.toNat();
      switch (hours, minutes) {
        case (?h, ?m) { h * 100 + m };
        case (_, _) { 0 };
      };
    } else { 0 };
  };

  public shared ({ caller }) func sortSupplementsByTime() : async SortResponse {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can sort supplements");
    };

    let supplements = getSupplements(caller).values().toArray();

    let sortedSupplements = supplements.sort(
      func(a, b) {
        let aTime = timeStringToNat(a.time);
        let bTime = timeStringToNat(b.time);
        Nat.compare(aTime, bTime);
      }
    );

    {
      message = "Supplements have been sorted";
      supplements = sortedSupplements;
    };
  };

  public query ({ caller }) func getSupplementStoreSize() : async Nat {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access supplement store size");
    };
    supplementStore.size();
  };

  public query ({ caller }) func getAutophagyScore(dayId : Nat) : async ?AutophagyScore {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get autophagy score");
    };
    switch (dailyRoutineStore.get(caller)) {
      case (null) { null };
      case (?userRoutines) {
        switch (userRoutines.get(dayId)) {
          case (null) { null };
          case (?dayData) { ?dayData.autophagyScore };
        };
      };
    };
  };

  public query ({ caller }) func getLongevityScore(dayId : Nat) : async ?LongevityScore {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get longevity score");
    };
    switch (dailyRoutineStore.get(caller)) {
      case (null) { null };
      case (?userRoutines) {
        switch (userRoutines.get(dayId)) {
          case (null) { null };
          case (?dayData) { ?dayData.longevityScore };
        };
      };
    };
  };

  public shared ({ caller }) func resetAnalyses() : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset analyses");
    };

    dailyRoutineStore.add(caller, Map.empty<Nat, DayData>());
    bodyCompositionStore.add(caller, Map.empty<Time.Time, BodyCompentry>());
  };

  public shared ({ caller }) func cleanupInactiveAccounts() : async () {
    if (not (Auth.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can perform housekeeping");
    };

    var cleanedCount = 0;
    let entries = tokenBalances.toArray();
    for ((p, _) in entries.values()) {
      switch (userProfiles.get(p)) {
        case (null) {
          tokenBalances.remove(p);
          cleanedCount += 1;
        };
        case (?profile) {
          ignore profile;
        };
      };
    };

    ();
  };

  var configuration : ?Stripe.StripeConfiguration = null;

  public query ({ caller }) func isStripeConfigured() : async Bool {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe configuration");
    };
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getPoolBalances() : async TokenDistribution {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pool balances");
    };

    {
      creatorTreasury = switch (poolBalances.get(creatorTreasuryId)) {
        case (null) { 0 };
        case (?balance) { balance };
      };
      communityRewardPool = switch (poolBalances.get(communityRewardPoolId)) {
        case (null) { 0 };
        case (?balance) { balance };
      };
      totalSupply = TOKEN_SUPPLY_CAP;
    };
  };

  // Training persistence functions
  public shared ({ caller }) func saveTraining(training : Training) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save training sessions");
    };

    // Fetch current trainings, defaulting to empty array if not found
    let currentTraining = switch (trainingStore.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    // Add new training to the beginning and update the store
    let updatedTraining = [training].concat(currentTraining);
    trainingStore.add(caller, updatedTraining);
  };

  public query ({ caller }) func getTrainings() : async [Training] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get training sessions");
    };

    // If not found, return empty array
    switch (trainingStore.get(caller)) {
      case (null) { [] };
      case (?trainingList) { trainingList };
    };
  };

  public shared ({ caller }) func clearTrainings() : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear training sessions");
    };

    trainingStore.remove(caller);
  };
};

