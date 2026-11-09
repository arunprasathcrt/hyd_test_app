import type {LeadTimeConfig, ShipTiming} from '../types/new-draft-order';

export interface LeadTimePhase {
	key: string;
	label?: string;
	days: number;
	start: string;
	end: string;
}

export interface LeadTimeCalculationInput {
	today: string;
	targetDate?: string;
	timing: ShipTiming;
	leadTime: LeadTimeConfig;
	selectedMethods: string[];
	selectedFlags: string[];
	orderType: string;
}

const DAY_MS = 86_400_000;

export function addIsoDays(day: string, days: number): string {
	const date = new Date(`${day}T00:00:00Z`);
	return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetweenIsoDays(from: string, to: string): number {
	const fromTime = new Date(`${from}T00:00:00Z`).getTime();
	const toTime = new Date(`${to}T00:00:00Z`).getTime();
	return Math.round((toTime - fromTime) / DAY_MS);
}

export function reconcileInHandsDate(
	currentDate: string,
	manual: boolean,
	minimumDate: string,
): {date: string; adjusted: boolean} {
	// Automatic dates follow live minimums; manual dates persist unless infeasible.
	if (!manual) return {date: minimumDate, adjusted: currentDate !== minimumDate};
	if (currentDate < minimumDate) return {date: minimumDate, adjusted: true};
	return {date: currentDate, adjusted: false};
}

export function calculateLeadTime(input: LeadTimeCalculationInput) {
	const {today, timing, leadTime, selectedMethods, selectedFlags, orderType} = input;
	const methods = [...new Set(selectedMethods.filter(Boolean))];
	const flags = new Set(selectedFlags);
	// Selected methods run in parallel, so production uses the longest live duration.
	const methodDays = methods
		.map((code) => leadTime.methods.find((method) => method.code === code)?.days)
		.filter((days): days is number => days !== undefined);
	// A method's days (e.g. "Screen Print 14d") already include shipping and
	// receiving, as in the prototype chip (production + 5d ship + 3d receive).
	// Strip them here so they are not counted twice by the phases below.
	const transitDays = timing.shippingDays + timing.receivingDays;
	const productionDays = methodDays.length
		? Math.max(0, Math.max(...methodDays) - transitDays)
		: leadTime.defaultDays || timing.productionDays;
	const hasMethod = methodDays.length > 0;
	const blankOnly = methods.length === 1 && methods[0] === 'blank';
	const isNewOrder = orderType === 'new';
	// Modifier days come only from live metaobjects; a missing entry contributes zero.
	const flagDays = (code: string) =>
		leadTime.flags.find((flag) => flag.code === code)?.days ?? 0;
	const modifierPhases: Array<{key: string; label?: string; days: number}> = [];

	if (isNewOrder && hasMethod && !blankOnly) {
		if (flags.has('new_art')) {
			modifierPhases.push({key: 'artProduction', days: flagDays('new_art')});
		}
		if (flags.has('licensed_art')) {
			const licensedCode = flags.has('pro_sports_license')
				? 'pro_sports_license'
				: 'licensed_art';
			const licensedFlag = leadTime.flags.find((flag) => flag.code === licensedCode);
			modifierPhases.push({
				key: 'licensing',
				label: licensedFlag?.label,
				days: flagDays(licensedCode),
			});
		}
		if (flags.has('new_account')) {
			modifierPhases.push({key: 'accountSetup', days: flagDays('new_account')});
		}
	}

	// With no decoration method, a new order uses the ~6-week default as a ceiling:
	// no Art and Account chip adds days until a method is picked (prototype qbLeadStages).
	const usesDefaultOnly = !hasMethod && orderType !== 'reorder';

	if (flags.has('needs_po') && !usesDefaultOnly) {
		const procurementFlag = leadTime.flags.find((flag) => flag.code === 'needs_po');
		modifierPhases.push({
			key: 'procurement',
			label: procurementFlag?.label,
			days: flagDays('needs_po'),
		});
	}

	const phases: Array<{key: string; label?: string; days: number}> = [
		...modifierPhases,
		{key: 'production', days: productionDays},
		{key: 'shipping', days: timing.shippingDays},
		{key: 'receiving', days: timing.receivingDays},
	];
	const totalDays = phases.reduce((total, phase) => total + phase.days, 0);
	const minimumInHands = addIsoDays(today, totalDays);
	// Shipping and receiving are included in the in-hands total, not first-ship date.
	const firstAvailableShip = addIsoDays(
		today,
		totalDays - timing.shippingDays - timing.receivingDays,
	);
	const targetDate = input.targetDate || minimumInHands;

	// Back-schedule from the target without stretching any phase to fill extra time.
	let cursor = targetDate;
	const scheduledPhases = phases.slice().reverse().map((phase) => {
		const end = cursor;
		const start = addIsoDays(end, -phase.days);
		cursor = start;
		return {...phase, start, end};
	}).reverse();
	const productionPhase = scheduledPhases.find((phase) => phase.key === 'production');
	const shippingPhase = scheduledPhases.find((phase) => phase.key === 'shipping');
	const daysToSpare = daysBetweenIsoDays(minimumInHands, targetDate);

	return {
		productionDays,
		totalDays,
		minimumInHands,
		firstAvailableShip,
		daysToSpare,
		late: daysToSpare < 0,
		atRisk: daysToSpare >= 0 && daysToSpare < 7,
		phases: scheduledPhases,
		productionStart: productionPhase?.start ?? targetDate,
		leavesPlant: shippingPhase?.start ?? targetDate,
		arrives: shippingPhase?.end ?? targetDate,
		daysOut: daysBetweenIsoDays(today, targetDate),
		shipOutIn: daysBetweenIsoDays(today, firstAvailableShip),
	};
}
