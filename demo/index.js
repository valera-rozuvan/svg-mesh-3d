/*
  This is a more advanced ES6 example, animating and
  rendering the triangles with ThreeJS.

  To test:
    npm install
    npm run start
 */

import THREE from 'three'
import createLoop from 'canvas-loop'
import loadSvg from 'load-svg'
import Tweenr from 'tweenr'
import { parse as getSvgPaths } from 'extract-svg-path'
import randomVec3 from 'gl-vec3/random'
import triangleCentroid from 'triangle-centroid'
import reindex from 'mesh-reindex'
import unindex from 'unindex-mesh'

import svgMesh3d from '../'

const createGeom = require('three-simplicial-complex')(THREE)
const fs = require('fs')

const tweenr = Tweenr({ defaultEase: 'expoOut' })

const vertShader = fs.readFileSync(__dirname + '/vert.glsl', 'utf8')
const fragShader = fs.readFileSync(__dirname + '/frag.glsl', 'utf8')

let files = [
  '01.svg',
  '02.svg',
  '03.svg',
  '04.svg',
  '05.svg',
  '06.svg',
  '07.svg'
]

document.querySelector('.count').innerText = files.length

const canvas = document.querySelector('canvas')
canvas.addEventListener('touchstart', (ev) => ev.preventDefault())
canvas.addEventListener('contextmenu', (ev) => ev.preventDefault())

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  devicePixelRatio: window.devicePixelRatio
})
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
camera.position.set(0, 0, 5)

let pointer = 0
let horiz_disp = -4
let current_letter = 0
let max_num_letters = 7
createApp()
nextSvgMesh()

function nextSvgMesh (delay) {
  delay = delay || 0

  var file = files[pointer++ % files.length]
  loadSvg('demo/svg/valera/' + file, (err, svg) => {
    if (err) throw err
    renderSVG(svg, delay, file)
  })
}

function renderSVG (svg, delay, file) {
  if (current_letter >= max_num_letters) return
  current_letter += 1

  delay = delay || 0

  // const wireframe = pointer % 2 === 0
  const wireframe = 0

  // grab all <path> data
  const svgPath = getSvgPaths(svg)
  // const svgPath = serialize(scale(parse(svgPath_), 150))

  // triangulate
  let complex = svgMesh3d(svgPath, {
    scale: 50,
    simplify: 0.01
    // play with this value for different aesthetic
    // randomization: 50
  })

  // split mesh into separate triangles so no vertices are shared
  complex = reindex(unindex(complex.positions, complex.cells))

  // we will animate the triangles in the vertex shader
  const attributes = getAnimationAttributes(complex.positions, complex.cells)

  // build a ThreeJS geometry from the mesh primitive
  const geometry = new createGeom(complex)

  // our shader material
  const material = new THREE.ShaderMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    vertexShader: vertShader,
    fragmentShader: fragShader,
    wireframe: wireframe,
    transparent: true,
    attributes: attributes,
    uniforms: {
      opacity: { type: 'f', value: 1 },
      scale: { type: 'f', value: 0 },
      animate: { type: 'f', value: 0 }
    }
  })
  const mesh = new THREE.Mesh(geometry, material)

  if (file == '01.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.scale.set(0.4, 0.4, 1.0)
    horiz_disp = horiz_disp + 0.5
  } else if (file == '02.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.2)
    mesh.scale.set(0.2, 0.2, 1.0)
    horiz_disp = horiz_disp + 0.7
  } else if (file == '03.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.1)
    mesh.scale.set(0.7, 0.7, 1.0)
    horiz_disp = horiz_disp + 0.25
  } else if (file == '04.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.2)
    mesh.scale.set(0.2, 0.2, 1.0)
    horiz_disp = horiz_disp + 0.5
  } else if (file == '05.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.18)
    mesh.scale.set(0.15, 0.15, 1.0)
    horiz_disp = horiz_disp + 0.47
  } else if (file == '06.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.18)
    mesh.scale.set(0.25, 0.25, 1.0)
    horiz_disp = horiz_disp + 1.2
  } else if (file == '07.svg') {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), 0)
    mesh.scale.set(0.7, 0.7, 1.0)
    horiz_disp = horiz_disp + 0.2
  } else {
    mesh.translateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), horiz_disp)
    mesh.scale.set(0.2, 0.2, 1.0)
    horiz_disp = horiz_disp + 0.4
  }

  scene.add(mesh)
  const interval = 2 + delay

  // explode in
  tweenr.to(material.uniforms.animate, {
    value: 1.0, duration: 2, delay: delay, ease: 'expoInOut'
  })
  tweenr.to(material.uniforms.scale, {
    value: 1.0, duration: 2, delay: delay
  })

  /*
  // explode out
  tweenr.to(material.uniforms.scale, {
    delay: interval, value: 0, duration: 0.75, ease: 'expoIn'
  })
  tweenr.to(material.uniforms.animate, {
    duration: 0.75, value: 0, delay: interval
  }).on('complete', () => {
    geometry.dispose()
    geometry.vertices.length = 0
    scene.remove(mesh)
    nextSvgMesh()
  })
  */
  window.setTimeout(() => {
    nextSvgMesh()
  }, 300);
}

function getAnimationAttributes (positions, cells) {
  const directions = []
  const centroids = []
  for (let i=0; i<cells.length; i++) {
    const [ f0, f1, f2 ] = cells[i]
    const triangle = [ positions[f0], positions[f1], positions[f2] ]
    const center = triangleCentroid(triangle)
    const dir = new THREE.Vector3().fromArray(center)
    centroids.push(dir, dir, dir)

    const random = randomVec3([], Math.random())
    const anim = new THREE.Vector3().fromArray(random)
    directions.push(anim, anim, anim)
  }
  return {
    direction: { type: 'v3', value: directions },
    centroid: { type: 'v3', value: centroids }
  }
}

function createApp () {
  const app = createLoop(canvas, { scale: renderer.devicePixelRatio })
    .start()
    .on('tick', render)
    .on('resize', resize)

  function resize () {
    var [ width, height ] = app.shape
    camera.aspect = width / height
    renderer.setSize(width, height, false)
    camera.updateProjectionMatrix()
    render()
  }

  function render () {
    renderer.render(scene, camera)
  }

  resize()
}
