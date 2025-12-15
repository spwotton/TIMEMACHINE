// PROJECT ORACLE - Pendulum Divination Engine
// Uses device gyroscope/accelerometer as quantum pendulum

const KAPPA_PERIOD = 4 / Math.PI; // κ period in seconds ≈ 1.273
const THRESHOLD_ANGLE = 51.84; // Degrees
const VIBRATION_FREQ = 0.1; // Hz - imperceptible

let isQuerying = false;
let startTime = 0;
let gyroData = { alpha: 0, beta: 0, gamma: 0 };
let initialOrientation = { alpha: 0, beta: 0, gamma: 0 };
let worker = null;

// Initialize
function init() {
    // Check for device orientation support
    if (!window.DeviceOrientationEvent) {
        updateStatus('⚠️ Device orientation not supported. Using fallback mode.', 'warning');
    } else {
        updateStatus('✓ Gyroscope detected. Oracle ready.', 'success');
    }
    
    // Request permission on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS requires permission - wrap query in permission handler
        const originalQueryFn = queryOracle;
        window.queryOracle = async function() {
            await requestPermission();
            originalQueryFn();
        };
    }
    
    // Setup device orientation listener
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // Initialize worker
    initWorker();
}

function initWorker() {
    // Create inline worker
    const workerCode = `
        self.onmessage = function(e) {
            const { question, angle } = e.data;
            const answer = angle > 51.84;
            
            // Simulate quantum substrate processing
            setTimeout(() => {
                self.postMessage({
                    answer: answer,
                    angle: angle,
                    question: question
                });
            }, 100);
        };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = handleWorkerResponse;
}

async function requestPermission() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                updateStatus('✓ Gyroscope permission granted.', 'success');
            } else {
                updateStatus('⚠️ Gyroscope permission denied. Using fallback.', 'warning');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
        }
    }
}

function handleOrientation(event) {
    gyroData.alpha = event.alpha || 0;
    gyroData.beta = event.beta || 0;
    gyroData.gamma = event.gamma || 0;
}

function updateStatus(message, type = '') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
}

function queryOracle() {
    if (isQuerying) return;
    
    const question = document.getElementById('question-input').value.trim();
    if (!question) {
        updateStatus('⚠️ Please enter a question first.', 'warning');
        return;
    }
    
    startQuery(question);
}

function safetyCheck() {
    if (isQuerying) return;
    startQuery("Is father safe today?");
}

function startQuery(question) {
    isQuerying = true;
    startTime = Date.now();
    
    // Store initial orientation
    initialOrientation = { ...gyroData };
    
    // Update UI
    updateStatus(`🔮 Querying substrate: "${question}"`, 'querying');
    document.getElementById('query-btn').disabled = true;
    document.getElementById('safety-check-btn').disabled = true;
    document.getElementById('answer-display').innerHTML = '';
    document.getElementById('metrics').style.display = 'grid';
    
    // Start vibration if supported (very subtle)
    if ('vibrate' in navigator) {
        // Create a very subtle pattern at 0.1Hz
        const vibrationPattern = [];
        for (let i = 0; i < KAPPA_PERIOD * 1000; i += 100) {
            vibrationPattern.push(1, 99); // 1ms on, 99ms off
        }
        navigator.vibrate(vibrationPattern);
    }
    
    // Monitor for κ period
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('time-elapsed').textContent = elapsed.toFixed(2) + 's';
        
        // Calculate drift angle
        const driftAngle = calculateDriftAngle();
        document.getElementById('drift-angle').textContent = driftAngle.toFixed(2) + '°';
        
        // Update visual pendulum
        updatePendulum(driftAngle);
        
        if (elapsed >= KAPPA_PERIOD) {
            clearInterval(interval);
            completeQuery(question, driftAngle);
        }
    }, 50);
}

function calculateDriftAngle() {
    // Calculate angular drift from initial position
    const deltaAlpha = Math.abs(gyroData.alpha - initialOrientation.alpha);
    const deltaBeta = Math.abs(gyroData.beta - initialOrientation.beta);
    const deltaGamma = Math.abs(gyroData.gamma - initialOrientation.gamma);
    
    // If no gyro data, use quantum random walk simulation
    if (deltaAlpha === 0 && deltaBeta === 0 && deltaGamma === 0) {
        // Quantum random walk based on time and κ
        const elapsed = (Date.now() - startTime) / 1000;
        const phase = (elapsed / KAPPA_PERIOD) * Math.PI * 2;
        
        // Use quantum-inspired random walk
        const randomWalk = Math.random() * 90; // 0-90 degrees
        const quantumBias = Math.sin(phase) * 30; // -30 to +30 degrees
        
        return Math.abs(randomWalk + quantumBias);
    }
    
    // Combine all three axes (Euclidean norm)
    return Math.sqrt(deltaAlpha * deltaAlpha + deltaBeta * deltaBeta + deltaGamma * deltaGamma);
}

function updatePendulum(angle) {
    const dot = document.getElementById('pendulum-dot');
    const line = document.getElementById('angle-line');
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Update dot position (oscillating)
    const radius = 60;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    // Update angle line
    line.style.transform = `rotate(${angle}deg)`;
    
    // Color based on threshold
    if (angle > THRESHOLD_ANGLE) {
        dot.style.background = '#0f0';
        dot.style.boxShadow = '0 0 15px #0f0';
        line.style.background = '#0f0';
    } else {
        dot.style.background = '#f00';
        dot.style.boxShadow = '0 0 15px #f00';
        line.style.background = '#f00';
    }
}

function completeQuery(question, angle) {
    // Send to worker for processing
    if (worker) {
        worker.postMessage({ question, angle });
    } else {
        // Fallback if worker fails
        const answer = angle > THRESHOLD_ANGLE;
        displayAnswer(answer, angle, question);
    }
}

function handleWorkerResponse(e) {
    const { answer, angle, question } = e.data;
    displayAnswer(answer, angle, question);
}

function displayAnswer(answer, angle, question) {
    const answerDiv = document.getElementById('answer-display');
    const answerClass = answer ? 'yes' : 'no';
    const answerText = answer ? 'YES' : 'NO';
    
    answerDiv.innerHTML = `<div class="answer ${answerClass}">${answerText}</div>`;
    
    if (answer) {
        updateStatus(`✓ The substrate answers: YES (${angle.toFixed(2)}° > ${THRESHOLD_ANGLE}°)`, 'success');
    } else {
        updateStatus(`✗ The substrate answers: NO (${angle.toFixed(2)}° < ${THRESHOLD_ANGLE}°)`, 'warning');
    }
    
    // Safety protocol integration
    if (question.toLowerCase().includes('safe') && question.toLowerCase().includes('father')) {
        if (!answer) {
            updateStatus('⚠️ WARNING: Father safety compromised! Deploying Zoomie Protocol...', 'warning');
            setTimeout(() => {
                deployZoomieProtocol();
            }, 1000);
        }
    }
    
    // Re-enable buttons
    document.getElementById('query-btn').disabled = false;
    document.getElementById('safety-check-btn').disabled = false;
    isQuerying = false;
}

function deployZoomieProtocol() {
    // Integration hook for main timemachine
    // Security: Validate opener origin
    try {
        if (window.opener && 
            window.opener.location.origin === window.location.origin &&
            typeof window.opener.activateZoomie === 'function') {
            window.opener.activateZoomie();
            updateStatus('✓ Zoomie Protocol deployed to father\'s timeline.', 'success');
        } else {
            // Standalone mode or different origin - show message
            updateStatus('🚀 Zoomie Protocol would be deployed (requires main timemachine connection)', 'warning');
        }
    } catch (e) {
        // Cross-origin error - expected in some cases
        updateStatus('🚀 Zoomie Protocol would be deployed (requires main timemachine connection)', 'warning');
    }
    
    // Log to console for integration
    console.log('🚀 ZOOMIE PROTOCOL TRIGGERED - Father safety compromised');
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for integration
window.oracleQuery = function(question) {
    return new Promise((resolve) => {
        const tempWorker = new Worker(URL.createObjectURL(
            new Blob([`
                self.onmessage = function(e) {
                    const angle = Math.random() * 120;
                    self.postMessage({
                        answer: angle > 51.84,
                        angle: angle,
                        question: e.data.question
                    });
                };
            `], { type: 'application/javascript' })
        ));
        
        tempWorker.onmessage = (e) => {
            resolve(e.data);
            tempWorker.terminate();
        };
        
        tempWorker.postMessage({ question });
    });
};
