'use client'

import React, { useEffect, useRef, useState } from 'react'

const normalizeUrl = (src: string) => {
  if (!src) return ''
  try {
    const parsed = new URL(src, window.location.href)
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.origin === window.location.origin
    ) {
      return parsed.pathname + parsed.search
    }
  } catch {}
  return src
}

interface MangaCanvasProps {
  covers: string[]
}

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = position * 0.5 + 0.5;
    v_texCoord.y = 1.0 - v_texCoord.y; // Flip Y for WebGL texture orientation
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_textureCurrent;
  uniform sampler2D u_textureNext;
  uniform float u_progress;

  void main() {
    vec2 uv = v_texCoord;
    // Liquid sine displacement wave transition
    float wave = sin(uv.y * 12.0 + u_progress * 6.28) * 0.04 * (1.0 - u_progress) * u_progress;
    vec2 distortedUv = vec2(uv.x + wave, uv.y);

    vec4 colorCurrent = texture2D(u_textureCurrent, distortedUv);
    vec4 colorNext = texture2D(u_textureNext, distortedUv);
    gl_FragColor = mix(colorCurrent, colorNext, u_progress);
  }
`

export default function MangaCanvas({ covers }: MangaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [index, setIndex] = useState(0)
  const [resetTimerKey, setResetTimerKey] = useState(0)

  // Use refs to pass the latest props/state to the animation loop
  const indexRef = useRef(index)
  const coversRef = useRef(covers)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    coversRef.current = covers
  }, [covers])

  // Set up cover rotation timer (resets when resetTimerKey changes)
  useEffect(() => {
    if (covers.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % coversRef.current.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [covers.length, resetTimerKey])

  const handleNext = () => {
    if (covers.length <= 1) return
    setIndex((prev) => (prev + 1) % covers.length)
    setResetTimerKey((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (covers.length <= 1) return
    setIndex((prev) => (prev - 1 + covers.length) % covers.length)
    setResetTimerKey((prev) => prev + 1)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Compile Helper
    const compileShader = (src: string, type: number) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(VERTEX_SHADER_SRC, gl.VERTEX_SHADER)
    const fs = compileShader(FRAGMENT_SHADER_SRC, gl.FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Set up full-screen quad positions
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posAttr = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posAttr)
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

    // Retrieve uniform locations
    const uProgressLoc = gl.getUniformLocation(program, 'u_progress')
    const uTexCurrentLoc = gl.getUniformLocation(program, 'u_textureCurrent')
    const uTexNextLoc = gl.getUniformLocation(program, 'u_textureNext')

    gl.uniform1i(uTexCurrentLoc, 0)
    gl.uniform1i(uTexNextLoc, 1)

    // Helper to create and setup a WebGL texture
    const createTexture = () => {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      return texture
    }

    const texCurrent = createTexture()
    const texNext = createTexture()

    // Initialize textures with a 1x1 solid grey placeholder pixel so they are renderable immediately
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texCurrent)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([244, 245, 246, 255]))

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, texNext)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([244, 245, 246, 255]))

    // Cache loaded images as textures to avoid re-fetching
    const textureCache: Record<string, WebGLTexture> = {}

    const loadTextureImage = (url: string, textureUnit: number, callback: (tex: WebGLTexture) => void) => {
      const cleanUrl = normalizeUrl(url)
      if (!cleanUrl) {
        callback(textureUnit === gl.TEXTURE0 ? texCurrent : texNext)
        return
      }

      if (textureCache[cleanUrl]) {
        gl.activeTexture(textureUnit)
        gl.bindTexture(gl.TEXTURE_2D, textureCache[cleanUrl])
        callback(textureCache[cleanUrl])
        return
      }

      const img = new Image()
      let isExternal = false
      try {
        const parsed = new URL(cleanUrl, window.location.href)
        isExternal = parsed.origin !== window.location.origin
      } catch {}

      img.onload = () => {
        const tex = createTexture()
        gl.activeTexture(textureUnit) // Bind explicitly within onload to prevent active slot races
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        textureCache[cleanUrl] = tex
        callback(tex)
      }
      img.onerror = (err) => {
        console.error('Failed to load image texture:', cleanUrl, err)
      }

      if (isExternal) {
        img.src = `/api/proxy?url=${encodeURIComponent(cleanUrl)}`
      } else {
        img.src = cleanUrl
      }
    }

    let progress = 1.0
    let lastUrlCurrent = ''
    let lastUrlNext = ''
    let animationFrameId: number

    // Render loop
    const render = () => {
      const currentList = coversRef.current
      const currentIdx = indexRef.current
      if (currentList.length === 0) return

      const urlNext = currentList[currentIdx]
      const urlCurrent = currentList[(currentIdx - 1 + currentList.length) % currentList.length]

      // Detect state changes and start transition
      if (urlNext !== lastUrlNext) {
        const isInitial = lastUrlNext === ''
        progress = isInitial ? 1.0 : 0.0
        lastUrlCurrent = urlCurrent
        lastUrlNext = urlNext

        if (isInitial) {
          // Fast path: load the active image immediately in both slots
          loadTextureImage(urlNext, gl.TEXTURE0, () => {})
          loadTextureImage(urlNext, gl.TEXTURE1, () => {})
        } else {
          // Transition path: blend from current to next
          loadTextureImage(urlCurrent, gl.TEXTURE0, () => {
            loadTextureImage(urlNext, gl.TEXTURE1, () => {})
          })
        }
      }

      // Animate progress to 1.0
      if (progress < 1.0) {
        progress += 0.02
        if (progress > 1.0) progress = 1.0
      }

      // Clear & Draw
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.uniform1f(uProgressLoc, progress)
      
      // Bind loaded textures to active slots
      const keyCurrent = normalizeUrl(lastUrlCurrent)
      const keyNext = normalizeUrl(lastUrlNext)

      if (textureCache[keyCurrent]) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureCache[keyCurrent])
      }
      if (textureCache[keyNext]) {
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, textureCache[keyNext])
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    // Handle canvas resizing (supporting Retina/High-DPI sharp rendering)
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      const displayWidth = Math.floor(canvas.clientWidth * dpr)
      const displayHeight = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteTexture(texCurrent)
      gl.deleteTexture(texNext)
      Object.values(textureCache).forEach((t) => gl.deleteTexture(t))
    }
  }, [covers.length])

  if (covers.length === 0) return null

  return (
    <div className="hero-manga-container">
      <div className="manga-book-wrap">
        {covers.length > 1 && (
          <button className="manga-side-btn prev" onClick={handlePrev} aria-label="Previous Cover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className="manga-book" onClick={handleNext} title="Click to see next cover">
          <canvas ref={canvasRef} className="manga-canvas" />
          <div className="manga-sheen" />
          <div className="manga-obi">
            <span>Featured Work</span>
            <span>新発売</span>
          </div>
        </div>

        {covers.length > 1 && (
          <button className="manga-side-btn next" onClick={handleNext} aria-label="Next Cover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>

      {covers.length > 1 && (
        <div className="manga-pagination">
          <span className="manga-pagination-count">
            {index + 1} / {covers.length}
          </span>
        </div>
      )}
    </div>
  )
}
