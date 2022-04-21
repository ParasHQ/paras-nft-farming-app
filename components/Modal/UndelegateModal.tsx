import Button from 'components/Common/Button'
import InputText from 'components/Common/InputText'
import Modal from 'components/Common/Modal'
import IconBack from 'components/Icon/IconBack'
import { GAS_FEE } from 'constants/gasFee'
import { FunctionCallOptions } from 'near-api-js/lib/account'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import near, { CONTRACT, getAmount } from 'services/near'
import { formatParasAmount, parseParasAmount, prettyBalance } from 'utils/common'

interface UndelegateTokenModalProps {
	show: boolean
	onClose: () => void
	delegationBalance: number
}

interface UndelegateTokenForm {
	inputUndelegate: string
}

const UndelegateTokenModal = (props: UndelegateTokenModalProps) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<UndelegateTokenForm>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const undelegateToken = async ({ inputUndelegate }: UndelegateTokenForm) => {
		setIsSubmitting(true)

		try {
			const txs: {
				receiverId: string
				functionCalls: FunctionCallOptions[]
			}[] = []

			txs.push({
				receiverId: CONTRACT.FARM,
				functionCalls: [
					{
						methodName: 'undelegate_seed',
						contractId: CONTRACT.FARM,
						args: {
							amount: parseParasAmount(inputUndelegate),
						},
						attachedDeposit: getAmount('1'),
						gas: getAmount(GAS_FEE[200]),
					},
				],
			})

			return await near.executeMultipleTransactions(txs)
		} catch (err) {
			console.log(err)
			setIsSubmitting(false)
		}
	}

	return (
		<Modal isShow={props.show} onClose={props.onClose}>
			<div className="max-w-sm w-full bg-parasGrey p-4 rounded-lg m-auto shadow-xl">
				<div className="flex items-center mb-4">
					<div className="w-1/5">
						<div className="inline-block cursor-pointer" onClick={props.onClose}>
							<IconBack />
						</div>
					</div>
					<div className="w-3/5 flex-1 text-center">
						<p className="font-bold text-xl text-white">Remove</p>
						<p className="text-white text-sm -mt-1">DAO Contract</p>
					</div>
					<div className="w-1/5" />
				</div>

				<div>
					<p className="opacity-80 text-right text-white text-sm mb-1">
						Balance: {prettyBalance(props.delegationBalance.toString())} ℗
					</p>
					<div className="flex justify-between items-center border-2 border-borderGray rounded-lg">
						<InputText
							{...register('inputUndelegate', {
								required: true,
								min: 0.1,
								max: formatParasAmount(props.delegationBalance),
							})}
							className="border-none"
							type="number"
							placeholder="0.0"
						/>
						<p className="text-white font-bold mr-3 shado">PARAS</p>
					</div>
					{errors.inputUndelegate?.type === 'min' && (
						<span className="text-red-500 text-xs">Min is 0.1 PARAS</span>
					)}
					{errors.inputUndelegate?.type === 'required' && (
						<span className="text-red-500 text-xs">This field is required</span>
					)}
					{errors.inputUndelegate?.type === 'max' && (
						<span className="text-red-500 text-xs">
							Max is {prettyBalance(props.delegationBalance.toString(), 18, 4)} PARAS
						</span>
					)}
					<div className="text-left">
						<Button
							onClick={() =>
								setValue('inputUndelegate', formatParasAmount(props.delegationBalance), {
									shouldValidate: true,
								})
							}
							className="float-none mt-2 w-16"
							size="sm"
							color="gray"
						>
							use max
						</Button>
					</div>
					<div className="p-3 rounded-md bg-blueGray bg-opacity-25 mt-4">
						<p className="text-white text-xs text-center font-medium m-auto">
							Please note you won't be able to unstake PARAS immediately.{' '}
							{prettyBalance(watch('inputUndelegate') || '0', 0)} PARAS will be available after 1
							day
						</p>
					</div>
				</div>
				<Button
					isLoading={isSubmitting}
					onClick={handleSubmit(undelegateToken)}
					isFullWidth
					color="blue-gray"
					size="lg"
					className="mt-4"
				>
					Remove
				</Button>
			</div>
		</Modal>
	)
}

export default UndelegateTokenModal
