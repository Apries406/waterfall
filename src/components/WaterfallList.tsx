import { useLatest, useUpdateEffect } from 'ahooks'
import { useEffect, useRef, useState } from 'react'
import list, { colorArr } from '../assets/data'
import { CardItem, CardPos, WaterFallProps } from '../assets/types'
import './waterfall.scss'
const WaterfallList = (props: WaterFallProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [isFinish, setIsFinish] = useState<boolean>(false)
	const [page, setPage] = useState<number>(1)
	const [cardWidth, setCardWidth] = useState<number>(0)
	const [cardList, setCardList] = useState<CardItem[]>([])
	const [cardPos, setCardPos] = useState<CardPos[]>([])
	const [columnHeight, setColumnHeight] = useState<number[]>([])
	const minInfo = useLatest<{
		minIndex: number
		minHeight: number
	}>({
		minIndex: -1,
		minHeight: Infinity,
	})
	const request = (page: number, pageSize: number) => {
		return new Promise<CardItem[]>((resolve) => {
			setTimeout(() => {
				resolve(
					list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
				)
			}, 200)
		})
	}
	const getCardList = async (page: number, pageSize: number) => {
		if (isFinish) return
		const res = await request(page, pageSize)

		setPage((page) => page + 1)

		if (!res.length) {
			setIsFinish(true)
			return
		}
		setCardList([...cardList, ...res])
		for (let i = 0; i < res.length; i++) {
			// console.dir(res[i])
		}
		// computedPos(res)
	}
	const init = () => {
		if (containerRef.current) {
			const containerWidth = containerRef.current.clientWidth
			setCardWidth(
				(containerWidth - props.gap * (props.column - 1)) / props.column
			)
			// console.log('cardWidth', cardWidth)
			getCardList(page, props.pageSize)
		}
	}

	const computedPos = (list: CardItem[]) => {
		list.forEach((item, index) => {
			const cardHeight = Math.floor((item.height * cardWidth) / item.width)
			// console.log(cardHeight)
			if (index < props.column) {
				// * 第一行
				setCardPos((prevCardPos) => [
					...prevCardPos,
					{
						width: cardWidth,
						height: cardHeight,
						x: index % props.column !== 0 ? index * (cardWidth + props.gap) : 0,
						y: 0,
					},
				])
				setColumnHeight((prevColumnHeight) => {
					const newColumnHeight = [...prevColumnHeight]
					newColumnHeight[index] = cardHeight + props.gap
					return newColumnHeight
				})
			} else {
				const { minIndex, minHeight } = minInfo.current
				console.log(minIndex, minHeight)
				setCardPos((prevCardPos) => [
					...prevCardPos,
					{
						width: cardWidth,
						height: cardHeight,
						x:
							minIndex % props.column !== 0
								? minIndex * (cardWidth + props.gap)
								: 0,
						y: minHeight,
					},
				])
				setColumnHeight((prevColumnHeight) => {
					const newColumnHeight = [...prevColumnHeight]
					newColumnHeight[minIndex] += cardHeight + props.gap
					return newColumnHeight
				})
			}
		})
	}

	useEffect(() => {
		init()
	}, [])
	useUpdateEffect(() => {
		let minIndex = -1,
			minHeight = Infinity

		console.log(columnHeight)
		columnHeight.forEach((height, index) => {
			if (height < minHeight) {
				minHeight = height
				minIndex = index
			}
			minInfo.current = {
				minIndex,
				minHeight,
			}

			console.log({ minHeight, minIndex })
		})

		console.log({ minIndex, minHeight })
	}, [columnHeight])
	useUpdateEffect(() => {
		computedPos(cardList)
	}, [cardList, cardWidth])
	useUpdateEffect(() => {}, [cardPos])
	return (
		<>
			<div className='waterfall-container' ref={containerRef}>
				<div className='waterfall-list'>
					{cardList.map((item, index) => (
						<div
							className='waterfall-list-item'
							key={item.id + index.toString()}
							style={{
								width: `${cardPos[index]?.width}px`,
								height: `${cardPos[index]?.height}px`,
								transform: `translate3d(${cardPos[index]?.x}px, ${cardPos[index]?.y}px, 0)`,
							}}
						>
							<div
								className='card-box'
								style={{
									background: colorArr[index % (colorArr.length - 1)],
								}}
							></div>
						</div>
					))}
				</div>
			</div>
		</>
	)
}

export default WaterfallList
