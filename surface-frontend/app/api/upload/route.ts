/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import formidable, { File } from "formidable"
import fs from "fs"

export const config = { api: { bodyParser: false } } // Disable Next.js body parser

async function parseForm(
  req: NextRequest
): Promise<{ fields: formidable.Fields; file?: File }> {
  const form = formidable({
    multiples: false,
    uploadDir: "/tmp",
    keepExtensions: true,
  })

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      const file = files.audio as File | undefined
      resolve({ fields, file })
    })
  })
}

export async function POST(req: NextRequest) {
  try {
    const { file } = await parseForm(req)
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    // Move file to `/public/uploads`
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, `${Date.now()}-${file.newFilename}`)
    await writeFile(filePath, fs.readFileSync(file.filepath))

    return NextResponse.json({ message: "File uploaded", filePath })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
