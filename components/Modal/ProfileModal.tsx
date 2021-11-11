import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import { IProfile } from 'interfaces'
import near from 'services/near'
import { parseImgUrl, prettyTruncate } from 'utils/common'

interface ProfileModalProps {
	show: boolean
	onClose: () => void
	profile: IProfile
}

const ProfileModal = ({ show, profile, onClose }: ProfileModalProps) => {
	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md m-auto max-w-xs text-center">
				<p className="font-bold text-xl mb-3">Account</p>
				<img
					className="w-20 h-20 border border-gray-600 rounded-full mx-auto"
					src={parseImgUrl(profile.imgUrl)}
				/>
				<p className="mt-4 opacity-90 text-lg font-semibold">
					{prettyTruncate(profile.accountId, 24, 'address')}
				</p>
				<div className="flex justify-between items-center mt-4">
					<Button isFullWidth onClick={() => near.signOut()}>
						Logout
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ProfileModal
