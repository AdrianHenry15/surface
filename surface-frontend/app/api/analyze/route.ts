import { NextRequest, NextResponse } from "next/server"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import Meyda from "meyda"
import wav from "node-wav"

export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json()
    if (!filePath)
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      )

    // Convert audio to WAV format for analysis
    const wavFilePath = filePath.replace(/\.\w+$/, ".wav")
    await convertToWav(filePath, wavFilePath)

    // Read WAV data and extract frequency spectrum
    const frequencyData = await analyzeAudio(wavFilePath)

    return NextResponse.json({ message: "Analysis complete", frequencyData })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

// Converts any audio file to WAV format
async function convertToWav(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath)
  })
}

// Analyzes the WAV file and extracts frequency data
async function analyzeAudio(filePath: string): Promise<number[]> {
  const buffer = fs.readFileSync(filePath)
  const decoded = wav.decode(buffer) // Decode the WAV file buffer
  const audioData = decoded.channelData[0] // Use the first channel for analysis

  if (!audioData) {
    throw new Error("Error decoding WAV file or missing audio data.")
  }

  // Extract spectral centroid using Meyda (no need to pass sampleRate)
  const frequencies = Meyda.extract("spectralCentroid", audioData)

  // Meyda.extract might return null, so we need to handle that
  if (!frequencies) {
    throw new Error("Failed to extract frequency data.")
  }

  // Return the frequencies (spectral centroid values)
  return frequencies as number[] // Meyda.extract returns an array
}
