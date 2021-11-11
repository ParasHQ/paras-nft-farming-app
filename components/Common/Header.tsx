import axios from 'axios'
import IconParas from 'components/Icon/IconParas'
import ProfileModal from 'components/Modal/ProfileModal'
import { useNearProvider } from 'hooks/useNearProvider'
import { IProfile } from 'interfaces'
import { useEffect, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { parseImgUrl, prettyBalance, prettyTruncate } from 'utils/common'
import Button from './Button'

const Header = () => {
	const { accountId } = useNearProvider()
	const [balance, setBalance] = useState('0')
	const [userProfile, setUserProfile] = useState<IProfile>({})
	const [showProfileModal, setShowProfileModal] = useState(false)

	useEffect(() => {
		const getParasBalance = async () => {
			const balanceParas = await near.nearViewFunction({
				methodName: 'ft_balance_of',
				contractName: CONTRACT.TOKEN,
				args: {
					account_id: near.wallet.getAccountId(),
				},
			})
			setBalance(balanceParas)
		}

		const getUserProfile = async () => {
			const resp = await axios.get(`${process.env.NEXT_PUBLIC_API_PARAS}/profiles`, {
				params: {
					accountId: accountId,
				},
			})
			if (resp.data.data.results[0]) {
				setUserProfile(resp.data.data.results[0])
			}
		}

		if (accountId) {
			getParasBalance()
			getUserProfile()
		}
	}, [accountId])

	const Profile = () => {
		return (
			<div
				onClick={() => setShowProfileModal(true)}
				className="hover:opacity-80 cursor-pointer flex items-center rounded-md overflow-hidden py-1 bg-gray-800"
			>
				<div className="text-white px-2">
					<p>{prettyBalance(balance, 18, 4)} Ⓟ</p>
				</div>
				<div className="px-1">
					<div className="flex items-center bg-black bg-opacity-80 rounded-md px-2 py-1">
						<p className="pr-2 text-gray-300 font-semibold">
							{prettyTruncate(accountId, 16, `address`)}
						</p>
						<img
							className="w-6 h-6 border border-gray-600 rounded-full"
							src={parseImgUrl(userProfile.imgUrl)}
						/>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="sticky top-0 z-50 bg-gray-900">
			<ProfileModal
				show={showProfileModal}
				onClose={() => setShowProfileModal(false)}
				profile={userProfile}
			/>
			<div className="flex items-center p-4 max-w-6xl mx-auto">
				<div className="w-0 lg:w-1/3"></div>
				<div className="w-1/2 lg:w-1/3">
					<div className="w-24 mx-0 lg:mx-auto text-center">
						<IconParas />
					</div>
				</div>
				<div className="w-1/2 lg:w-1/3 text-right">
					<div className="md:inline-block">
						{accountId ? (
							<div className="hidden md:block">
								<Profile />
							</div>
						) : (
							<Button className="w-20" onClick={() => near.signIn()}>
								Login
							</Button>
						)}
					</div>
				</div>
			</div>
			{accountId && (
				<div className="fixed z-10 bottom-0 left-0 right-0 p-4 bg-gray-900 md:hidden">
					<div className="flex justify-center items-center">
						<Profile />
					</div>
				</div>
			)}
		</div>
	)
}

export default Header