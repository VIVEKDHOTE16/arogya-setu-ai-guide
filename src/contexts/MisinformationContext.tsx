import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface MisinformationPin {
	id: string;
	query: string;
	correction: string;
	type: string;
	timestamp: Date;
	location?: string;
	region?: string;
	coordinates?: { latitude: number; longitude: number };
	severity?: 'low' | 'medium' | 'high';
}

export interface RegionalStat {
	region: string;
	count: number;
	lastReported: Date;
	topics: string[];
	severity: 'low' | 'medium' | 'high';
}

interface Ctx {
	pins: MisinformationPin[];
	addPin: (pin: Omit<MisinformationPin, 'id' | 'timestamp'> & { id?: string; timestamp?: Date }) => void;
	clearPins: () => void;
	regional: RegionalStat[];
	selectedRegion: string | null;
	setSelectedRegion: (r: string | null, opts?: { source?: 'map' | 'analytics'; focus?: boolean }) => void;
	mapCenter: [number, number];
	setMapCenter: (c: [number, number]) => void;
	mapZoom: number; setMapZoom: (z: number) => void;
	timeRange: 'today' | 'week' | 'month' | 'all';
	setTimeRange: (t: 'today' | 'week' | 'month' | 'all') => void;
	syncVersion: number; // increments when region focus changes
}

const MisinformationContext = createContext<Ctx | null>(null);

export const MisinformationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [pins, setPins] = useState<MisinformationPin[]>([]);
	const [regional, setRegional] = useState<RegionalStat[]>([]);
	const [selectedRegion, _setSelectedRegion] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
	const [mapZoom, setMapZoom] = useState(5);
	const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
	const [syncVersion, setSyncVersion] = useState(0);

	const recalcRegional = useCallback((allPins: MisinformationPin[]) => {
		const byRegion: Record<string, RegionalStat> = {};
		allPins.forEach(p => {
			const region = p.region || p.location || 'Unknown';
			if (!byRegion[region]) {
				byRegion[region] = {
					region,
						count: 0,
						lastReported: p.timestamp,
						topics: [],
						severity: 'medium'
				};
			}
			const rs = byRegion[region];
			rs.count += 1;
			if (p.timestamp > rs.lastReported) rs.lastReported = p.timestamp;
			if (p.type && !rs.topics.includes(p.type)) rs.topics.push(p.type);
			// simple severity heuristic
			rs.severity = rs.count > 20 ? 'high' : rs.count > 10 ? 'medium' : 'low';
		});
		setRegional(Object.values(byRegion).sort((a,b)=>b.count-a.count));
	}, []);

	const addPin: Ctx['addPin'] = useCallback(pin => {
		const full: MisinformationPin = {
			id: pin.id || `pin_${Date.now()}_${Math.random().toString(36).slice(2)}`,
			timestamp: pin.timestamp || new Date(),
			...pin
		};
		setPins(prev => {
			const next = [...prev, full];
			recalcRegional(next);
			return next;
		});
	}, [recalcRegional]);

	const clearPins = useCallback(() => {
		setPins([]);
		setRegional([]);
	}, []);

	const setSelectedRegion: Ctx['setSelectedRegion'] = useCallback((r, opts) => {
		_setSelectedRegion(r);
		setSyncVersion(v => v + 1);
		if (r && opts?.focus) {
			// find related pin to center
			const candidate = pins.find(p => (p.region || p.location) === r && p.coordinates);
			if (candidate?.coordinates) {
				setMapCenter([candidate.coordinates.latitude, candidate.coordinates.longitude]);
				setMapZoom(10);
			}
		}
	}, [pins]);

	// Filter pins by time range for consumers
	const filteredPins = useMemo(() => {
		const now = Date.now();
		return pins.filter(p => {
			const t = p.timestamp.getTime();
			switch (timeRange) {
				case 'today': return now - t <= 24*60*60*1000;
				case 'week': return now - t <= 7*24*60*60*1000;
				case 'month': return now - t <= 30*24*60*60*1000;
				default: return true;
			}
		});
	}, [pins, timeRange]);

	const value: Ctx = {
		pins: filteredPins,
		addPin,
		clearPins,
		regional,
		selectedRegion,
		setSelectedRegion,
		mapCenter,
		setMapCenter,
		mapZoom,
		setMapZoom,
		timeRange,
		setTimeRange,
		syncVersion
	};

	return <MisinformationContext.Provider value={value}>{children}</MisinformationContext.Provider>;
};

export const useMisinformation = () => {
	const ctx = useContext(MisinformationContext);
	if (!ctx) throw new Error('useMisinformation must be used within MisinformationProvider');
	return ctx;
};

