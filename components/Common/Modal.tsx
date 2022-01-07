import React, { useEffect, useRef } from 'react'

interface ModalProps {
	isShow: boolean
	onClose: () => void
	closeOnBgClick?: boolean
	closeOnEscape?: boolean
	children: React.ReactNode
	backgroundColor?: string
	style?: React.CSSProperties
	className?: string
}

const Modal = ({
	isShow = true,
	onClose = () => null,
	closeOnBgClick = true,
	closeOnEscape = true,
	children,
	backgroundColor = `rgba(0,0,0,0.5)`,
	style = {},
	className,
}: ModalProps) => {
	const modalRef = useRef(null)

	useEffect(() => {
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}
		if (closeOnEscape) {
			document.addEventListener('keydown', onKeydown)
		}

		return () => {
			document.removeEventListener('keydown', onKeydown)
		}
	}, [onClose, closeOnEscape])

	const bgClick = (e: React.MouseEvent<HTMLElement>) => {
		if (e.target === modalRef.current && closeOnBgClick) {
			onClose()
		}
	}

	if (!isShow) return null

	return (
		<div
			ref={modalRef}
			onClick={(e: React.MouseEvent<HTMLElement>) => bgClick(e)}
			className={`fixed inset-0 z-50 flex items-center p-4 ${className}`}
			style={{
				backgroundColor: backgroundColor,
				...style,
			}}
		>
			{children}
		</div>
	)
}

export default Modal
