import Loading from 'components/Common/Loading'
import React, { createContext, useContext, useEffect, useState } from 'react'
import near from 'services/near'

interface INearContext {
	isInit: boolean
}

const defaultValue: INearContext = {
	isInit: false,
}

export const NearContext = createContext<INearContext>(defaultValue)
export const useNearProvider = () => useContext(NearContext)

export const NearProvider = (props: { children: React.ReactNode }) => {
	const [isInit, setIsInit] = useState(false)

	useEffect(() => {
		near.init(() => setIsInit(true))
	}, [])

	const value = {
		isInit,
	}

	return (
		<NearContext.Provider value={value}>
			{!isInit && <Loading />}
			{props.children}
		</NearContext.Provider>
	)
}
