import * as THREE from 'three'
import { buildRack, buildLadder, buildFiberDuct, floorTex, perfTex, M, NETWORK_LAYOUT, SERVER_LAYOUT, cableMat, mulberry, patchPanelTex, switchTex, fiberPanelTex } from './lib.js'

function room(scene, { w = 7, d = 14, h = 3.2, z0 = 4, floor = 'tile', wallColor = 0xdfe4e8 } = {}) {
  const ft = floorTex(); ft.repeat.set(w / 0.6, d / 0.6)
  const floorMat = new THREE.MeshStandardMaterial({ map: ft, roughness: 0.32, metalness: 0.05 })
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat)
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, z0 - d / 2); fl.receiveShadow = true
  scene.add(fl)
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.92 })
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); back.position.set(0, h / 2, z0 - d); scene.add(back)
  const l = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat); l.rotation.y = Math.PI / 2; l.position.set(-w / 2, h / 2, z0 - d / 2); scene.add(l)
  const r = l.clone(); r.rotation.y = -Math.PI / 2; r.position.x = w / 2; scene.add(r)
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.ceiling); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, h, z0 - d / 2); scene.add(ceil)
  return { floor: fl }
}

function ledStrip(scene, { x, z0, len, y }) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, len), M.ledPanel)
  strip.position.set(x, y, z0 - len / 2); scene.add(strip)
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, len + 0.04), new THREE.MeshStandardMaterial({ color: 0x9aa3a9, metalness: 0.6, roughness: 0.4 }))
  housing.position.set(x, y + 0.03, z0 - len / 2); scene.add(housing)
  const rl = new THREE.RectAreaLight(0xf1f7ff, 6, len, 0.12)
  rl.position.set(x, y - 0.02, z0 - len / 2); rl.rotation.x = -Math.PI / 2; rl.rotation.z = Math.PI / 2
  rl.lookAt(x, 0, z0 - len / 2)
  scene.add(rl)
}

function shadowSpot(scene, pos, target, intensity = 30, angle = 0.9) {
  const s = new THREE.SpotLight(0xf3f8ff, intensity, 0, angle, 0.7, 1.6)
  s.position.copy(pos); s.target.position.copy(target); s.castShadow = true
  s.shadow.mapSize.set(2048, 2048); s.shadow.bias = -0.0004; s.shadow.radius = 4
  scene.add(s, s.target)
  return s
}

function drops(scene, { x, z, yTop, yBottom, color, count = 6 }) {
  const mat = cableMat(color, 0.5)
  const rnd = mulberry(Math.round(z * 100) + 3)
  for (let i = 0; i < count; i++) {
    const ox = x + (rnd() - 0.5) * 0.06, oz = z + (rnd() - 0.5) * 0.06
    const pts = [new THREE.Vector3(ox, yTop, oz), new THREE.Vector3(ox + 0.01, (yTop + yBottom) / 2, oz), new THREE.Vector3(ox, yBottom, oz)]
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0035, 5), mat)
    m.castShadow = true; scene.add(m)
  }
}

