import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import { DEFAULT_IMG } from 'constants/common'
import { useWalletSelector } from 'contexts/WalletSelectorContext'
import { IProfile } from 'interfaces'
import { parseImgUrl, prettyTruncate } from 'utils/common'

interface ProfileModalProps {
	show: boolean
	onClose: () => void
	profile: IProfile
}

const ProfileModal = ({ show, profile, onClose }: ProfileModalProps) => {
	const { selector, modal } = useWalletSelector()

	const handleSwitchWallet = () => {
		modal?.show()
		onClose()
	}

	const handleSignOut = async () => {
		if (!selector) return
		const wallet = await selector.wallet()
		await wallet.signOut()
		window.location.replace(window.location.origin + window.location.pathname)
	}

	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md m-auto max-w-xs text-center">
				<p className="font-bold text-xl mb-3">Account</p>
				<div className="w-20 h-20 rounded-full mx-auto">
					<img
						className="w-20 h-20 border border-gray-600 rounded-full mx-auto"
						src={parseImgUrl(profile.imgUrl as string, DEFAULT_IMG)}
						alt="profile-image"
					/>
				</div>
				<p className="mt-4 opacity-90 text-lg font-semibold">
					{prettyTruncate(profile.accountId, 24, 'address')}
				</p>
				<div className="flex justify-between items-center mt-4">
					<Button isFullWidth onClick={handleSwitchWallet}>
						Switch Wallet
					</Button>
				</div>
				<div className="flex justify-between items-center mt-4">
					<Button isFullWidth onClick={handleSignOut}>
						Logout
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ProfileModal
