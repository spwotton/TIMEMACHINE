// CHRONOS-418: κ-Scaled Temporal Navigator
// "Reality = drunk cetacean Kubernetes"

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

// Constants
const KAPPA_IDEAL = 4 / Math.PI; // κ = 4/π ≈ 1.273
const SCHUMANN_FREQ = 7.83; // Hz
const PSI_ENFORCED = 1.0; // Ψ ≡ 1

// State
let scene, camera, renderer, torusKnot;
let kappa = KAPPA_IDEAL;
let schumannAmplitude = 0.5;
let autoDrift = false;
let phononCount = 0;
let time = 0;
let particles = [];
let demodexMites = [];

// Audio Context for sounds
let audioContext;
let schumannOscillator;

// Initialize
function init() {
    // Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 10, 50);
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    
    // Setup renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create Torus Knot manifold
    createTorusKnot();
    
    // Create particle systems
    createParticles();
    createDemodexMites();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ff00, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);
    
    // Audio setup
    setupAudio();
    
    // Event listeners
    setupEventListeners();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation
    animate();
}

function createTorusKnot() {
    const geometry = new THREE.TorusKnotGeometry(5, 1.5, 200, 32, 2, 3);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        wireframe: false,
        emissive: 0x00ff00,
        emissiveIntensity: 0.2,
        shininess: 100
    });
    torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);
    
    // Add wireframe overlay
    const wireframeGeometry = new THREE.TorusKnotGeometry(5, 1.5, 200, 32, 2, 3);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    torusKnot.add(wireframe);
}

function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

function createDemodexMites() {
    // Demodex mite entanglement visualization
    for (let i = 0; i < 50; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.5
        });
        const mite = new THREE.Mesh(geometry, material);
        
        // Random position in quantum field
        mite.position.x = (Math.random() - 0.5) * 30;
        mite.position.y = (Math.random() - 0.5) * 30;
        mite.position.z = (Math.random() - 0.5) * 30;
        
        // Store velocity for entanglement
        mite.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        scene.add(mite);
        demodexMites.push(mite);
    }
}

function setupAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create Schumann resonance oscillator with gain node
    schumannOscillator = audioContext.createOscillator();
    schumannOscillator.gainNode = audioContext.createGain();
    
    schumannOscillator.type = 'sine';
    schumannOscillator.frequency.setValueAtTime(SCHUMANN_FREQ, audioContext.currentTime);
    schumannOscillator.gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
    
    schumannOscillator.connect(schumannOscillator.gainNode);
    schumannOscillator.gainNode.connect(audioContext.destination);
    schumannOscillator.start();
}

function setupEventListeners() {
    // Kappa control
    const kappaSlider = document.getElementById('kappa-slider');
    const kappaValue = document.getElementById('kappa-value');
    kappaSlider.addEventListener('input', (e) => {
        kappa = parseFloat(e.target.value);
        kappaValue.textContent = kappa.toFixed(3);
    });
    
    // Reset kappa
    document.getElementById('reset-kappa').addEventListener('click', () => {
        kappa = KAPPA_IDEAL;
        kappaSlider.value = KAPPA_IDEAL;
        kappaValue.textContent = kappa.toFixed(3);
    });
    
    // Auto drift toggle
    document.getElementById('toggle-drift').addEventListener('click', () => {
        autoDrift = !autoDrift;
        document.getElementById('drift-status').textContent = autoDrift ? 'ON' : 'OFF';
    });
    
    // Quantum protocols
    document.getElementById('zoomie-btn').addEventListener('click', activateZoomie);
    document.getElementById('heal-btn').addEventListener('click', activateHeal);
    
    // Emissions
    document.getElementById('phonon-btn').addEventListener('click', emitPhonons);
    document.getElementById('honk-btn').addEventListener('click', gooseHonk);
    
    // Schumann control
    const schumannSlider = document.getElementById('schumann-slider');
    const schumannValue = document.getElementById('schumann-value');
    schumannSlider.addEventListener('input', (e) => {
        schumannAmplitude = parseFloat(e.target.value);
        schumannValue.textContent = schumannAmplitude.toFixed(2);
        updateSchumannResonance();
    });
}

function activateZoomie() {
    // Quantum Zoomie Protocol: Increase rotation speed dramatically
    torusKnot.userData.zoomieActive = true;
    torusKnot.userData.zoomieTime = 0;
    
    // Visual feedback
    torusKnot.material.emissiveIntensity = 0.8;
    torusKnot.material.color.setHex(0xff0000);
    
    document.getElementById('waveform-status').textContent = 'ZOOMING!';
    
    setTimeout(() => {
        torusKnot.userData.zoomieActive = false;
        torusKnot.material.emissiveIntensity = 0.2;
        torusKnot.material.color.setHex(0x00ff00);
        document.getElementById('waveform-status').textContent = 'COLLAPSED';
    }, 3000);
}

