import React, { useState } from "react";

const API_BASE = "http://localhost:8000";

const ENDPOINTS = {
  image: "/verify/image",
  video: "/verify/video",
  document: "/verify/document",
};

export default function UploadForm() {
  const [fileType, setFileType] = useState("image");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}${ENDPOINTS[fileType]}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Verification request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Verify a File</h2>

      <div className="flex gap-2">
        {Object.keys(ENDPOINTS).map((type) => (
          <button
            key={type}
            onClick={() => setFileType(type)}
            className={`px-3 py-1 rounded border ${
              fileType === type ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="border rounded p-3 text-sm space-y-1 bg-gray-50">
          <p>
            <strong>Verified:</strong>{" "}
            {result.verified ? "✅ Yes" : "⚠️ Flagged"}
          </p>
          <p>
            <strong>Tampered confidence:</strong>{" "}
            {result.tampered_confidence}
          </p>
          {!result.model_ready && (
            <p className="text-orange-600">
              Note: using an untrained backbone — fine-tune the model for real results.
            </p>
          )}
          <pre className="whitespace-pre-wrap text-xs mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
