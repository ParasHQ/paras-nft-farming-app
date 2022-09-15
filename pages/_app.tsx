import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import 'rc-slider/assets/index.css'
import type { AppProps } from 'next/app'
import { NearProvider } from 'hooks/useNearProvider'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import * as gtag from '../lib/gtag'
import { useStore } from 'services/store'

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter()
	const { accountId } = useStore()

	useEffect(() => {
		const handleRouteChange = (url: URL) => {
			gtag.pageview(url, accountId)
		}

		// if (process.env.APP_ENV === 'production') {
		router.events.on('routeChangeComplete', handleRouteChange)
		// }

		return () => {
			router.events.off('routeChangeComplete', handleRouteChange)
		}
	}, [router.events])

	return (
		<NearProvider>
			<Component {...pageProps} />
		</NearProvider>
	)
}

export default MyApp
