import { IDataInputDropdown } from 'interfaces'
import React, { useEffect, useState } from 'react'

interface InputDropdownProps {
	data: IDataInputDropdown[]
	defaultValue: string
	selectItem(value: IDataInputDropdown): void
	fullWidth: boolean
}

const InputDropdown = ({
	data,
	defaultValue = '',
	selectItem = () => null,
	fullWidth = false,
}: InputDropdownProps) => {
	const [modal, setModal] = useState(false)
	const [select, setSelect] = useState(defaultValue)

	useEffect(() => {
		const onClickEv = () => {
			setModal(false)
		}
		if (modal) document.body.addEventListener('click', onClickEv)

		return () => document.body.removeEventListener('click', onClickEv)
	}, [modal])

	return (
		<div className="relative">
			<div
				className={`flex bg-opacity-5 bg-white justify-between items-center relative w-full ${
					fullWidth ? `md:w-full` : `md:w-36`
				} px-3 py-2 rounded-lg cursor-pointer`}
				onClick={() => setModal(true)}
			>
				<p className="truncate text-white">{select}</p>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="rgb(55, 65, 81)"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M19 9l-7 7-7-7"
					></path>
				</svg>
			</div>
			{modal && (
				<div
					className={`right-0 ${
						fullWidth ? `w-full md:w-full` : `w-48 md:w-36`
					} py-2 mt-2 bg-[#1E2431] shadow-lg rounded-lg absolute z-20 overflow-hidden`}
				>
					<div className="overflow-y-scroll max-h-60">
						<ul className="text-white w-full">
							{data.map((item, index) => {
								return (
									<li
										key={index}
										className={`${
											item.label === select ? 'text-white bg-[#171b25]' : ''
										} px-3 py-2 cursor-pointer hover:bg-opacity-5 hover:bg-white`}
										onClick={() => {
											setSelect(item.label)
											selectItem(item)
										}}
									>
										{item.label}
									</li>
								)
							})}
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}

export default InputDropdown
