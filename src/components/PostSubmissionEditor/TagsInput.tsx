import { gql, useLazyQuery } from '@apollo/client'
import { FC, useEffect, useRef, useState } from 'react'
import Loading from '../Button/Loading'
import { QUERY_GET_TAGS } from '@/fragments/queries'
import { NcmazFcTagShortFieldsFragmentFragment } from '@/__generated__/graphql'
import ButtonPrimary from '../Button/ButtonPrimary'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { NC_SITE_SETTINGS } from '@/contains/site-settings'
import getTrans from '@/utils/getTrans'

const MAX_TAGS_LENGTH = NC_SITE_SETTINGS['submissions-settings']?.max_tags_allowed || 5

export interface TagNodeShort extends NcmazFcTagShortFieldsFragmentFragment {}

interface TagsInputProps {
	onChange: (tags: TagNodeShort[]) => void
	defaultValue?: TagNodeShort[]
}

const TagsInput: FC<TagsInputProps> = ({ onChange, defaultValue }) => {
	const T = getTrans()

	const [queryGetTags, { loading, error, data, fetchMore, called }] = useLazyQuery(QUERY_GET_TAGS, {
		notifyOnNetworkStatusChange: true,
		context: {
			fetchOptions: {
				method: process.env.NEXT_PUBLIC_SITE_API_METHOD || 'GET',
			},
		},
		variables: { first: 50 },
	})

	const handleClickShowMore = () => {
		fetchMore({
			variables: {
				after: data?.tags?.pageInfo?.endCursor,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult || !fetchMoreResult?.tags?.nodes) {
					return prev
				}
				return {
					tags: {
						...fetchMoreResult.tags,
						nodes: [...(prev?.tags?.nodes || []), ...fetchMoreResult.tags.nodes],
					},
				}
			},
		})
	}

	const containerRef = useRef<HTMLDivElement>(null)
	const [isOpen, setIsOpen] = useState(false)
	const [tags, setTags] = useState<TagNodeShort[]>(defaultValue || [])

	useEffect(() => {
		if (isOpen) {
			queryGetTags()
		}
	}, [isOpen])

	useEffect(() => {
		if (tags.length >= MAX_TAGS_LENGTH) {
			setIsOpen(false)
		}
		onChange(tags)
	}, [tags])

	function closePopover() {
		setIsOpen(false)
	}

	function openPopover() {
		setIsOpen(true)
	}

	const checkIncludes = (tag: TagNodeShort) => tags.some((item) => item.name === tag.name)

	const handleAddTag = (tag: TagNodeShort) => {
		if (!checkIncludes(tag) && tags.length < MAX_TAGS_LENGTH) {
			setTags([...tags, tag])
		}
	}

	const handleRemoveTag = (tag: TagNodeShort) => {
		setTags(tags.filter((t) => t.name !== tag.name))
	}

	const tagsData = (data?.tags?.nodes || []) as NcmazFcTagShortFieldsFragmentFragment[]

	return (
		<div className="relative w-full text-xs sm:text-sm">
			<ul className="flex flex-wrap gap-1.5">
				{tags.map((tag) => (
					<li key={tag.databaseId} className="flex items-center rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
						 {tag.name}
						<button
							className="ms-1 flex items-center justify-center px-1 text-base hover:text-neutral-900 dark:hover:text-neutral-50"
							onClick={() => handleRemoveTag(tag)}
							title="Remove tag"
						>
							<XMarkIcon className="h-4 w-4" />
						</button>
					</li>
				))}

				{tags.length < MAX_TAGS_LENGTH && (
					<li>
						<button onClick={openPopover} className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
							+ {T.pageSubmission['Add tag']}
						</button>
					</li>
				)}
			</ul>

			{isOpen && (
				<div ref={containerRef} className="absolute inset-x-0 top-full z-50 mt-4 rounded-2xl bg-white p-5 shadow-lg dark:bg-neutral-800">
					<h3 className="text-xl font-semibold">{T.Tags}</h3>
					<div className="border-b border-neutral-300 dark:border-neutral-700" />
					{!!error && <p className="text-red-500">{error.message}</p>}
					{!!loading && !tagsData.length && <Loading />}
					{!!tagsData.length && (
						<ul className="flex flex-wrap gap-2">
							{tagsData.map((tag) => {
								const isSelected = checkIncludes(tag)
								return (
									<li key={tag.databaseId}>
										<button
											className={`flex items-center justify-center rounded-lg px-3 py-2 ${
												isSelected
													? 'bg-neutral-900 text-neutral-50'
													: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600'
											}`}
											onClick={() => {
												if (isSelected) {
													handleRemoveTag(tag)
												} else {
													handleAddTag(tag)
												}
											}}
										>
											#{tag.name} ({tag.count || 0})
										</button>
									</li>
								)
							})}
						</ul>
					)}

					{data?.tags?.pageInfo.hasNextPage && (
						<>
							<div className="border-b border-neutral-300 dark:border-neutral-700" />
							<div className="flex justify-center">
								<ButtonPrimary loading={loading} onClick={handleClickShowMore}>
									{T.pageSubmission['Load more tags']}
								</ButtonPrimary>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default TagsInput
