import { useEffect, useState } from 'react'
import { parseImgUrl } from 'utils/common'
import axios from 'axios'
import { filetypemime } from 'magic-bytes.js'
// import { fileTypeFromBlob } from 'file-type'

const Media = ({ className, url, videoControls = false, videoMuted = true, videoLoop = false }) => {
	const [media, setMedia] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (url) {
			getMedia()
		} else {
			setIsLoading(false)
		}
	}, [url])

	const getMedia = async () => {
		try {
			const resp = await axios.get(`${parseImgUrl(url)}`, {
				responseType: 'arraybuffer',
			})

			const fileType = await filetypemime(new Uint8Array(resp.data))

			const objectUrl = URL.createObjectURL(resp.data)

			setMedia({
				type: fileType.mime,
				url: [objectUrl],
			})
			setIsLoading(false)
		} catch (err) {
			setMedia({
				type: 'image/jpg',
				url: parseImgUrl(url),
			})
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className={className}>
				<div className="flex items-center justify-center w-full h-full">
					<svg
						className="animate-spin m h-5 w-5 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
			</div>
		)
	}

	if (media?.type.includes('image')) {
		return (
			<div className={className}>
				<img className="object-contain w-full h-full" src={media.url} />
			</div>
		)
	}

	if (media?.type.includes('video')) {
		return (
			<video
				className={`w-full h-full ${className}`}
				autoPlay
				playsInline
				loop={videoLoop}
				controls={videoControls}
				muted={videoMuted}
			>
				<source type="video/mp4" src={media.url}></source>
			</video>
		)
	}

	if (media?.type) {
		return (
			<div className={className}>
				<div className="w-full h-full flex items-center justify-center">
					<p>Media not supported</p>
				</div>
			</div>
		)
	}

	return null
}

export default Media
