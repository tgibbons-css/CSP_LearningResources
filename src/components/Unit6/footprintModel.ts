export type Cooling = 'evaporative' | 'evaporativePeak' | 'air';
/** Requested classroom scenarios, not ISO-prescribed coefficients or measured site performance. */
export const coolingModels: Record<Cooling, {label: string; pue: number; litersPerItKwh: number}> = {
  evaporative: {label: 'Evaporative Water Cooling (Standard Climate / Cool Northern Average)', pue: 1.12, litersPerItKwh: 0.85},
  evaporativePeak: {label: 'Evaporative Water Cooling (Peak Hot Day / National Comparison)', pue: 1.15, litersPerItKwh: 1.8},
  air: {label: 'Closed-Loop / Advanced Air Cooling (Hermantown Proposal)', pue: 1.25, litersPerItKwh: 0},
};
export function estimateFootprint(computeLoadMW: number, cooling: Cooling) {
  if (!Number.isFinite(computeLoadMW) || computeLoadMW < 50 || computeLoadMW > 700) throw new RangeError('Compute load must be 50-700 MW.');
  const {pue, litersPerItKwh} = coolingModels[cooling];
  const dailyITEnergyKWh = computeLoadMW * 1000 * 24;
  const totalFacilityMW = computeLoadMW * pue;
  const coolingPowerOverheadMW = totalFacilityMW - computeLoadMW;
  const equivalentHomes = Math.round((totalFacilityMW * 1000) / 1.2);
  const dailyWaterGallons = cooling === 'air'
    ? Math.round(8000 + (computeLoadMW * 25))
    : Math.round((dailyITEnergyKWh * litersPerItKwh) / 3.78541);
  const dailyFacilityEnergyKWh = totalFacilityMW * 1000 * 24;
  return {dailyITEnergyKWh, totalFacilityMW, coolingPowerOverheadMW, equivalentHomes,
    dailyWaterGallons, dailyFacilityEnergyKWh};
}
