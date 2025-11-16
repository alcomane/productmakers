import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, checkOnly } = await req.json();

    if (checkOnly) {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        return NextResponse.json({ status: 'connected' });
      }
      throw new Error('Ollama not responding');
    }

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Model not found. Run: ollama pull llama3.2' },
          { status: 404 }
        );
      }
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });

  } catch (error) {
    console.error('API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Cannot connect to Ollama. Make sure it\'s running: ollama serve' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}