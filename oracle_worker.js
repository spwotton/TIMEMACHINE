// oracle_worker.js - Web Worker for Oracle Substrate Processing

const THRESHOLD = 51.84; // Degrees - derived from κ-scaled geometry

self.onmessage = function(e) {
    const { question, angle, timestamp, type } = e.data;
    
    // Handle different message types
    if (type === 'safety_check') {
        handleSafetyCheck(angle);
        return;
    }
    
    // Regular oracle query processing
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

function handleSafetyCheck(angle) {
    const answer = angle > THRESHOLD;
    
    self.postMessage({
        type: 'safety_response',
        answer: answer,
        angle: angle,
        deploy_zoomie: !answer // Deploy Zoomie if not safe
    });
}
