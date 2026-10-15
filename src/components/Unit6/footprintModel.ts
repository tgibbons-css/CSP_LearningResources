export type Cooling = 'evaporative' | 'air';
/** Explicitly invented scenario coefficients for comparing trade-offs, NOT site measurements. */
export const coolingModels: Record<Cooling, {label: string; pue: number; litersPerItKwh: number}> = {
  evaporative: {label: 'Traditional Evaporative Water Cooling', pue: 1.2, litersPerItKwh: 1.8},
  air: {label: 'Closed-Loop / Advanced Air Cooling', pue: 1.35, litersPerItKwh: 0.05},
};
export const annualHomeKwh = 10791; // EIA: 2022 US average residential customer purchases.
export function estimateFootprint(computeMw: number, cooling: Cooling) {
  if (!Number.isFinite(computeMw) || computeMw < 50 || computeMw > 700) throw new RangeError('Compute load must be 50–700 MW.');
  const assumptions = coolingModels[cooling];
  const facilityMw = computeMw * assumptions.pue;
  const dailyMwh = facilityMw * 24;
  const waterLiters = computeMw * 1000 * 24 * assumptions.litersPerItKwh;
  return {facilityMw, overheadMw: facilityMw - computeMw, dailyMwh, waterLiters,
    waterGallons: waterLiters / 3.785411784, homes: facilityMw * 1000 * 8760 / annualHomeKwh};
}
