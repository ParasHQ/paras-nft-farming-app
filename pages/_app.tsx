import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import near from 'services/near'

function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		near.init()
	}, [])

	return <Component {...pageProps} />
}

export default MyApp
