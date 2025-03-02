import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.audio_processing import extract_audio_features  # Now it should work!

import torch
import numpy as np
import soundfile as sf

# Load pre-trained MelGAN model (replace with actual model path)
MODEL_PATH = "models/melgan.pth"

def load_melgan():
    """Loads the pre-trained MelGAN model."""
    if not torch.cuda.is_available():
        print("Warning: CUDA not available. Running on CPU.")

    try:
        model = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
        model.eval()
        return model
    except FileNotFoundError:
        print(f"Error: Model file not found at {MODEL_PATH}")
        return None

def generate_audio(features):
    """Generates audio from extracted features using MelGAN."""
    model = load_melgan()
    if model is None:
        return None

    try:
        # Convert features to tensor
        feature_tensor = torch.tensor(np.array(features["mfccs"]), dtype=torch.float32).unsqueeze(0)

        # Generate waveform
        with torch.no_grad():
            generated_waveform = model(feature_tensor).cpu().numpy().squeeze()

        return generated_waveform
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

if __name__ == "__main__":
    AUDIO_PATH = "samples/vano.wav"
    features = extract_audio_features(AUDIO_PATH)

    if features:
        generated_waveform = generate_audio(features)
        if generated_waveform is not None:
            sf.write("samples/generated_song.wav", generated_waveform, 22050)
            print("✅ Audio successfully generated! Saved as 'samples/generated_song.wav'")
