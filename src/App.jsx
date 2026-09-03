import structureWallsVines from './assets/layers/structure_walls_vines.png'
import backgroundLightshaft from './assets/layers/background_lightshaft.png'
import mainPoolWater from './assets/layers/main_pool_water.png'
import waterfallCenter from './assets/layers/waterfall_center.png'
import foregroundRocks from './assets/layers/foreground_rocks.png'
import foregroundLOrchids from './assets/layers/foreground_L_orchids.png'
import foregroundROrchids from './assets/layers/foreground_R_orchids.png'
import './App.css'

// Native canvas the layers were segmented from (px). Full-frame layers sit
// at 0,0 covering the whole thing; the two orchid crops are positioned by
// their bbox within that same frame, all expressed as % so it scales.
const CANVAS_W = 1915
const CANVAS_H = 821

const FULL_FRAME_LAYERS = [
  { src: structureWallsVines, name: 'structure-walls-vines' },
  { src: backgroundLightshaft, name: 'background-lightshaft' },
  { src: mainPoolWater, name: 'main-pool-water' },
  { src: waterfallCenter, name: 'waterfall-center' },
  { src: foregroundRocks, name: 'foreground-rocks' },
]

const ORCHID_LAYERS = [
  { src: foregroundLOrchids, name: 'foreground-L-orchids', x: 0, y: 242, w: 219, h: 264 },
  { src: foregroundROrchids, name: 'foreground-R-orchids', x: 1519, y: 60, w: 396, h: 341 },
]

function App() {
  return (
    <div className="scene" style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
      {FULL_FRAME_LAYERS.map((layer) => (
        <img key={layer.name} className="scene-layer" src={layer.src} alt="" />
      ))}
      {ORCHID_LAYERS.map((layer) => (
        <img
          key={layer.name}
          className="scene-layer scene-layer--crop"
          src={layer.src}
          alt=""
          style={{
            left: `${(layer.x / CANVAS_W) * 100}%`,
            top: `${(layer.y / CANVAS_H) * 100}%`,
            width: `${(layer.w / CANVAS_W) * 100}%`,
            height: `${(layer.h / CANVAS_H) * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

export default App
