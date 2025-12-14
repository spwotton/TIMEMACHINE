# Technical Architecture

## System Overview

CHRONOS-418 is a client-side web application built with vanilla JavaScript and Three.js, implementing a hyperstition-based temporal navigation interface.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              UI Layer (HTML/CSS)                       │  │
│  │  • Control Panel (κ, protocols, emissions)            │  │
│  │  • Status Display (real-time metrics)                 │  │
│  │  • Canvas Container (Three.js render target)          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                     timemachine.js                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Application State Management                   │  │
│  │  • κ (kappa): Temporal scaling factor                 │  │
│  │  • schumannAmplitude: Resonance intensity             │  │
│  │  • autoDrift: Autonomous oscillation flag             │  │
│  │  • phononCount: Emission tracker                      │  │
│  │  • time: Animation clock                              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Three.js Scene Graph                          │  │
│  │  • Scene → Camera → Renderer                          │  │
│  │  • Torus Knot Mesh (main manifold)                    │  │
│  │  • Particle Systems (ambient + phonons)               │  │
│  │  • Demodex Mites (50 entangled spheres)              │  │
│  │  • Lights (ambient + point lights)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Web Audio API                                 │  │
│  │  • Schumann Oscillator (7.83 Hz continuous)          │  │
│  │  • Phonon Bursts (1-3 kHz transient)                 │  │
│  │  • Goose Honk (200→100 Hz sweep)                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Animation Loop                                │  │
│  │  • requestAnimationFrame (60 FPS)                     │  │
│  │  • Update physics (particles, mites)                  │  │
│  │  • Apply κ-scaling to rotation                        │  │
│  │  • Camera orbit                                       │  │
│  │  • Render scene                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│               Three.js (CDN v0.158.0)                       │
│  • WebGL Rendering                                          │
│  • Geometry Management                                      │
│  • Material System                                          │
│  • Math Utilities                                           │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Torus Knot Manifold
- **Geometry**: `TorusKnotGeometry(5, 1.5, 200, 32, 2, 3)`
- **Material**: Phong with emissive properties
- **Behavior**: 
  - Rotation speed scaled by κ parameter
  - Pulsation based on Schumann resonance
  - Color changes during Zoomie protocol

### 2. Particle Systems
- **Ambient Particles**: 1000 static background particles
- **Phonon Bursts**: Dynamic particles with:
  - 100-frame lifetime
  - Velocity-based motion
  - Opacity decay
  - Auto-cleanup on expiration

### 3. Demodex-Mite Entanglement
- **Count**: 50 spheres
- **Physics**: 
  - Mutual attraction within 5-unit radius
  - Newton's third law applied (equal/opposite forces)
  - Toroidal boundary wraparound
  - O(n²/2) optimization (only check later mites)

### 4. Audio Synthesis
```javascript
// Schumann Resonance
schumannOscillator → gainNode → destination
    7.83 Hz sine      0.01-0.02   output

// Phonon Burst
oscillator → gainNode → destination
1-3 kHz random  0.1→0.01    output
              exponential

// Goose Honk
oscillator → gainNode → destination
200→100 Hz    0.2→0.01    output
 sweep      exponential
```

### 5. State Management

#### Global State
```javascript
kappa = KAPPA_IDEAL (4/π ≈ 1.273)
schumannAmplitude = 0.5
autoDrift = false
phononCount = 0
time = 0
```

#### Temporal Scaling
```javascript
rotation_speed = base_speed * kappa
scale = 1 + sin(time * 7.83 * 0.1) * schumannAmplitude * 0.05
```

### 6. Event Handling

All controls use direct DOM event listeners:
- `input` events for sliders → update state
- `click` events for buttons → trigger protocols
- `resize` event → update camera/renderer

### 7. Animation Loop

```javascript
function animate() {
    requestAnimationFrame(animate);
    
    // 1. Update time
    time += 0.01;
    
    // 2. Auto-drift (if enabled)
    if (autoDrift) kappa = KAPPA_IDEAL + sin(time * 0.5) * 0.2;
    
    // 3. Rotate torus knot (κ-scaled)
    torusKnot.rotation.x += 0.005 * kappa;
    torusKnot.rotation.y += 0.01 * kappa;
    
    // 4. Schumann pulsation
    scale = 1 + sin(time * 7.83 * 0.1) * schumannAmplitude * 0.05;
    
    // 5. Update particles (reverse loop for safe removal)
    for (let i = particles.length - 1; i >= 0; i--) { ... }
    
    // 6. Update demodex mites (entanglement physics)
    demodexMites.forEach((mite, i) => { ... });
    
    // 7. Camera orbit
    camera.position.x = sin(time * 0.2) * 15;
    camera.position.z = cos(time * 0.2) * 15;
    
    // 8. Render
    renderer.render(scene, camera);
}
```

## Performance Optimizations

1. **Particle Cleanup**: Reverse loop prevents index shifting during splice
2. **Mite Entanglement**: O(n²/2) instead of O(n²) by checking only j > i
3. **Audio Reuse**: Single persistent Schumann oscillator
4. **Geometry Sharing**: Same geometry for all demodex mites

## Constants

```javascript
KAPPA_IDEAL = 4 / Math.PI      // ≈ 1.273239545
SCHUMANN_FREQ = 7.83            // Hz
PSI_ENFORCED = 1.0              // Ψ ≡ 1 (always)
```

## Quantum Protocols

### Zoomie Protocol
```javascript
1. Set zoomieActive flag
2. Increase rotation to 0.1/0.15 rad/frame
3. Change color to red
4. Increase emissive intensity to 0.8
5. After 3000ms: restore defaults
```

### Heal Protocol
```javascript
1. Reset κ to KAPPA_IDEAL
2. Pulse scale (sin-based) for 2 seconds
3. Temporarily change GOS status to "HEALING"
4. Restore to "ENFORCING" after 2 seconds
```

## HTTP 418 Paradox Firewall

```javascript
// Intercepts all fetch() calls
window.fetch = function(...args) {
    console.log('🫖 HTTP 418: I\'m a teapot');
    return originalFetch.apply(this, args);
};
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user gesture for audio)
- **IE**: Not supported (no ES6 modules)

## Dependencies

- **Three.js v0.158.0** (CDN): `https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js`
- **No build tools required**
- **No npm packages** (except for dev server)

## File Structure

```
/
├── index.html          # Entry point, UI structure
├── timemachine.js      # Main application logic
├── package.json        # Project metadata
├── README.md           # User documentation
├── DEMO.md             # Usage guide
├── QUICKSTART.md       # Setup instructions
├── ARCHITECTURE.md     # This file
└── .gitignore          # Git exclusions
```

## Future Enhancements

Potential additions (not in scope):
- WebXR/VR support for immersive navigation
- MIDI controller integration
- Multiplayer synchronization
- Fractal noise textures
- Post-processing effects (bloom, chromatic aberration)
- Save/load temporal states
- Mobile touch gestures

## License

MIT License - See package.json

---

**Ψ**: ≡ 1.000  
**κ**: 4/π  
**Reality**: 🐋 Drunk Cetacean Kubernetes
