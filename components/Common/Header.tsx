import axios from 'axios'
import IconParas from 'components/Icon/IconParas'
import ProfileModal from 'components/Modal/ProfileModal'
import { useNearProvider } from 'hooks/useNearProvider'
import { IProfile } from 'interfaces'
import { useEffect, useRef, useState } from 'react'
import near, { CONTRACT } from 'services/near'
import { parseImgUrl, prettyBalance, prettyTruncate } from 'utils/common'
import Button from './Button'

const NAV_LINK = [
	{
		exchange: `Ref Finance`,
		url: `https://app.ref.finance/#token.paras.near|wrap.near`,
	},
	{
		exchange: `MEXC`,
		url: `https://www.mexc.com/exchange/PARAS_USDT`,
	},
	{
		exchange: `Hotbit`,
		url: `https://www.hotbit.io/exchange?symbol=PARAS_USDT`,
	},
]

const Header = () => {
	const bgRef = useRef(null)
	const { accountId } = useNearProvider()
	const [balance, setBalance] = useState('0')
	const [userProfile, setUserProfile] = useState<IProfile>({})
	const [showProfileModal, setShowProfileModal] = useState(false)
	const [showGetParas, setShowGetParas] = useState(false)

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
						<div className="w-6 h-6 rounded-full bg-parasGrey">
							{userProfile.imgUrl && (
								<img
									className="w-6 h-6 border border-gray-600 rounded-full"
									src={parseImgUrl(userProfile.imgUrl)}
									alt="profile-image"
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		)
	}

	useEffect(() => {
		const checkIfClickedOutside = (e: Event) => {
			// If the menu is open and the clicked target is not within the menu,
			// then close the menu
			if (showGetParas && bgRef.current && !bgRef.current.contains(e.target)) {
				setShowGetParas(false)
			}
		}

		document.addEventListener('mousedown', checkIfClickedOutside)

		return () => {
			// Cleanup the event listener
			document.removeEventListener('mousedown', checkIfClickedOutside)
		}
	}, [showGetParas])

	return (
		<div className="sticky top-0 z-50 bg-gray-900">
			<ProfileModal
				show={showProfileModal}
				onClose={() => setShowProfileModal(false)}
				profile={userProfile}
			/>
			<div className="flex items-center p-4 max-w-6xl mx-auto justify-between">
				<div className="flex items-center">
					<div className="w-24 mr-16">
						<IconParas />
					</div>
				</div>

				<div className="flex items-center">
					<div className="relative mx-4">
						<Button
							onClick={() => {
								setShowGetParas(!showGetParas)
							}}
							className="flex items-center px-4"
						>
							<span className="pr-1">Get $PARAS</span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M19.293 7.29291L20.7072 8.70712L12.0001 17.4142L3.29297 8.70712L4.70718 7.29291L12.0001 14.5858L19.293 7.29291Z"
									fill="white"
								/>
							</svg>
						</Button>
						{showGetParas && (
							<div
								ref={bgRef}
								className="flex flex-col absolute w-full rounded-md mt-2 overflow-hidden bg-gray-700"
							>
								{NAV_LINK.map((x) => {
									return (
										<a
											className="flex text-white py-2 px-4 bg-gray-800 hover:bg-opacity-50 text-sm"
											target="_blank"
											href={x.url}
										>
											{x.exchange}
											<span className="pl-1">
												<svg
													width="8"
													height="8"
													viewBox="0 0 16 16"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fill-rule="evenodd"
														clip-rule="evenodd"
														d="M7.70421 9.70711L13.9971 3.41421V7H15.9971V0H8.9971V2H12.5829L6.28999 8.29289L7.70421 9.70711ZM15 14V10H13V14H2V3H6V1H2C0.89543 1 0 1.89543 0 3V14C0 15.1046 0.89543 16 2 16H13C14.1046 16 15 15.1046 15 14Z"
														fill="white"
													/>
												</svg>
											</span>
										</a>
									)
								})}
							</div>
						)}
					</div>
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
