import Loading from 'components/Common/Loading'
import DepositModal from 'components/Modal/DepositModal'
import LoginModal from 'components/Modal/LoginModal'
import React, { createContext, useContext, useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

interface INearContext {
	isInit: boolean
	hasDeposit: boolean
	accountId: string | null
	commonModal: TCommonModal
	setCommonModal: React.Dispatch<React.SetStateAction<TCommonModal>>
}

type TCommonModal = 'login' | 'deposit' | null

const defaultValue: INearContext = {
	isInit: false,
	hasDeposit: false,
	accountId: null,
	commonModal: null,
	setCommonModal: () => {},
}

export const NearContext = createContext<INearContext>(defaultValue)
export const useNearProvider = () => useContext(NearContext)

export const NearProvider = (props: { children: React.ReactNode }) => {
	const [isInit, setIsInit] = useState(false)
	const [hasDeposit, setHasDeposit] = useState(false)
	const [accountId, setAccountId] = useState(null)
	const [commonModal, setCommonModal] = useState<TCommonModal>(null)

	useEffect(() => {
		near.init(() => {
			checkStorageDeposit()
			setIsInit(true)
			setAccountId(near.wallet.getAccountId())
		})
	}, [])

	const checkStorageDeposit = async () => {
		const userId = near.wallet.getAccountId()
		if (userId) {
			const deposited = await near.nearViewFunction({
				contractName: CONTRACT.FARM,
				methodName: 'storage_balance_of',
				args: {
					account_id: userId,
				},
			})
			deposited && setHasDeposit(true)
		}
	}

	const value: INearContext = {
		isInit,
		hasDeposit,
		accountId,
		commonModal,
		setCommonModal,
	}

	return (
		<NearContext.Provider value={value}>
			{!isInit && <Loading />}
			{props.children}
			<DepositModal show={commonModal === 'deposit'} onClose={() => setCommonModal(null)} />
			<LoginModal show={commonModal === 'login'} onClose={() => setCommonModal(null)} />
		</NearContext.Provider>
	)
}
