export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: URL, userId: string | null) => {
	window.gtag('config', GA_TRACKING_ID as string, {
		page_path: url,
		...(userId && { user_id: userId }),
		is_login: userId ? 'logged-in' : 'non-login',
	})
}

type IGTagEvent = {
	action: string
	category: string
	label?: string
	value?: string | number | boolean
	additionalParams?: {
		[key: string]: string | number | boolean | null
	}
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value, additionalParams }: IGTagEvent) => {
	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value: value,
		...additionalParams,
	})
}
