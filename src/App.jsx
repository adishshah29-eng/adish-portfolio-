import CaveScene from './components/CaveScene'
import StoryText from './components/StoryText'
import useStoryProgress from './hooks/useStoryProgress'
import { remapAfterIntro } from './scene/shots'
import './App.css'

function App() {
  const progress = useStoryProgress()
  const shotProgress = remapAfterIntro(progress)

  return (
    <div className="scene-scroll">
      <div className="scene-sticky">
        <CaveScene shotProgress={shotProgress} />
        <StoryText shotProgress={shotProgress} rawProgress={progress} />
      </div>
    </div>
  )
}

export default App
