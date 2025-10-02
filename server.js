const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Log explicit microphone request
app.post('/api/request-microphone', (req, res) => {
    try {
        const { userId } = req.body;
        console.log('Microphone access requested by user:', userId || 'anonymous');
        res.json({ success: true, message: 'Microphone request logged.' });
    } catch (error) {
        console.error('Error logging microphone request:', error);
        res.status(500).json({ success: false, error: 'Failed to log microphone request.' });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/audio';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Check microphone permission status
app.post('/api/check-microphone', async (req, res) => {
    try {
        // In a real implementation, you'd integrate with browser APIs
        // This endpoint can log permission requests and track usage
        const { permissionStatus } = req.body;
        
        console.log('Microphone permission check:', permissionStatus);
        
        res.json({
            success: true,
            message: 'Permission status logged',
            fallbackAvailable: true
        });
    } catch (error) {
        console.error('Error checking microphone:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check microphone permission'
        });
    }
});

// Handle audio file upload for fallback mode
app.post('/api/upload-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        console.log('Audio file received:', req.file.filename);

        // Here you would integrate with speech-to-text services like:
        // - Google Cloud Speech-to-Text
        // - AWS Transcribe
        // - Azure Speech Services
        // - OpenAI Whisper API

        // Simulated transcription response
        const simulatedTranscription = simulateTranscription(req.file.filename);

        // Generate AI response based on transcription
        const aiResponse = generateAIResponse(simulatedTranscription.text);

        res.json({
            success: true,
            transcription: simulatedTranscription.text,
            confidence: simulatedTranscription.confidence,
            response: aiResponse,
            audioFile: req.file.filename
        });

        // Clean up old files after 1 hour
        setTimeout(() => {
            const filePath = path.join(__dirname, 'uploads', 'audio', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Cleaned up audio file:', req.file.filename);
            }
        }, 3600000);

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process audio file'
        });
    }
});

// Text-based interaction endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log('Chat message received:', message);

        const aiResponse = generateAIResponse(message, context);

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate response'
        });
    }
});

// Get initial greeting
app.get('/api/greeting', (req, res) => {
    try {
        const greetings = [
            {
                text: "Hello! I'm Khushi, your AI companion for this mission. How are you feeling today? May I help you with anything?",
                emotion: 'happy'
            },
            {
                text: "Good to see you! I'm Khushi, here to support your mental health. How can I assist you today?",
                emotion: 'happy'
            },
            {
                text: "Welcome! I'm Khushi, your personal AI assistant. How are you feeling? I'm here to help in any way I can.",
                emotion: 'happy'
            }
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        res.json({
            success: true,
            greeting: randomGreeting
        });
    } catch (error) {
        console.error('Error generating greeting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate greeting'
        });
    }
});

// Health metrics endpoint
app.get('/api/health-metrics', (req, res) => {
    try {
        const metrics = {
            heartRate: 68 + Math.floor(Math.random() * 12),
            bloodOxygen: 96 + Math.floor(Math.random() * 3),
            bodyTemp: (36.4 + Math.random() * 0.8).toFixed(1),
            sleepHours: (6.5 + Math.random() * 2).toFixed(1),
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            metrics: metrics
        });
    } catch (error) {
        console.error('Error fetching health metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch health metrics'
        });
    }
});

// Helper Functions

function simulateTranscription(filename) {
    // In production, this would call actual speech-to-text API
    const sampleTexts = [
        "I'm feeling a bit stressed today",
        "Everything is going well",
        "I need some help with my tasks",
        "I'm feeling lonely",
        "Can you tell me a joke?"
    ];

    return {
        text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
        confidence: 0.85 + Math.random() * 0.14
    };
}

function generateAIResponse(text, context = {}) {
    const lowerText = text.toLowerCase();
    let emotion = 'happy';
    let response = '';

    if (lowerText.includes('sad') || lowerText.includes('tired') || lowerText.includes('stressed') || lowerText.includes('depressed') || lowerText.includes('lonely')) {
        emotion = 'sad';
        response = `I hear that you're feeling ${
            lowerText.includes('sad') ? 'sad' : 
            lowerText.includes('tired') ? 'tired' : 
            lowerText.includes('lonely') ? 'lonely' : 
            'stressed'
        }. I'm here for you. Would you like to talk about it or try some relaxation exercises?`;
    } else if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('excellent') || lowerText.includes('wonderful')) {
        emotion = 'happy';
        response = "That's wonderful to hear! I'm so glad you're feeling positive. Keep up the great energy!";
    } else if (lowerText.includes('help') || lowerText.includes('problem') || lowerText.includes('issue') || lowerText.includes('assist')) {
        emotion = 'thinking';
        response = "I'm here to help you. Can you tell me more about what you need assistance with?";
    } else if (lowerText.includes('wow') || lowerText.includes('amazing') || lowerText.includes('incredible') || lowerText.includes('unbelievable')) {
        emotion = 'surprised';
        response = "That sounds incredible! Tell me more about it!";
    } else if (lowerText.includes('joke') || lowerText.includes('funny') || lowerText.includes('laugh')) {
        emotion = 'happy';
        response = "Why did the astronaut break up with the moon? Because it was just a phase! 😄 But seriously, laughter is great for mental health. How else can I brighten your day?";
    } else {
        emotion = 'happy';
        response = `You said: "${text}". I'm here to support you. How are you feeling today? Is there anything specific you'd like to talk about?`;
    }

    return {
        text: response,
        emotion: emotion,
        timestamp: new Date().toISOString()
    };
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Khushi AI Backend Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}`);
    console.log(`🎤 Audio upload: http://localhost:${PORT}/api/upload-audio`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});

module.exports = app;