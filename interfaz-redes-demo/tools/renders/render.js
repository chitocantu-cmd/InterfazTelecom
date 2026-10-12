import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { SCENES } from './scenes.js'
import { project } from './lib.js'

RectAreaLightUniformsLib.init()

window.renderScene = async (name, w, h, ss = 1.5) => {
  const def = SCENES[name]
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(ss)
  renderer.setSize(w, h)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = def.exposure ?? 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  document.body.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = def.envIntensity ?? 0.35

  const camera = new THREE.PerspectiveCamera(def.fov ?? 40, w / h, 0.03, 80)
  const out = def.build(scene, camera, THREE) || {}
  camera.updateMatrixWorld(); camera.updateProjectionMatrix()

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  if (def.ao !== false) {
    const ao = new GTAOPass(scene, camera, w * ss, h * ss)
    ao.updateGtaoMaterial({ radius: def.aoRadius ?? 0.25, distanceExponent: 1, thickness: 1, scale: 1 })
    ao.blendIntensity = def.aoIntensity ?? 0.9
    composer.addPass(ao)
  }
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(w * ss, h * ss), def.bloom ?? 0.35, 0.5, def.bloomThreshold ?? 0.92))
  composer.addPass(new OutputPass())
  composer.render()

  // anclas proyectadas
  const anchors = {}
  for (const [k, v] of Object.entries(out.anchors || {})) anchors[k] = project(v, camera, w, h)

  // reducir a tamaño final
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'
  g.drawImage(renderer.domElement, 0, 0, w, h)
  if (def.grade) def.grade(g, w, h)
  return { data: c.toDataURL('image/webp', 0.86), anchors }
}
window.ready = true
