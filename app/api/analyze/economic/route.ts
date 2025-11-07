import { NextRequest, NextResponse } from 'next/server';
import { PythonShell } from 'python-shell';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const backendPath = path.join(process.cwd(), 'backend');
    
    const result: any = await new Promise((resolve, reject) => {
      PythonShell.run(
        'analyze.py',
        {
          mode: 'text',
          pythonPath: path.join(backendPath, 'venv', 'bin', 'python'),
          scriptPath: backendPath,
          args: [
            data.country,
            data.gdpGrowth.toString(),
            data.inflation.toString(),
            data.unemployment.toString(),
            data.domesticCredit.toString(),
            data.exports.toString(),
            data.imports.toString(),
            'economic',
          ],
        },
        (err, results) => {
          if (err) reject(err);
          else resolve(JSON.parse(results?. || '{}'));
        }
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
