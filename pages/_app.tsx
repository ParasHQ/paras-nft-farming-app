import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { NearProvider } from 'hooks/useNearProvider'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<NearProvider>
			<Component {...pageProps} />
		</NearProvider>
	)
}

export default MyApp