export const SCENES = {
  // ---------- Hero: pasillo de site / centro de datos ----------
  aisle: {
    fov: 38,
    exposure: 1.0,
    envIntensity: 0.3,
    bloom: 0.22,
    build(scene, camera) {
      scene.background = new THREE.Color(0x0b1622)
      scene.fog = new THREE.Fog(0x0e1a27, 7, 15)
      room(scene, { w: 6.4, d: 14, h: 3.3, z0: 4, wallColor: 0xd5dce2 })
      // pasillo frío perforado
      const pt = perfTex(); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(2, 20)
      const perf = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 12), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.4, metalness: 0.2 }))
      perf.rotation.x = -Math.PI / 2; perf.position.set(0, 0.002, -2); perf.receiveShadow = true; scene.add(perf)

      const anchors = {}
      const layouts = [NETWORK_LAYOUT, NETWORK_LAYOUT, SERVER_LAYOUT, NETWORK_LAYOUT, SERVER_LAYOUT, SERVER_LAYOUT, NETWORK_LAYOUT, SERVER_LAYOUT, SERVER_LAYOUT]
      // fila derecha (frente hacia -X)
      for (let i = 0; i < 9; i++) {
        const z = 1.2 - i * 0.6
        const r = buildRack({ layout: layouts[i], seed: 10 + i, cords: i < 5, cordColors: i % 2 ? [0x1d6fd6, 0xb9c2c9] : [0x1d6fd6] })
        r.rotation.y = Math.PI; r.position.set(0.6, 0, z)
        scene.add(r)
        if (i === 1) {
          for (const [k, v] of Object.entries(r.userData.anchors)) anchors[k] = r.localToWorld(v.clone().add(new THREE.Vector3(0.04, 0, 0.18)))
        }
      }
      // fila izquierda (frente hacia +X)
      for (let i = 0; i < 9; i++) {
        const z = 1.2 - i * 0.6
        const r = buildRack({ layout: layouts[(i + 3) % layouts.length], seed: 40 + i, cords: i < 3, cordColors: [0x1d6fd6, 0xb9c2c9] })
        r.position.set(-0.6, 0, z)
        scene.add(r)
      }
      // escalerillas y fibra
      scene.add(buildLadder({ length: 7, width: 0.45, y: 2.45, x: 1.05, z0: 1.6, bundles: [{ offset: -0.12, color: 0x1d6fd6, count: 22 }, { offset: 0.06, color: 0x9aa3a9, count: 16 }] }))
      scene.add(buildLadder({ length: 7, width: 0.45, y: 2.45, x: -1.05, z0: 1.6, bundles: [{ offset: 0.1, color: 0x1d6fd6, count: 20 }, { offset: -0.08, color: 0xb9c2c9, count: 12 }] }))
      scene.add(buildFiberDuct({ length: 7, y: 2.3, x: 0.72, z0: 1.6 }))
      scene.add(buildFiberDuct({ length: 7, y: 2.3, x: -0.72, z0: 1.6 }))
      // soportes de escalerilla
      for (let z = 1.2; z > -5; z -= 1.5) for (const x of [1.05, -1.05]) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.85), M.galv); rod.position.set(x + 0.25, 2.88, z); scene.add(rod)
        const rod2 = rod.clone(); rod2.position.x = x - 0.25; scene.add(rod2)
      }
      for (let i = 0; i < 5; i++) {
        drops(scene, { x: 0.82, z: 1.2 - i * 0.6, yTop: 2.45, yBottom: 2.0, color: 0x1d6fd6, count: 7 })
        drops(scene, { x: -0.82, z: 1.2 - i * 0.6, yTop: 2.45, yBottom: 2.0, color: 0x1d6fd6, count: 5 })
      }
      // iluminación
      ledStrip(scene, { x: 0, z0: 2.0, len: 2.4, y: 3.2 })
      ledStrip(scene, { x: 0, z0: -1.0, len: 2.4, y: 3.2 })
      ledStrip(scene, { x: 0, z0: -4.0, len: 2.4, y: 3.2 })
      scene.add(new THREE.HemisphereLight(0xdbe9f7, 0x1a2633, 0.35))
      shadowSpot(scene, new THREE.Vector3(-0.3, 3.1, 2.2), new THREE.Vector3(0.6, 0.8, 0.2), 26, 0.85)
      shadowSpot(scene, new THREE.Vector3(-0.2, 3.1, -1.4), new THREE.Vector3(0.6, 0.8, -3), 20, 0.9)
      // luz fría de fondo
      const back = new THREE.PointLight(0x5aa9e6, 6, 9, 2); back.position.set(0, 2.2, -7.5); scene.add(back)

      camera.position.set(-0.32, 1.52, 2.75)
      camera.lookAt(0.55, 1.18, -2.6)
      return { anchors }
    },
  },

  // ---------- Rack de red en primer plano ----------
  rack: {
    fov: 34,
    exposure: 1.0,
    envIntensity: 0.35,
    bloom: 0.2,
    build(scene, camera) {
      scene.background = new THREE.Color(0x0b1622)
      scene.fog = new THREE.Fog(0x0e1a27, 4, 10)
      room(scene, { w: 6, d: 10, h: 3.2, z0: 3, wallColor: 0xcfd7de })
      const anchors = {}
      for (let i = 0; i < 6; i++) {
        const r = buildRack({ layout: i === 1 ? NETWORK_LAYOUT : (i % 2 ? SERVER_LAYOUT : NETWORK_LAYOUT), seed: 70 + i, cords: i < 4, cordColors: [0x1d6fd6, 0x1d6fd6, 0xb9c2c9] })
        r.rotation.y = Math.PI; r.position.set(0.6, 0, 1.2 - i * 0.6); scene.add(r)
        if (i === 1) {
          for (const [k, v] of Object.entries(r.userData.anchors)) anchors[k] = r.localToWorld(v.clone().add(new THREE.Vector3(0.03, 0, 0)))
        }
      }
      for (let i = 0; i < 6; i++) { const r = buildRack({ layout: SERVER_LAYOUT, seed: 90 + i, cords: false }); r.position.set(-0.6, 0, 1.2 - i * 0.6); scene.add(r) }
      scene.add(buildLadder({ length: 5, width: 0.45, y: 2.45, x: 1.05, z0: 1.6, bundles: [{ offset: -0.12, color: 0x1d6fd6, count: 22 }, { offset: 0.06, color: 0x9aa3a9, count: 14 }] }))
      scene.add(buildFiberDuct({ length: 5, y: 2.32, x: 0.72, z0: 1.6 }))
      for (let i = 0; i < 4; i++) drops(scene, { x: 0.82, z: 1.2 - i * 0.6, yTop: 2.45, yBottom: 2.0, color: 0x1d6fd6, count: 7 })
      ledStrip(scene, { x: 0, z0: 2.4, len: 2.4, y: 3.15 })
      ledStrip(scene, { x: 0, z0: -0.6, len: 2.4, y: 3.15 })
      scene.add(new THREE.HemisphereLight(0xdbe9f7, 0x1a2633, 0.4))
      shadowSpot(scene, new THREE.Vector3(-0.5, 2.9, 1.6), new THREE.Vector3(0.6, 1.1, 0.5), 30, 0.7)
      camera.position.set(-0.05, 1.38, 1.55)
      camera.lookAt(0.62, 1.42, 0.38)
      return { anchors }
    },
  },

  // ---------- Charola de empalme de fibra ----------
  fiber: {
    fov: 30,
    exposure: 0.82,
    envIntensity: 0.22,
    bloom: 0.15,
    ao: true,
    aoRadius: 0.03,
    build(scene, camera) {
      scene.background = new THREE.Color(0x0b1622)
      const table = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshStandardMaterial({ color: 0x1b2836, roughness: 0.6, metalness: 0.1 }))
      table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table)
      // gabinete de fibra: bandeja abierta
      const trayMat = new THREE.MeshStandardMaterial({ color: 0x5d6770, roughness: 0.45, metalness: 0.55 })
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.01, 0.3), trayMat); tray.position.set(0, 0.005, 0); tray.receiveShadow = true; tray.castShadow = true; scene.add(tray)
      const wallT = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), trayMat); m.position.set(x, 0.0175, z); m.castShadow = true; m.receiveShadow = true; scene.add(m) }
      wallT(0.44, 0.006, 0, 0.147); wallT(0.44, 0.006, 0, -0.147); wallT(0.006, 0.3, -0.217, 0)
      // frente con adaptadores LC
      const front = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.045, 0.3), new THREE.MeshStandardMaterial({ color: 0x23282d, roughness: 0.5, metalness: 0.4 }))
      front.position.set(0.224, 0.0225, 0); scene.add(front)
      const adapterMat = new THREE.MeshStandardMaterial({ color: 0x14b3c4, roughness: 0.4 })
      const adapters = []
      for (let i = 0; i < 12; i++) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, 0.018), adapterMat); const z = -0.12 + i * 0.022; a.position.set(0.229, 0.024, z); scene.add(a); adapters.push(z) }
      // colores TIA-598
      const COLORS = [0x1f5fd1, 0xf07a1a, 0x22a04b, 0x7a4a26, 0x8a9399, 0xf2f2f2, 0xd8262f, 0x141414, 0xf2d21b, 0x7b3fb0, 0xf2a6b8, 0x1fc8c8]
      // soporte de empalmes
      const holder = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.008, 0.07), new THREE.MeshStandardMaterial({ color: 0x2b3238, roughness: 0.7 }))
      holder.position.set(0.0, 0.014, 0.0); scene.add(holder)
      const sleeveMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transmission: 0.6, thickness: 0.002, transparent: true, opacity: 0.85 })
      for (let i = 0; i < 12; i++) {
        const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.06, 10), sleeveMat)
        sl.rotation.z = Math.PI / 2; sl.position.set(0, 0.021, -0.03 + i * 0.0055); scene.add(sl)
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.04, 6), M.steel); rod.rotation.z = Math.PI / 2; rod.position.copy(sl.position); scene.add(rod)
      }
      // fibras: lazo de reserva + entrada al empalme + pigtail al adaptador
      COLORS.forEach((c, i) => {
        const mat = cableMat(c, 0.35)
        const zi = -0.03 + i * 0.0055
        const loopR = 0.085 + i * 0.0016
        const pts = []
        // desde el empalme hacia la izquierda, rodea el lazo y vuelve
        pts.push(new THREE.Vector3(-0.03, 0.021, zi))
        for (let k = 0; k <= 26; k++) {
          const a = Math.PI * 0.5 + (k / 26) * Math.PI * 1.9
          pts.push(new THREE.Vector3(-0.07 + Math.cos(a) * loopR * 1.15, 0.016 + (k % 5) * 0.0004, Math.sin(a) * loopR * 0.95))
        }
        pts.push(new THREE.Vector3(-0.16, 0.016, -0.118 + i * 0.0012), new THREE.Vector3(-0.205, 0.012, -0.11))
        const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 160, 0.0011, 8)
        const m = new THREE.Mesh(geo, mat); m.castShadow = true; scene.add(m)
        // pigtail: empalme -> adaptador
        const p2 = [new THREE.Vector3(0.03, 0.021, zi), new THREE.Vector3(0.08, 0.019, zi * 1.4), new THREE.Vector3(0.15, 0.02, adapters[i] * 0.9), new THREE.Vector3(0.214, 0.024, adapters[i])]
        const m2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p2), 60, 0.0012, 8), mat); m2.castShadow = true; scene.add(m2)
      })
      // tubo holgado de entrada (cable negro)
      const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x0f1113, roughness: 0.5 }))
      jacket.rotation.z = Math.PI / 2; jacket.position.set(-0.33, 0.012, -0.11); scene.add(jacket)
      // luz
      scene.add(new THREE.HemisphereLight(0xe3eef8, 0x0d1620, 0.25))
      const key = shadowSpot(scene, new THREE.Vector3(0.3, 0.6, 0.25), new THREE.Vector3(0, 0, 0), 3.2, 0.5)
      key.shadow.radius = 6
      const rim = new THREE.PointLight(0x3a9be0, 1.2, 2, 2); rim.position.set(-0.4, 0.2, -0.4); scene.add(rim)
      camera.position.set(0.2, 0.24, 0.22)
      camera.lookAt(0.0, 0.0, -0.01)
      return { anchors: { splice: new THREE.Vector3(0, 0.022, 0.03), adapters: new THREE.Vector3(0.229, 0.03, 0.1), loop: new THREE.Vector3(-0.16, 0.02, 0.0) } }
    },
  },

  // ---------- CEDIS con cámara ----------
  cctv: {
    fov: 40,
    exposure: 0.78,
    envIntensity: 0.25,
    bloom: 0.25,
    aoRadius: 0.4,
    build(scene, camera) {
      scene.background = new THREE.Color(0x15212d)
      scene.fog = new THREE.Fog(0x1a2735, 12, 42)
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 60), new THREE.MeshStandardMaterial({ color: 0x6c7379, roughness: 0.38, metalness: 0.05 }))
      floor.rotation.x = -Math.PI / 2; floor.position.z = -20; floor.receiveShadow = true; scene.add(floor)
      // líneas de piso
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xe8c21a, roughness: 0.6 })
      for (const x of [-1.6, 1.6]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 50), lineMat); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.003, -20); scene.add(l) }
      // racks de almacenaje (selectivo)
      const upr = new THREE.MeshStandardMaterial({ color: 0x1f4f8a, roughness: 0.5, metalness: 0.4 })
      const beam = new THREE.MeshStandardMaterial({ color: 0xc4651c, roughness: 0.5, metalness: 0.3 })
      const boxMat = [0x8f6a45, 0x9c7650, 0x80603e, 0xa88a65].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }))
      const wrap = new THREE.MeshStandardMaterial({ color: 0xaab4bb, roughness: 0.3 })
      const rnd = mulberry(5)
      for (const side of [-1, 1]) {
        for (let bay = 0; bay < 14; bay++) {
          const z = 2 - bay * 2.8
          const x = side * 2.6
          for (const dz of [0, 2.7]) for (const dx of [-0.55, 0.55]) {
            const u = new THREE.Mesh(new THREE.BoxGeometry(0.08, 8, 0.08), upr); u.position.set(x + dx, 4, z - dz); u.castShadow = true; scene.add(u)
          }
          for (let lv = 0; lv < 4; lv++) {
            const y = 0.15 + lv * 1.9
            for (const dx of [-0.55, 0.55]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.13, 2.7), beam); b.position.set(x + dx, y + 0.06, z - 1.35); b.castShadow = true; scene.add(b) }
            for (let pz = 0; pz < 2; pz++) {
              if (rnd() < 0.12) continue
              const hgt = 1.0 + rnd() * 0.5
              const bx = new THREE.Mesh(new THREE.BoxGeometry(1.0, hgt, 1.15), rnd() < 0.3 ? wrap : boxMat[Math.floor(rnd() * 4)])
              bx.position.set(x, y + 0.13 + hgt / 2, z - 0.7 - pz * 1.3); bx.castShadow = true; bx.receiveShadow = true; scene.add(bx)
            }
          }
        }
      }
      // techo y luminarias high bay
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(40, 60), new THREE.MeshStandardMaterial({ color: 0x2a3540, roughness: 0.9 })); roof.rotation.x = Math.PI / 2; roof.position.set(0, 11, -20); scene.add(roof)
      for (let z = 1; z > -38; z -= 6) {
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.12, 24), M.ledPanel); lamp.position.set(0, 9.5, z); scene.add(lamp)
        const pl = new THREE.PointLight(0xf2f6ff, 22, 22, 1.6); pl.position.set(0, 9.2, z); scene.add(pl)
      }
      // columna y cámara bullet en primer plano
      const colMat = new THREE.MeshStandardMaterial({ color: 0xa8b0b6, roughness: 0.55, metalness: 0.5 })
      const col = new THREE.Group()
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.02, 9, 0.28), colMat)
      const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 9, 0.02), colMat); f1.position.z = 0.14
      const f2 = f1.clone(); f2.position.z = -0.14
      col.add(web, f1, f2); col.position.set(-1.05, 4.5, 0.6); col.traverse((m) => (m.castShadow = true)); scene.add(col)
      // caja de registro + tubo conduit
      const jb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), new THREE.MeshStandardMaterial({ color: 0x9aa3a9, roughness: 0.5, metalness: 0.4 })); jb.position.set(-0.9, 4.05, 0.6); jb.castShadow = true; scene.add(jb)
      const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 4.5), M.galv); cond.position.set(-0.9, 6.4, 0.66); scene.add(cond)
      // soporte y cámara
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.05), new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.4 })); arm.position.set(-0.78, 4.2, 0.6); scene.add(arm)
      const cam = new THREE.Group()
      const camWhite = new THREE.MeshStandardMaterial({ color: 0xb4bcc3, roughness: 0.4, metalness: 0.15 })
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.26, 32), camWhite); body.rotation.x = Math.PI / 2
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.32), camWhite); shield.position.set(0, 0.066, 0.02)
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.01, 32), new THREE.MeshPhysicalMaterial({ color: 0x05080b, roughness: 0.05, metalness: 0.3, clearcoat: 1 })); face.rotation.x = Math.PI / 2; face.position.z = 0.131
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 32), new THREE.MeshPhysicalMaterial({ color: 0x1a2a3c, roughness: 0.02, metalness: 0.9 })); lens.position.z = 0.137
      const irs = new THREE.Mesh(new THREE.RingGeometry(0.026, 0.044, 32), new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.25, metalness: 0.4 })); irs.position.z = 0.1365
      cam.add(body, shield, face, lens, irs)
      cam.traverse((m) => (m.castShadow = true))
      cam.position.set(-0.62, 4.12, 0.62)
      cam.rotation.set(0.25, 2.45, 0, 'YXZ')
      scene.add(cam)
      // domo en techo a lo lejos
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x0b0f14, roughness: 0.05, metalness: 0.4 }))
      dome.rotation.x = Math.PI; dome.position.set(0.4, 7.4, -9); scene.add(dome)
      const dbase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 24), camWhite); dbase.position.set(0.4, 7.43, -9); scene.add(dbase)
      scene.add(new THREE.HemisphereLight(0xdbe7f3, 0x2a2f33, 0.35))
      shadowSpot(scene, new THREE.Vector3(1.2, 6.5, 2.6), new THREE.Vector3(-0.6, 4.0, 0.6), 30, 0.35)
      camera.position.set(-0.2, 4.3, 1.75)
      camera.lookAt(-0.7, 3.6, -3)
      return { anchors: { camera: new THREE.Vector3(-0.62, 4.12, 0.7), dome: new THREE.Vector3(0.4, 7.3, -9), aisle: new THREE.Vector3(0, 0.5, -10) } }
    },
  },

  // ---------- Oficina: access point en plafón ----------
  wifi: {
    fov: 44,
    exposure: 0.62,
    envIntensity: 0.3,
    bloom: 0.25,
    aoRadius: 0.3,
    build(scene, camera) {
      scene.background = new THREE.Color(0x9fb2c2)
      const W = 12, D = 16, H = 2.9
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0x6f7880, roughness: 0.8 }))
      floor.rotation.x = -Math.PI / 2; floor.position.z = -D / 2 + 3; floor.receiveShadow = true; scene.add(floor)
      // plafón reticular
      const tileTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#f4f6f7'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 1400; i++) { g.fillStyle = 'rgba(120,130,140,0.18)'; g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5) } g.fillStyle = '#c3cad0'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 0, 6, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 0.61, D / 0.61); return t })()
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.95 }))
      ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, -D / 2 + 3); scene.add(ceil)
      // paneles LED
      for (let x = -3.66; x <= 3.7; x += 2.44) for (let z = 1.8; z > -11; z -= 2.44) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), M.ledPanel); p.rotation.x = Math.PI / 2; p.position.set(x, H - 0.002, z); scene.add(p)
        const rl = new THREE.RectAreaLight(0xf4f8ff, 2.2, 0.58, 0.58); rl.position.set(x, H - 0.01, z); rl.lookAt(x, 0, z); scene.add(rl)
      }
      // muros y cristal
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xeef1f3, roughness: 0.9 })
      const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat); back.position.set(0, H / 2, -D + 3); scene.add(back)
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(D, H), new THREE.MeshPhysicalMaterial({ color: 0xbfd6e6, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }))
      glass.rotation.y = -Math.PI / 2; glass.position.set(W / 2 - 1, H / 2, -D / 2 + 3); scene.add(glass)
      const lw = new THREE.Mesh(new THREE.PlaneGeometry(D, H), new THREE.MeshStandardMaterial({ color: 0x123c65, roughness: 0.85 })); lw.rotation.y = Math.PI / 2; lw.position.set(-W / 2 + 1, H / 2, -D / 2 + 3); scene.add(lw)
      // escritorios
      const desk = new THREE.MeshStandardMaterial({ color: 0xe9ecee, roughness: 0.6 })
      const leg = new THREE.MeshStandardMaterial({ color: 0x2b3238, roughness: 0.5, metalness: 0.5 })
      const scr = new THREE.MeshStandardMaterial({ color: 0x0b0f13, roughness: 0.3, emissive: 0x16304a, emissiveIntensity: 0.6 })
      for (let row = 0; row < 4; row++) for (let k = 0; k < 3; k++) {
        const x = -2.4 + k * 2.2, z = -1.5 - row * 2.6
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 1.5), desk); top.position.set(x, 0.74, z); top.castShadow = true; top.receiveShadow = true; scene.add(top)
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 1.3), leg); l.position.set(x - 0.75, 0.37, z); scene.add(l); const l2 = l.clone(); l2.position.x = x + 0.75; scene.add(l2)
        for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.33, 0.02), scr); m.position.set(x - 0.4, 1.0, z + s * 0.35); m.castShadow = true; scene.add(m); const m2 = m.clone(); m2.position.x = x + 0.4; scene.add(m2) }
      }
      // access point
      const apMat = new THREE.MeshPhysicalMaterial({ color: 0xf7f8f9, roughness: 0.35, clearcoat: 0.6 })
      const ap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), apMat)
      ap.position.set(0.25, H - 0.02, -1.0); ap.castShadow = true; scene.add(ap)
      const apEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.115, 0.012, 48), apMat); apEdge.position.set(0.25, H - 0.046, -1.0); scene.add(apEdge)
      const led = new THREE.Mesh(new THREE.CircleGeometry(0.008, 20), new THREE.MeshStandardMaterial({ color: 0x26a5dc, emissive: 0x26a5dc, emissiveIntensity: 4 })); led.rotation.x = Math.PI / 2; led.position.set(0.25, H - 0.053, -0.94); scene.add(led)
      const ap2 = ap.clone(); ap2.position.set(-1.6, H - 0.02, -6.5); scene.add(ap2)
      scene.add(new THREE.HemisphereLight(0xf4f8fb, 0x8a949c, 0.7))
      const sun = new THREE.DirectionalLight(0xfff4e6, 0.9); sun.position.set(8, 6, 2); sun.target.position.set(0, 0, -5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -8; sun.shadow.camera.right = 8; sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8; scene.add(sun, sun.target)
      camera.position.set(-0.2, 1.85, 0.2)
      camera.lookAt(0.2, 2.45, -2.6)
      return { anchors: { ap: new THREE.Vector3(0.25, H - 0.06, -1.0), ap2: new THREE.Vector3(-1.6, H - 0.06, -6.5) } }
    },
  },

  // ---------- Control de acceso: puerta con lector ----------
  access: {
    fov: 38,
    exposure: 0.7,
    envIntensity: 0.25,
    bloom: 0.3,
    aoRadius: 0.2,
    build(scene, camera) {
      scene.background = new THREE.Color(0x0e1a27)
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x4b545c, roughness: 0.25, metalness: 0.1 }))
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xb9c3cb, roughness: 0.85 })
      const wallL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3, 0.15), wallMat); wallL.position.set(-1.6, 1.5, 0); wallL.receiveShadow = true; scene.add(wallL)
      const wallR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 0.15), new THREE.MeshStandardMaterial({ color: 0x123c65, roughness: 0.8 })); wallR.position.set(1.85, 1.5, 0); wallR.receiveShadow = true; scene.add(wallR)
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.15), wallMat); head.position.set(0.1, 2.7, 0); scene.add(head)
      // marco de aluminio y puerta de cristal
      const alu = new THREE.MeshStandardMaterial({ color: 0x2a2f34, roughness: 0.35, metalness: 0.7 })
      const frame = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.17), alu); m.position.set(x, y, 0); m.castShadow = true; scene.add(m) }
      frame(0.05, 2.4, -0.425, 1.2); frame(0.05, 2.4, 0.625, 1.2); frame(1.1, 0.05, 0.1, 2.375)
      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.98, 2.3, 0.012), new THREE.MeshPhysicalMaterial({ color: 0x9cc0d8, roughness: 0.04, metalness: 0.1, transmission: 0.85, thickness: 0.01, transparent: true, opacity: 0.6 }))
      doorGlass.position.set(0.1, 1.17, 0); scene.add(doorGlass)
      frame(0.98, 0.06, 0.1, 0.05)
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 16), M.steel); handle.position.set(0.5, 1.15, 0.07); scene.add(handle)
      // electroimán
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.045, 0.07), new THREE.MeshStandardMaterial({ color: 0xc9d0d6, roughness: 0.35, metalness: 0.7 })); mag.position.set(0.42, 2.32, 0.1); mag.castShadow = true; scene.add(mag)
      // lector en muro izquierdo
      const reader = new THREE.Group()
      const rb = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.15, 0.02), new THREE.MeshPhysicalMaterial({ color: 0x0c0f12, roughness: 0.15, clearcoat: 1 }))
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0022, 12, 48), new THREE.MeshStandardMaterial({ color: 0x26a5dc, emissive: 0x26a5dc, emissiveIntensity: 3 })); ring.position.set(0, 0.025, 0.0105)
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.04), new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.3 })); pad.position.set(0, -0.035, 0.0102)
      reader.add(rb, ring, pad); reader.position.set(-0.68, 1.15, 0.086); reader.traverse((m) => (m.castShadow = true)); scene.add(reader)
      // botón de salida (otro lado, oculto) y sensor
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: 0.4 })); plate.position.set(-0.68, 1.42, 0.08); scene.add(plate)
      // luz
      scene.add(new THREE.HemisphereLight(0xe9f1f8, 0x2a3138, 0.3))
      shadowSpot(scene, new THREE.Vector3(-1.6, 2.9, 1.2), new THREE.Vector3(-0.5, 1.1, 0), 14, 0.5)
      const inside = new THREE.PointLight(0x7fc4ec, 4, 6, 2); inside.position.set(0.2, 1.8, -1.5); scene.add(inside)
      // interior detrás del vidrio
      const inner = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshStandardMaterial({ color: 0x0d2742, roughness: 0.9 })); inner.position.set(0, 1.5, -3); scene.add(inner)
      camera.position.set(-1.25, 1.32, 0.95)
      camera.lookAt(-0.35, 1.25, -0.05)
      return { anchors: { reader: new THREE.Vector3(-0.68, 1.15, 0.1), lock: new THREE.Vector3(0.42, 2.32, 0.14) } }
    },
  },

  // ---------- Nave industrial con charola y gabinete ----------
  nave: {
    fov: 46,
    exposure: 0.66,
    envIntensity: 0.25,
    bloom: 0.25,
    aoRadius: 0.5,
    build(scene, camera) {
      scene.background = new THREE.Color(0x1a2735)
      scene.fog = new THREE.Fog(0x22303f, 14, 45)
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), new THREE.MeshStandardMaterial({ color: 0x8a9095, roughness: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -25; floor.receiveShadow = true; scene.add(floor)
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), new THREE.MeshStandardMaterial({ color: 0x9aa4ac, roughness: 0.85 })); wall.rotation.y = Math.PI / 2; wall.position.set(-6, 6, -25); wall.receiveShadow = true; scene.add(wall)
      // paneles de muro
      for (let z = 2; z > -50; z -= 1.2) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.02, 12, 0.04), new THREE.MeshStandardMaterial({ color: 0xaeb6bc, roughness: 0.7 })); r.position.set(-5.99, 6, z); scene.add(r) }
      // columnas y armaduras
      const steel = new THREE.MeshStandardMaterial({ color: 0x1f4f8a, roughness: 0.5, metalness: 0.4 })
      for (let z = 1; z > -50; z -= 7) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 9, 0.35), steel); c.position.set(-5.6, 4.5, z); c.castShadow = true; scene.add(c)
        const truss = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 0.15), steel); truss.position.set(1, 9.2, z); scene.add(truss)
        const c2 = c.clone(); c2.position.x = 7.6; scene.add(c2)
      }
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), new THREE.MeshStandardMaterial({ color: 0x3a4652, roughness: 0.8 })); roof.rotation.x = Math.PI / 2; roof.position.set(0, 9.6, -25); scene.add(roof)
      for (let z = -2; z > -50; z -= 7) for (const x of [-1, 4]) { const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.12, 24), M.ledPanel); lamp.position.set(x, 8.6, z); scene.add(lamp); const pl = new THREE.PointLight(0xf2f6ff, 18, 20, 1.6); pl.position.set(x, 8.3, z); scene.add(pl) }
      // charola tipo malla a lo largo del muro
      const tray = new THREE.Group()
      const wire = M.galv
      const L = 50
      for (const y of [0, 0.06]) for (const x of [0, 0.3]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, L), wire); r.rotation.x = Math.PI / 2; r.position.set(x, y, -L / 2); tray.add(r) }
      for (let z = 0; z < L; z += 0.1) { const u = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.003, 4, 12, Math.PI), wire); u.rotation.set(0, 0, Math.PI); u.scale.set(1, 0.4, 1); u.position.set(0.15, 0.06, -z); tray.add(u) }
      const rnd = mulberry(12)
      const cm = [cableMat(0x1d6fd6), cableMat(0x1d6fd6), cableMat(0xd9a714), cableMat(0x9aa3a9)]
      for (let i = 0; i < 26; i++) { const x = 0.04 + rnd() * 0.22, y = 0.012 + rnd() * 0.04; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, L, 6), cm[i % 4]); r.rotation.x = Math.PI / 2; r.position.set(x, y, -L / 2); tray.add(r) }
      tray.position.set(-5.85, 5.2, 2); tray.traverse((m) => (m.castShadow = true)); scene.add(tray)
      // soportes
      for (let z = 1.5; z > -48; z -= 1.5) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.03), M.galv); b.position.set(-5.78, 5.19, z); scene.add(b) }
      // gabinete de pared
      const cab = new THREE.Group()
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.6), M.rackPaint); cab.add(body)
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.6, 0.55), new THREE.MeshPhysicalMaterial({ color: 0x12181e, roughness: 0.1, transparent: true, opacity: 0.45 })); door.position.x = 0.26; cab.add(door)
      cab.position.set(-5.65, 2.1, -1.2)
      scene.add(cab)
      const ppm = new THREE.MeshStandardMaterial({ map: patchPanelTex(24), roughness: 0.6 })
      const swt = switchTex(48, 4, 33)
      const swm = new THREE.MeshStandardMaterial({ map: swt.map, emissiveMap: swt.emissive, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: 0.5 })
      const fom = new THREE.MeshStandardMaterial({ map: fiberPanelTex(), roughness: 0.5 })
      ;[[fom, 0.2], [ppm, 0.12], [swm, 0.06], [ppm, -0.04], [swm, -0.1]].forEach(([m, dy]) => {
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.4826, 0.044), m)
        face.rotation.y = Math.PI / 2; face.position.set(-5.395, 2.1 + dy, -1.2); scene.add(face)
      })
      // tubo desde charola
      const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8), M.galv); cond.position.set(-5.75, 3.8, -1.2); scene.add(cond)
      // AP industrial en columna
      const apb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.2), new THREE.MeshStandardMaterial({ color: 0xeef1f3, roughness: 0.4 })); apb.position.set(-5.38, 4.6, -6); scene.add(apb)
      for (const dz of [-0.06, 0.06]) { const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18), new THREE.MeshStandardMaterial({ color: 0xeef1f3 })); ant.position.set(-5.33, 4.85, -6 + dz); scene.add(ant) }
      scene.add(new THREE.HemisphereLight(0xdce8f2, 0x3a4249, 0.55))
      shadowSpot(scene, new THREE.Vector3(-1, 8.5, 4), new THREE.Vector3(-5.5, 3, -2), 90, 0.55)
      camera.position.set(-3.3, 2.5, 1.6)
      camera.lookAt(-5.0, 3.0, -3.5)
      return { anchors: { tray: new THREE.Vector3(-5.7, 5.25, -3), cabinet: new THREE.Vector3(-5.38, 2.1, -1.2), ap: new THREE.Vector3(-5.38, 4.6, -6) } }
    },
  },

  aisleWide: {
    fov: 50, exposure: 0.95, envIntensity: 0.3, bloom: 0.22,
    build(scene, camera) { const r = SCENES.aisle.build(scene, camera); camera.position.set(0.0, 1.7, 2.9); camera.lookAt(0.0, 1.45, -4); return r },
  },
  rackSide: {
    fov: 30, exposure: 1.0, envIntensity: 0.35, bloom: 0.2,
    build(scene, camera) { const r = SCENES.rack.build(scene, camera); camera.position.set(-0.15, 1.0, 0.25); camera.lookAt(0.62, 1.3, 1.1); return r },
  },
}
