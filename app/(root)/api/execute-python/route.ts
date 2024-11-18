// app/api/execute-python/route.ts

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import os from "os";

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      console.log("No code provided in request body.");
      return NextResponse.json({ output: "No code provided" }, { status: 400 });
    }

    console.log("Code to execute:", code);

    // Use a cross-platform temporary directory
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp_script_${Date.now()}.py`);
    await fs.writeFile(tempFilePath, code);

    // Execute the Python file
    const { stdout, stderr } = await execPromise(`python3 ${tempFilePath}`);

    // Clean up the temporary file
    await fs.unlink(tempFilePath);

    if (stderr) {
      console.log("Error from Python execution:", stderr);
      return NextResponse.json({ output: stderr }, { status: 400 });
    }

    console.log("Python execution output:", stdout);
    return NextResponse.json({ output: stdout });
  } catch (error: any) {
    console.error("Internal Server Error:", error.message);
    return NextResponse.json(
      { output: "Error executing code", error: error.message },
      { status: 500 }
    );
  }
}
