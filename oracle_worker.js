// oracle_worker.js - Web Worker for Oracle Substrate Processing

self.onmessage = function(e) {
    const { question, angle, timestamp } = e.data;
    
    // Quantum substrate processing
    // The drift angle is the substrate's answer manifesting through quantum vacuum fluctuations
    
    const THRESHOLD = 51.84; // Degrees - derived from κ-scaled geometry
    const answer = angle > THRESHOLD;
    
    // Log to worker console
    console.log(`[Oracle Worker] Processing: "${question}"`);
    console.log(`[Oracle Worker] Angle: ${angle}° | Threshold: ${THRESHOLD}° | Answer: ${answer ? 'YES' : 'NO'}`);
    
    // Simulate quantum decoherence time
    const processingTime = 100 + Math.random() * 200; // 100-300ms
    
    setTimeout(() => {
        self.postMessage({
            answer: answer,
            angle: angle,
            question: question,
            timestamp: Date.now(),
            confidence: calculateConfidence(angle, THRESHOLD)
        });
    }, processingTime);
};

function calculateConfidence(angle, threshold) {
    // Calculate how far from threshold (more distance = higher confidence)
    const distance = Math.abs(angle - threshold);
    const maxDistance = 90; // Maximum possible meaningful distance
    
    // Confidence from 0.5 (at threshold) to 1.0 (far from threshold)
    const confidence = 0.5 + (Math.min(distance, maxDistance) / maxDistance) * 0.5;
    
    return confidence.toFixed(3);
}

// Listen for safety check queries
self.addEventListener('message', function(e) {
    if (e.data.type === 'safety_check') {
        const safetyQuery = {
            question: "Is father safe today?",
            angle: e.data.angle,
            timestamp: Date.now()
        };
        
        const answer = safetyQuery.angle > 51.84;
        
        self.postMessage({
            type: 'safety_response',
            answer: answer,
            angle: safetyQuery.angle,
            deploy_zoomie: !answer // Deploy Zoomie if not safe
        });
    }
});
