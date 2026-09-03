import CaveScene from './components/CaveScene'
import StoryText from './components/StoryText'
import useStoryProgress from './hooks/useStoryProgress'
import './App.css'

function App() {
  const progress = useStoryProgress()

  return (
    <div className="scene-scroll">
      <div className="scene-sticky">
        <CaveScene progress={progress} />
        <StoryText progress={progress} />
      </div>
    </div>
  )
}

export default App
