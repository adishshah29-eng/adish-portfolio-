import { useRef } from 'react'
import CaveScene from './components/CaveScene'
import StoryText from './components/StoryText'
import FogOverlay from './components/FogOverlay'
import Preloader from './components/Preloader'
import SelectedWork from './components/SelectedWork'
import ContactFooter from './components/ContactFooter'
import useStoryProgress from './hooks/useStoryProgress'
import { remapAfterIntro, fogOpacityFor } from './scene/shots'
import './App.css'

function App() {
  const sceneRef = useRef(null)
  const progress = useStoryProgress(sceneRef)
  const shotProgress = remapAfterIntro(progress)
  const fogOpacity = fogOpacityFor(shotProgress)

  return (
    <>
      <Preloader />
      <div className="scene-scroll" ref={sceneRef} id="top">
        <div className="scene-sticky">
          <CaveScene shotProgress={shotProgress} />
          <StoryText shotProgress={shotProgress} rawProgress={progress} fogOpacity={fogOpacity} />
          <FogOverlay opacity={fogOpacity} />
        </div>
      </div>
      <SelectedWork />
      <ContactFooter />
    </>
  )
}

export default App
