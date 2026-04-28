"use client";
import { useState } from "react";
import Link from "next/link";

const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [semester, setSemester] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<{ total: number; passed: number; referred: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthenticated(true); setError(""); }
    else setError("Invalid password");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setStats(null);
    setProgress(0);

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      // Phase 1: upload chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append("password", password);
        formData.append("chunk", chunk);
        formData.append("index", String(i));
        formData.append("total", String(totalChunks));
        formData.append("uploadId", uploadId);

        const res = await fetch("/api/admin/upload-chunk", { method: "POST", body: formData });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Chunk upload failed");
        }

        const uploadProgress = Math.round(((i + 1) / totalChunks) * 80);
        setProgress(uploadProgress);
        setStatus(`Uploading... ${i + 1}/${totalChunks} chunks`);
      }

      // Phase 2: process
      setProgress(85);
      setStatus("Parsing PDF...");
      const res = await fetch("/api/admin/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, uploadId, semester }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");

      setProgress(100);
      setStatus(`Done — ${data.stats.total.toLocaleString()} records saved to Semester ${semester}.`);
      setStats(data.stats);
      setFile(null);
      (document.getElementById("fileInput") as HTMLInputElement).value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <h1 className="text-xl font-bold mb-6">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black transition-colors mb-3"
          />
          {error && <p className="text-xs text-neutral-500 mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-2 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Login
          </button>
          <Link href="/" className="block text-center mt-4 text-xs text-neutral-400 hover:text-neutral-600">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600">← Back</Link>
        </div>

        <div className="border border-neutral-200 p-6 mb-6">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-4">Upload Result PDF</p>

          <div className="mb-4">
            <p className="text-xs text-neutral-400 mb-2">Semester</p>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7,8].map(n => (
                <button
                  key={n}
                  onClick={() => setSemester(n)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    semester === n ? 'bg-black text-white border-black' : 'border-neutral-300 hover:border-black'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label
            htmlFor="fileInput"
            className="block border border-dashed border-neutral-300 p-8 text-center cursor-pointer hover:border-black transition-colors mb-4"
          >
            <p className="text-sm font-medium">{file ? file.name : "Click to select PDF"}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "BTEB result PDF"}
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => { setFile(e.target.files?.[0] || null); setStats(null); setStatus(""); setProgress(0); setError(""); }}
            />
          </label>

          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-neutral-100 h-1">
                <div
                  className="bg-black h-1 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && status && (
            <p className="text-xs text-neutral-500 mb-4">{status}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-2 bg-black text-white text-sm font-medium disabled:opacity-40 hover:bg-neutral-800 transition-colors"
          >
            {uploading ? "Processing..." : "Extract & Save"}
          </button>

          {error && <p className="mt-3 text-xs text-neutral-500">{error}</p>}
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total },
              { label: "Passed", value: stats.passed },
              { label: "Referred", value: stats.referred },
              { label: "Failed", value: stats.failed },
            ].map(({ label, value }) => (
              <div key={label} className="border border-neutral-200 p-4 text-center">
                <p className="font-mono font-bold text-xl">{value.toLocaleString()}</p>
                <p className="text-xs text-neutral-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
