import { z } from "zod";
import { RewardReasonCode, RedemptionType } from "@prisma/client";

export const rewardReasonCodeSchema = z.nativeEnum(RewardReasonCode);
export const redemptionTypeSchema = z.nativeEnum(RedemptionType);