function activateHeal() {
    // Quantum Heal Protocol: Restore to ideal state
    kappa = KAPPA_IDEAL;
    document.getElementById('kappa-slider').value = KAPPA_IDEAL;
    document.getElementById('kappa-value').textContent = kappa.toFixed(3);
    
    // Visual feedback
    torusKnot.material.color.setHex(0x00ff00);
    torusKnot.material.emissiveIntensity = 0.5;
    
    // Pulse effect
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
        torusKnot.scale.set(1 + Math.sin(pulseCount) * 0.1, 1 + Math.sin(pulseCount) * 0.1, 1 + Math.sin(pulseCount) * 0.1);
        pulseCount += 0.5;
        if (pulseCount > Math.PI * 4) {
            clearInterval(pulseInterval);
            torusKnot.scale.set(1, 1, 1);
            torusKnot.material.emissiveIntensity = 0.2;
        }
    }, 50);
    
    document.getElementById('gos-status').textContent = 'HEALING...';
    setTimeout(() => {
        document.getElementById('gos-status').textContent = 'ENFORCING';
    }, 2000);
}

function emitPhonons() {
    // Emit THz phonons (visualized as particle burst)
    phononCount += 100;
    document.getElementById('phonon-count').textContent = phononCount;
    
    // Create phonon burst
    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0x00ffff : 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const phonon = new THREE.Mesh(geometry, material);
        
        phonon.position.copy(torusKnot.position);
        
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        
        phonon.userData.velocity = direction.multiplyScalar(0.5);
        phonon.userData.lifetime = 100;
        
        scene.add(phonon);
        particles.push(phonon);
    }
    
    // Play high-frequency tone
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.frequency.setValueAtTime(1000 + Math.random() * 2000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

function gooseHonk() {
    // Goose honk scheduler
    document.getElementById('reality-status').textContent = '🦆 HONK! HONK! 🦆';
    
    // Play honk sound (low frequency oscillation)
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    setTimeout(() => {
        document.getElementById('reality-status').textContent = '🐋 Drunk Cetacean Kubernetes';
    }, 2000);
}

function updateSchumannResonance() {
    if (schumannOscillator && schumannOscillator.gainNode) {
        schumannOscillator.gainNode.gain.setValueAtTime(schumannAmplitude * 0.02, audioContext.currentTime);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    // Auto κ-drift
    if (autoDrift) {
        kappa = KAPPA_IDEAL + Math.sin(time * 0.5) * 0.2;
        document.getElementById('kappa-slider').value = kappa;
        document.getElementById('kappa-value').textContent = kappa.toFixed(3);
    }
    
    // Rotate torus knot based on κ
    if (torusKnot.userData.zoomieActive) {
        torusKnot.rotation.x += 0.1;
        torusKnot.rotation.y += 0.15;
        torusKnot.userData.zoomieTime += 0.1;
    } else {
        torusKnot.rotation.x += 0.005 * kappa;
        torusKnot.rotation.y += 0.01 * kappa;
    }
    
    // Pulsate based on Schumann resonance
    const schumannPulse = Math.sin(time * SCHUMANN_FREQ * 0.1) * schumannAmplitude;
    torusKnot.scale.set(
        1 + schumannPulse * 0.05,
        1 + schumannPulse * 0.05,
        1 + schumannPulse * 0.05
    );
    
    // Update particles (reverse loop to safely remove items)
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.userData && particle.userData.velocity) {
            particle.position.add(particle.userData.velocity);
            
            if (particle.userData.lifetime !== undefined) {
                particle.userData.lifetime--;
                particle.material.opacity = particle.userData.lifetime / 100;
                
                if (particle.userData.lifetime <= 0) {
                    scene.remove(particle);
                    particles.splice(i, 1);
                }
            }
        }
        
        if (particle.rotation) {
            particle.rotation.y += 0.01;
        }
    }
    
    // Update demodex mite entanglement
    demodexMites.forEach((mite, index) => {
        mite.position.add(mite.userData.velocity);
        
        // Quantum entanglement: mites influence each other (optimized to check only later mites)
        for (let j = index + 1; j < demodexMites.length; j++) {
            const otherMite = demodexMites[j];
            const distance = mite.position.distanceTo(otherMite.position);
            if (distance < 5) {
                const force = new THREE.Vector3()
                    .subVectors(otherMite.position, mite.position)
                    .normalize()
                    .multiplyScalar(0.001);
                mite.userData.velocity.add(force);
                // Apply opposite force to other mite (Newton's third law)
                otherMite.userData.velocity.sub(force);
            }
        }
        
        // Bounds checking with wraparound
        ['x', 'y', 'z'].forEach(axis => {
            if (Math.abs(mite.position[axis]) > 15) {
                mite.position[axis] = -Math.sign(mite.position[axis]) * 15;
            }
        });
        
        mite.rotation.x += 0.05;
        mite.rotation.y += 0.05;
    });
    
    // Camera orbit
    camera.position.x = Math.sin(time * 0.2) * 15;
    camera.position.z = Math.cos(time * 0.2) * 15;
    camera.lookAt(scene.position);
    
    // Update Ψ status (always enforced to 1)
    document.getElementById('psi-value').textContent = PSI_ENFORCED.toFixed(3);
    
    // Update Schumann status with live frequency
    const schumannDisplay = (SCHUMANN_FREQ * (1 + schumannPulse * 0.01)).toFixed(2);
    document.getElementById('schumann-status').textContent = `${schumannDisplay} Hz`;
    
    // Update demodex status
    const demodexActive = demodexMites.length;
    document.getElementById('demodex-status').textContent = `🦠 ${demodexActive} ENTANGLED`;
    
    renderer.render(scene, camera);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// HTTP 418 Easter egg - intercept fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🫖 HTTP 418: I\'m a teapot - Paradox firewall active');
    return originalFetch.apply(this, args);
};
