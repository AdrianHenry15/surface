import librosa
import numpy as np
import os
import json

def extract_audio_features(audio_path):
    """Extracts key audio features from a given song."""
    y, sr = librosa.load(audio_path, sr=22050)  # Load audio file
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)  # Extract MFCCs
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)  # Chroma features
    spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)  # Spectral contrast

    return {
        "mfccs": mfccs.mean(axis=1).tolist(),
        "chroma": chroma.mean(axis=1).tolist(),
        "spectral_contrast": spectral_contrast.mean(axis=1).tolist()
    }

# Example usage
if __name__ == "__main__":
    AUDIO_PATH = "samples/vano.wav"
    features = extract_audio_features(AUDIO_PATH)

    if features:
        print(json.dumps(features, indent=4))
