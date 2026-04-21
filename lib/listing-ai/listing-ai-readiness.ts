type ReadinessInput = {
  description?: string | null;
  conditionSummary?: string | null;
  highlights?: string | null;
  mileage?: number | null;
  conditionGrade?: string | null;
  ownershipDuration?: string | null;
  serviceHistoryConfidence?: string | null;
  modifications?: string | null;
  originality?: string | null;
  documentationAvailable?: string | null;
  sellingReason?: string | null;
  audiencePreset?: string | null;
};

export type ListingReadinessSnapshot = {
  missingInfo: string[];
  riskFlags: string[];
  readinessScore: number;
  readinessReasons: string[];
};

function hasText(v: string | null | undefined) {
  return Boolean(v && v.trim());
}

export function deriveListingReadinessSnapshot(
  input: ReadinessInput
): ListingReadinessSnapshot {
  const missingInfo: string[] = [];
  const riskFlags: string[] = [];
  const readinessReasons: string[] = [];
  let score = 35;

  if (hasText(input.description)) {
    score += 15;
    readinessReasons.push("A base listing description is already present.");
  } else {
    missingInfo.push("A fuller listing description would improve buyer context.");
  }

  if (hasText(input.conditionSummary) || input.conditionGrade) {
    score += 12;
    readinessReasons.push("Condition framing is at least partially established.");
  } else {
    missingInfo.push("Condition summary or grade is still missing.");
  }

  if (hasText(input.highlights)) {
    score += 10;
    readinessReasons.push("Seller highlights give the draft stronger factual anchors.");
  } else {
    missingInfo.push("Seller highlights or standout details are still thin.");
  }

  if (input.mileage != null) {
    score += 6;
    readinessReasons.push("Mileage is available for buyer framing.");
  } else {
    missingInfo.push("Mileage is missing.");
  }

  if (hasText(input.ownershipDuration)) {
    score += 5;
  } else {
    missingInfo.push("Ownership duration is unclear.");
  }

  if (hasText(input.documentationAvailable)) {
    score += 5;
    readinessReasons.push("Documentation availability can be referenced clearly.");
  } else {
    missingInfo.push("Documentation availability is not clearly described.");
  }

  if (hasText(input.sellingReason)) {
    score += 4;
  } else {
    missingInfo.push("Seller motivation is not yet described.");
  }

  if (hasText(input.modifications) || hasText(input.originality)) {
    score += 4;
  } else {
    missingInfo.push("Originality or modifications context is still thin.");
  }

  if (hasText(input.audiencePreset)) {
    score += 2;
  }

  const historyConfidence = (input.serviceHistoryConfidence ?? "").trim().toLowerCase();
  if (historyConfidence === "documented") {
    score += 8;
    readinessReasons.push("Service history confidence is documented.");
  } else if (historyConfidence === "partial") {
    score += 4;
    readinessReasons.push("Service history has some support but may need clearer boundaries.");
    riskFlags.push("Service history is only partially supported and should be described carefully.");
  } else {
    missingInfo.push("Service history confidence is not clear.");
    riskFlags.push("Avoid sounding certain about maintenance history unless it is documented.");
  }

  if (!hasText(input.documentationAvailable)) {
    riskFlags.push("Documentation gaps should stay explicit rather than implied.");
  }

  if (!hasText(input.conditionSummary) && !input.conditionGrade) {
    riskFlags.push("Condition language may overreach if the listing does not clearly describe flaws and wear.");
  }

  const readinessScore = Math.max(20, Math.min(98, score));

  if (readinessScore >= 80) {
    readinessReasons.push("The current intake is strong enough for a more confident first draft.");
  } else if (readinessScore >= 60) {
    readinessReasons.push("The draft can be useful now, but some missing details should stay explicit.");
  } else {
    readinessReasons.push("The AI should treat this as an early draft and surface gaps rather than fill them with confidence.");
  }

  return {
    missingInfo: Array.from(new Set(missingInfo)).slice(0, 8),
    riskFlags: Array.from(new Set(riskFlags)).slice(0, 6),
    readinessScore,
    readinessReasons: Array.from(new Set(readinessReasons)).slice(0, 6),
  };
}
