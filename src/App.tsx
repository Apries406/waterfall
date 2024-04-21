import './app.scss'
import WaterfallList from './components/WaterfallList'
function App() {
	return (
		<>
			<div className='app'>
				<div className='container'>
					<WaterfallList gap={10} column={10} bottom={200} pageSize={20} />
				</div>
			</div>
		</>
	)
}

export default App
