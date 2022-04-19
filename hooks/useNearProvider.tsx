import cachios from 'cachios'
import Loader from 'components/Common/Loader'
import DepositModal from 'components/Modal/DepositModal'
import LoginModal from 'components/Modal/LoginModal'
import { IProfile } from 'interfaces'
import React, { createContext, useContext, useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'

interface INearContext {
	isInit: boolean
	hasDeposit: boolean
	accountId: string | null
	commonModal: TCommonModal
	setCommonModal: React.Dispatch<React.SetStateAction<TCommonModal>>
	userProfile: IProfile | null
	parasBalance: string
}

type TCommonModal = 'login' | 'deposit' | null

const defaultValue: INearContext = {
	isInit: false,
	hasDeposit: false,
	accountId: null,
	commonModal: null,
	setCommonModal: () => null,
	userProfile: null,
	parasBalance: '0',
}

export const NearContext = createContext<INearContext>(defaultValue)
export const useNearProvider = () => useContext(NearContext)

export const NearProvider = (props: { children: React.ReactNode }) => {
	const [isInit, setIsInit] = useState(false)
	const [hasDeposit, setHasDeposit] = useState(false)
	const [accountId, setAccountId] = useState(null)
	const [commonModal, setCommonModal] = useState<TCommonModal>(null)
	const [parasBalance, setParasBalance] = useState('0')
	const [userProfile, setUserProfile] = useState<IProfile>({})

	useEffect(() => {
		near.init(() => {
			checkStorageDeposit()
			setIsInit(true)
			setAccountId(near.wallet.getAccountId())
			if (near.wallet.getAccountId()) {
				getUserProfile()
				getParasBalance()
			}
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

	const getParasBalance = async () => {
		const balanceParas = await near.nearViewFunction({
			methodName: 'ft_balance_of',
			contractName: CONTRACT.TOKEN,
			args: {
				account_id: near.wallet.getAccountId(),
			},
		})
		setParasBalance(balanceParas)
	}

	const getUserProfile = async () => {
		const resp = await cachios.get<{ data: { results: IProfile[] } }>(
			`${process.env.NEXT_PUBLIC_API_PARAS}/profiles`,
			{
				params: {
					accountId: near.wallet.getAccountId(),
				},
			}
		)
		if (resp.data.data.results[0]) {
			setUserProfile(resp.data.data.results[0])
		}
	}

	const value: INearContext = {
		isInit,
		hasDeposit,
		accountId,
		commonModal,
		userProfile,
		parasBalance,
		setCommonModal,
	}

	return (
		<NearContext.Provider value={value}>
			<Loader isLoading={!isInit} />
			{props.children}
			<DepositModal show={commonModal === 'deposit'} onClose={() => setCommonModal(null)} />
			<LoginModal show={commonModal === 'login'} onClose={() => setCommonModal(null)} />
		</NearContext.Provider>
	)
}
