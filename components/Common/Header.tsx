import IconParas from 'components/Icon/IconParas'
import near from 'services/near'

const Header = () => (
	<div className="flex items-center p-4 max-w-6xl mx-auto mb-8">
		<div className="w-0 md:w-1/3"></div>
		<div className="w-1/2 md:w-1/3">
			<div className="w-24 mx-0 md:mx-auto text-center">
				<IconParas />
			</div>
		</div>
		<div className="w-1/2 md:w-1/3 text-right">
			<div className="inline-block">
				{near.wallet?.isSignedIn() ? (
					<>
						<p className="text-white font-bold">{near.wallet.getAccountId()}</p>
						<p
							className="text-white text-sm opacity-80 cursor-pointer"
							onClick={() => near.signOut()}
						>
							logout
						</p>
					</>
				) : (
					<p className="text-white font-bold cursor-pointer" onClick={() => near.signIn()}>
						Login
					</p>
				)}
			</div>
		</div>
	</div>
)

export default Header
