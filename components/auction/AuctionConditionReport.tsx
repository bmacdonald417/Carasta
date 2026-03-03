import { MotionSection } from "@/components/ui/motion-section";
import { ConditionBadge } from "./ConditionBadge";
import { ImperfectionsList } from "./ImperfectionsList";
import { DamageImageGallery } from "./DamageImageGallery";

type ConditionGrade =
  | "CONCOURS"
  | "EXCELLENT"
  | "VERY_GOOD"
  | "GOOD"
  | "FAIR";

type DamageImage = { id: string; label: string; imageUrl: string };

type AuctionConditionReportProps = {
  conditionGrade: ConditionGrade | null;
  conditionSummary: string | null;
  imperfections: unknown;
  damageImages: DamageImage[];
};

function hasConditionData(props: AuctionConditionReportProps): boolean {
  return !!(
    props.conditionGrade ||
    props.conditionSummary ||
    (Array.isArray(props.imperfections) && props.imperfections.length > 0) ||
    props.damageImages.length > 0
  );
}

export function AuctionConditionReport(props: AuctionConditionReportProps) {
  if (!hasConditionData(props)) return null;

  return (
    <MotionSection className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_20px_rgba(255,59,92,0.06)] backdrop-blur-xl">
      <h3 className="font-display text-lg font-semibold text-neutral-100">
        Condition report
      </h3>

      {props.conditionGrade && (
        <div className="mt-4">
          <ConditionBadge grade={props.conditionGrade} />
        </div>
      )}

      {props.conditionSummary && (
        <p className="mt-4 text-sm leading-relaxed text-neutral-400 whitespace-pre-wrap">
          {props.conditionSummary}
        </p>
      )}

      <ImperfectionsList imperfections={props.imperfections} />

      <DamageImageGallery images={props.damageImages} />
    </MotionSection>
  );
}
