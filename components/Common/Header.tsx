import IconParas from 'components/Icon/IconParas'

const Header = () => (
	<div className="flex items-center p-4 max-w-6xl mx-auto mb-8">
		<div className="w-0 md:w-1/3"></div>
		<div className="w-1/2 md:w-1/3">
			<div className="w-24 mx-0 md:mx-auto text-center">
				<IconParas />
			</div>
		</div>
		<div className="w-1/2 md:w-1/3 text-right">
			<div>
				<p className="text-white font-bold">ahnaf.near</p>
				<p className="text-white text-sm opacity-80">logout</p>
			</div>
		</div>
	</div>
)

export default Header
