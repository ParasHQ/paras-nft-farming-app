import Button from 'components/Common/Button'
import Modal from 'components/Common/Modal'
import near from 'services/near'

interface LoginModalProps {
	show: boolean
	onClose: () => void
}

const LoginModal = ({ show, onClose }: LoginModalProps) => {
	return (
		<Modal isShow={show} onClose={onClose}>
			<div className="bg-parasGrey text-white shadow-xl w-full p-4 rounded-md mx-4 md:m-auto max-w-xs text-center">
				<p className="font-bold text-xl mb-3">Please Login First</p>
				<p className="opacity-90">You will be redirected to NEAR Wallet</p>
				<div className="flex justify-between items-center mt-4">
					<Button isFullWidth onClick={() => near.signIn()}>
						Login
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default LoginModal
