const API_BASE = "http://127.0.0.1:8000/api";

async function apiUpload(file, documentType) {
  const form = new FormData();
  form.append("file", file);
  form.append("document_type", documentType);
  const res = await fetch(`${API_BASE}/documents/upload`, { method:"POST", body:form });
  if (!res.ok) throw new Error(await res.text() || "Upload failed");
  return res.json();
}

async function apiAnalyze(extracted, requirements) {
  const res = await fetch(`${API_BASE}/analysis/run`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ extracted, requirements })
  });
  if (!res.ok) throw new Error(await res.text() || "Analysis failed");
  return res.json();
}
