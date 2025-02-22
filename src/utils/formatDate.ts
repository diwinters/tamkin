import { NC_SITE_SETTINGS } from '@/contains/site-settings'

type DateFormatter = (d: Date) => string | number

interface DateFormatters {
	[key: string]: DateFormatter
}

export default function ncFormatDate(date_string: string): string {
	if (!date_string || typeof date_string !== 'string') return ''
	const date = new Date(date_string)
	let dateFormat = NC_SITE_SETTINGS?.general_settings?.dateFormat || 'j F Y' // Default format for Arabic/Morocco
	if (typeof dateFormat !== 'string') {
		dateFormat = 'j F Y'
	}

	// Check if date is invalid
	if (isNaN(date.getTime())) return ''

	const formatters: DateFormatters = {
		d: (d: Date) => d.getDate().toString().padStart(2, '0'),
		D: (d: Date) =>
			['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()], // Arabic short day names
		j: (d: Date) => d.getDate(),
		l: (d: Date) =>
			[
				'الأحد',
				'الإثنين',
				'الثلاثاء',
				'الأربعاء',
				'الخميس',
				'الجمعة',
				'السبت',
			][d.getDay()], // Arabic full day names
		N: (d: Date) => (d.getDay() === 0 ? 7 : d.getDay()),
		S: (d: Date) => '', // Remove ordinal suffixes (not used in Arabic)
		w: (d: Date) => d.getDay(),
		z: (d: Date) =>
			Math.floor(
				(d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000,
			),
		W: (d: Date) => {
			const target = new Date(d.valueOf())
			const dayNr = (d.getDay() + 6) % 7
			target.setDate(target.getDate() - dayNr + 3)
			const firstThursday = target.valueOf()
			target.setMonth(0, 1)
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
			}
			return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000)
		},
		F: (d: Date) =>
			[
				'يناير',
				'فبراير',
				'مارس',
				'أبريل',
				'ماي',
				'يونيو',
				'يوليوز',
				'غشت',
				'شتنبر',
				'أكتوبر',
				'نونبر',
				'دجنبر',
			][d.getMonth()], // Arabic month names
		m: (d: Date) => (d.getMonth() + 1).toString().padStart(2, '0'),
		M: (d: Date) =>
			[
				'يناير',
				'فبراير',
				'مارس',
				'أبريل',
				'ماي',
				'يونيو',
				'يوليوز',
				'غشت',
				'شتنبر',
				'أكتوبر',
				'نونبر',
				'دجنبر',
			][d.getMonth()], // Arabic short month names
		n: (d: Date) => d.getMonth() + 1,
		t: (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
		L: (d: Date) => (new Date(d.getFullYear(), 1, 29).getMonth() === 1 ? 1 : 0),
		o: (d: Date) => {
			const date = new Date(d.valueOf())
			date.setDate(date.getDate() - ((d.getDay() + 6) % 7) + 3)
			return date.getFullYear()
		},
		Y: (d: Date) => d.getFullYear(),
		y: (d: Date) => d.getFullYear().toString().slice(-2),
		a: (d: Date) => '', // Remove AM/PM (not used in Arabic)
		A: (d: Date) => '', // Remove AM/PM (not used in Arabic)
		g: (d: Date) => d.getHours() % 12 || 12,
		G: (d: Date) => d.getHours(),
		h: (d: Date) => (d.getHours() % 12 || 12).toString().padStart(2, '0'),
		H: (d: Date) => d.getHours().toString().padStart(2, '0'),
		i: (d: Date) => d.getMinutes().toString().padStart(2, '0'),
		s: (d: Date) => d.getSeconds().toString().padStart(2, '0'),
		u: (d: Date) => d.getMilliseconds() * 1000,
		v: (d: Date) => d.getMilliseconds().toString().padStart(3, '0'),
		e: (d: Date) => d.toTimeString().split(' ')[1],
		I: (d: Date) => {
			const jan = new Date(d.getFullYear(), 0, 1)
			const jul = new Date(d.getFullYear(), 6, 1)
			return Number(
				d.getTimezoneOffset() <
					Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()),
			)
		},
		O: (d: Date) => {
			const offset = d.getTimezoneOffset()
			return (
				(offset > 0 ? '-' : '+') +
				Math.floor(Math.abs(offset) / 60)
					.toString()
					.padStart(2, '0') +
				(Math.abs(offset) % 60).toString().padStart(2, '0')
			)
		},
		P: (d: Date) => {
			const offset = d.getTimezoneOffset()
			return (
				(offset > 0 ? '-' : '+') +
				Math.floor(Math.abs(offset) / 60)
					.toString()
					.padStart(2, '0') +
				':' +
				(Math.abs(offset) % 60).toString().padStart(2, '0')
			)
		},
		T: (d: Date) => {
			const january = new Date(d.getFullYear(), 0, 1)
			const july = new Date(d.getFullYear(), 6, 1)
			return d
				.toLocaleTimeString('en-US', {
					timeZoneName: 'short',
					timeZone:
						january.getTimezoneOffset() < july.getTimezoneOffset()
							? 'Africa/Casablanca' // Morocco's timezone
							: 'Africa/Casablanca',
				})
				.split(' ')[2]
		},
		Z: (d: Date) => -d.getTimezoneOffset() * 60,
		c: (d: Date) => d.toISOString(),
		r: (d: Date) => d.toUTCString(),
		U: (d: Date) => Math.floor(d.getTime() / 1000),
	}

	return dateFormat.replace(
		/[dDjlNSwzWFmMntLoYyaAgGhHisuveiIOPTZcrU]/g,
		(match: string) => {
			if (match in formatters) {
				return formatters[match](date).toString()
			}
			return match
		},
	)
}