"""
astronaut_voice_bot_offline.py
Offline astronaut assistant:
🎙 Record voice -> 📝 Transcribe with Whisper -> 🤖 Simple reply -> 🔊 Speak with pyttsx3
"""

import whisper
import sounddevice as sd
from scipy.io.wavfile import write
import pyttsx3

# === Config ===
RECORD_SECONDS = 5
SAMPLE_RATE = 44100
INPUT_FILE = "D:\SIH\astronaut_full.mp3"

# Load Whisper model (first time will download ~70MB)
print("🔄 Loading Whisper model (tiny)...")
model = whisper.load_model("tiny")
print("✅ Whisper model loaded")

# === Step 1: Record Audio ===
def record_audio(filename=INPUT_FILE, duration=RECORD_SECONDS, fs=SAMPLE_RATE):
    print(f"🎙 Recording for {duration} seconds... Speak now!")
    recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    write(filename, fs, recording)
    print(f"✅ Audio saved as {filename}")
    return filename

# === Step 2: Transcribe with Whisper ===
def transcribe_audio(filename=INPUT_FILE):
    print("📝 Transcribing...")
    result = model.transcribe(filename)
    text = result["text"].strip()
    print("👩‍🚀 You said:", text)
    return text

# === Step 3: Simple Astronaut Chatbot Logic ===
def astronaut_chat(text):
    text = text.lower()
    if "tired" in text or "sleep" in text:
        return "Astronaut, I recommend taking a short rest and practicing deep breathing."
    elif "stress" in text or "docking" in text:
        return "Stay calm, you are well trained. Focus on your breathing, mission control trusts you."
    elif "heart rate" in text:
        return "I suggest slowing down your activity and hydrating. Monitor your vitals closely."
    elif "exercise" in text:
        return "Remember to stretch properly and balance activity with enough rest."
    else:
        return "I am here with you. Remember, you are not alone in space."

# === Step 4: Speak the Reply ===
def speak_text(text):
    print("🤖 Bot reply:", text)
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

# === MAIN ===
def main():
    audio_file = record_audio()
    user_text = transcribe_audio(audio_file)
    reply = astronaut_chat(user_text)
    speak_text(reply)

if __name__ == "__main__":
    main()
