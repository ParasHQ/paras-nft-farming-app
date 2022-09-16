import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import 'rc-slider/assets/index.css'
import type { AppProps } from 'next/app'
import { NearProvider, useNearProvider } from 'hooks/useNearProvider'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import * as gtag from '../lib/gtag'

const AnalyticsWrapper = ({ children }: { children: JSX.Element }) => {
	const router = useRouter()
	const { accountId } = useNearProvider()

	useEffect(() => {
		const handleRouteChange = (url: URL) => {
			gtag.pageview(url, accountId)
		}

		if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
			router.events.on('routeChangeComplete', handleRouteChange)
		}

		return () => {
			router.events.off('routeChangeComplete', handleRouteChange)
		}
	}, [router.events])

	return children
}

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<NearProvider>
			<AnalyticsWrapper>
				<Component {...pageProps} />
			</AnalyticsWrapper>
		</NearProvider>
	)
}

export default MyApp
