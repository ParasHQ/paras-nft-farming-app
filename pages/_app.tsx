import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { NearProvider } from 'hooks/useNearProvider'
import RPCStatus from 'components/Common/RPCStatus'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<NearProvider>
			<Component {...pageProps} />
			<RPCStatus />
		</NearProvider>
	)
}

export default MyApp
