import { useEffect, useState } from 'react';

type Operation = 'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode' | 'sha256';

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const operations: { value: Operation; label: string }[] = [
  { value: 'base64-encode', label: 'Base64 encode' }, { value: 'base64-decode', label: 'Base64 decode' }, { value: 'url-encode', label: 'URL encode' }, { value: 'url-decode', label: 'URL decode' }, { value: 'sha256', label: 'SHA-256 digest' },
];

export function ITToolsLab() {
  const [input, setInput] = useState('Hello, CYWF labs!');
  const [operation, setOperation] = useState<Operation>('base64-encode');
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    setError('');
    try {
      if (operation === 'base64-encode') setOutput(bytesToBase64(new TextEncoder().encode(input)));
      else if (operation === 'base64-decode') setOutput(new TextDecoder().decode(base64ToBytes(input)));
      else if (operation === 'url-encode') setOutput(encodeURIComponent(input));
      else if (operation === 'url-decode') setOutput(decodeURIComponent(input));
      else setOutput(digest || 'SHA-256 will appear here.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to transform input.');
      setOutput('');
    }
  }, [input, operation, digest]);

  async function runSha256() {
    setError('');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    setDigest([...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
  }

  return <div className="grid gap-4 lg:grid-cols-2">
    <label className="form-control"><span className="label-text text-slate-200">Local input</span><textarea className="textarea textarea-bordered min-h-48 bg-slate-900 text-slate-100" value={input} onChange={(event) => setInput(event.target.value)} /></label>
    <div className="space-y-3"><label className="form-control"><span className="label-text text-slate-200">Operation</span><select className="select select-bordered bg-slate-900" value={operation} onChange={(event) => { setOperation(event.target.value as Operation); setDigest(''); }}>{operations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
    {operation === 'sha256' && <button className="btn btn-info" onClick={runSha256}>Compute SHA-256</button>}
    <div className="rounded-xl border border-cyan-400/20 bg-slate-900 p-4"><p className="text-sm font-semibold text-cyan-200">Output</p><pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-100">{output}</pre></div>
    {error && <div role="alert" className="alert alert-error">{error}</div>}
    <div className="flex flex-wrap gap-2"><button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard.writeText(output)}>Copy output</button><button className="btn btn-ghost btn-sm" onClick={() => { setInput(''); setDigest(''); setError(''); }}>Reset</button></div>
    <p className="text-xs text-slate-400">Privacy note: transforms run in your browser only. No input is sent to a server.</p></div>
  </div>;
}
