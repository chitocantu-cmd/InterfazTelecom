/**
 * Pases de «lente» para la escena 3D del site.
 *
 * - DofPass: profundidad de campo con la profundidad real de la escena (la del búfer donde se dibujó, sin volver a
 *   dibujar la escena). Al enfocar un componente, lo que está más cerca o más lejos se desenfoca como con una lente
 *   de foto; en la vista general, apenas. Los píxeles enfocados no hacen trabajo extra, y un objeto nítido al frente
 *   no se derrama sobre el fondo desenfocado.
 * - FinishPass: viñeta óptica y grano fino sobre la imagen final (en sRGB), para que se lea como fotografía.
 */
import * as THREE from 'three'
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass.js'

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

export class DofPass extends Pass {
  material: THREE.ShaderMaterial
  private quad: FullScreenQuad

  constructor(camera: THREE.PerspectiveCamera) {
    super()
    this.material = new THREE.ShaderMaterial({
      name: 'RackDof',
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        focus: { value: 4 },
        aperture: { value: 0 },
        maxBlur: { value: 12 },
        resolution: { value: new THREE.Vector2(1, 1) },
        near: { value: camera.near },
        far: { value: camera.far },
      },
      vertexShader: VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float focus;
        uniform float aperture;
        uniform float maxBlur;
        uniform vec2 resolution;
        uniform float near;
        uniform float far;
        varying vec2 vUv;
        float dist(vec2 uv) {
          float z = texture2D(tDepth, uv).x * 2.0 - 1.0;
          return 2.0 * near * far / (far + near - z * (far - near));
        }
        // Círculo de confusión en píxeles.
        float coc(float d) { return min(maxBlur, aperture * abs(d - focus) / d); }
        void main() {
          vec4 base = texture2D(tDiffuse, vUv);
          float d0 = dist(vUv);
          float c0 = coc(d0);
          if (c0 < 0.6) { gl_FragColor = base; return; }
          vec3 sum = base.rgb;
          float wsum = 1.0;
          for (int i = 1; i < 26; i++) {
            float fi = float(i);
            float r = sqrt(fi / 26.0) * c0;
            float a = fi * 2.39996323;
            vec2 uv = vUv + vec2(cos(a), sin(a)) * r / resolution;
            float ds = dist(uv);
            // Una muestra más cercana sólo cuenta si su propio desenfoque alcanza este píxel.
            float w = ds < d0 ? smoothstep(r - 1.0, r + 1.0, coc(ds)) : 1.0;
            sum += texture2D(tDiffuse, uv).rgb * w;
            wsum += w;
          }
          gl_FragColor = vec4(sum / wsum, base.a);
        }`,
      depthTest: false,
      depthWrite: false,
    })
    this.quad = new FullScreenQuad(this.material)
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    const u = this.material.uniforms
    u.tDiffuse.value = readBuffer.texture
    u.tDepth.value = readBuffer.depthTexture
    u.resolution.value.set(readBuffer.width, readBuffer.height)
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer)
    this.quad.render(renderer)
  }

  dispose() { this.material.dispose(); this.quad.dispose() }
}

export class FinishPass extends Pass {
  material: THREE.ShaderMaterial
  private quad: FullScreenQuad

  constructor() {
    super()
    this.material = new THREE.ShaderMaterial({
      name: 'RackFinish',
      uniforms: { tDiffuse: { value: null }, resolution: { value: new THREE.Vector2(1, 1) }, seed: { value: 0 }, grain: { value: 0.022 }, vignette: { value: 0.24 } },
      vertexShader: VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float seed;
        uniform float grain;
        uniform float vignette;
        varying vec2 vUv;
        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          vec2 q = (vUv - 0.5) * vec2(1.0, resolution.y / resolution.x) * 1.6;
          c.rgb *= 1.0 - vignette * smoothstep(0.35, 1.05, dot(q, q));
          // Grano de luminancia, más visible en los medios tonos (como en una foto).
          float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
          c.rgb += (hash(vUv * resolution + seed) - 0.5) * grain * (0.35 + l * (1.0 - l) * 2.6);
          gl_FragColor = c;
        }`,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
    this.quad = new FullScreenQuad(this.material)
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    const u = this.material.uniforms
    u.tDiffuse.value = readBuffer.texture
    u.resolution.value.set(readBuffer.width, readBuffer.height)
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer)
    this.quad.render(renderer)
  }

  dispose() { this.material.dispose(); this.quad.dispose() }
}
