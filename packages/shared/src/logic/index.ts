export {
  CRITICAL_HIT_RATE,
  CRITICAL_MULTIPLIER,
  calculateBaseDamage,
  calculateDamage,
  type DamageParams,
  type DamageResult,
  getStabBonus,
  isCriticalHit,
  MIN_DAMAGE,
  STAB_MULTIPLIER,
} from "./damage";
export {
  attemptEscape,
  BASE_ESCAPE_RATE,
  calculateEscapeRate,
  ESCAPE_ATTEMPT_BONUS,
  type EscapeResult,
  MAX_ESCAPE_RATE,
  MIN_ESCAPE_RATE,
} from "./escape";
export {
  determineTurnOrder,
  goesFirst,
  type TurnOrderResult,
} from "./turnOrder";
export {
  type EffectivenessMultiplier,
  getEffectivenessMessage,
  getTypeEffectiveness,
  getTypeNameJa,
  TYPE_CHART,
} from "./typeEffectiveness";
