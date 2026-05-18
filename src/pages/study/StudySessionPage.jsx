import { useState, useRef, useEffect, useContext } from "react";
import SubjectsContext from "../../context/SubjectsContext";
import GameContext from "../../context/GameContext";
import Tabs from "../../components/common/Tabs";
import { extractPdfText } from "../../utils/pdfExtractor";
import { generateQuizWithGemini } from "../../utils/geminiQuiz";

const STUDY_TABS = [
  { id: "journal",   label: "JOURNAL"    },
  { id: "citations", label: "CITATIONS"  },
  { id: "outline",   label: "OUTLINE"    },
  { id: "pdf",       label: "PDF UPLOAD" },
];

export default function StudySessionPage({ subjectId, setPage }) {
  const { subjects, updateNotes, saveQuizzes } = useContext(SubjectsContext);
  const { unlockAchievement, awardXP }         = useContext(GameContext);
  const subject = subjects.find(s => s.id === subjectId);

  const [tab,        setTab]        = useState("journal");
  const [notes,      setNotes]      = useState(subject?.notes || "");
  const [saving,     setSaving]     = useState(false);
  const [genCount,   setGenCount]   = useState(10);
  const [generating, setGenerating] = useState(false);
  const [genStatus,  setGenStatus]  = useState("");
  const [dragOver,   setDragOver]   = useState(false);
  const [pdfText,    setPdfText]    = useState("");
  const [pdfName,    setPdfName]    = useState("");
  const [pdfStatus,  setPdfStatus]  = useState("");
  const [extracting, setExtracting] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => { if (subject) setNotes(subject.notes || ""); }, [subjectId]); // eslint-disable-line

  const handleNotesChange = (v) => {
    setNotes(v);
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { updateNotes(subjectId, v); setSaving(false); }, 1500);
  };

  const generateQuiz = async () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setGenStatus("Contacting Gemini...");
    try {
      const qs = await generateQuizWithGemini({
        subjectTitle: subject?.title || "Untitled subject",
        notes,
        count: genCount,
      });
      setGenStatus("Saving quiz...");
      saveQuizzes(subjectId, qs);
      setGenStatus(`${qs.length} questions generated!`);
      setTimeout(() => { setGenerating(false); setGenStatus(""); setPage(`quiz:${subjectId}`); }, 1200);
    } catch (error) {
      setGenStatus(error.message || "Gemini quiz generation failed");
      setTimeout(() => { setGenerating(false); setGenStatus(""); }, 5000);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setExtracting(true);
    setPdfName(file.name);
    setPdfText("");
    setPdfStatus("Reading PDF...");

    try {
      const result = await extractPdfText(file, (page, total) => {
        setPdfStatus(`Extracting page ${page} of ${total}...`);
      });
      setPdfText(result.text || "No selectable text was found in this PDF.");
      setPdfStatus(`Extracted ${result.pageCount} page${result.pageCount === 1 ? "" : "s"} from ${file.name}`);
      unlockAchievement("pdf_upload");
      awardXP(30);
    } catch (error) {
      setPdfStatus(error.message || "PDF extraction failed");
    } finally {
      setExtracting(false);
      if (e.target) e.target.value = "";
    }
  };

  if (!subject) return <div style={{ color: "var(--text-muted)" }}>Subject not found</div>;

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button onClick={() => setPage("library")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: subject.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#05060f", boxShadow: `0 0 16px ${subject.color}60` }}>
          {subject.badge}
        </div>
        <div>
          <div className="font-cinzel" style={{ fontSize: 18, fontWeight: 700 }}>{subject.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Study Session · HUD Workspace</div>
        </div>
        {saving && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <div className="save-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-cyan)" }} />
            Saving…
          </div>
        )}
      </div>

      <Tabs tabs={STUDY_TABS} active={tab} onChange={setTab} />

      {/* ── Journal ── */}
      {tab === "journal" && (
        <div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <textarea
              className="hud-textarea"
              rows={18}
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder={"Start writing your study notes here…\n\nInclude key concepts, definitions, formulas, and summaries.\nThe AI will generate quiz questions directly from what you write."}
            />
            <div className="font-mono" style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "var(--text-muted)", pointerEvents: "none" }}>
              {notes.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select value={genCount} onChange={e => setGenCount(+e.target.value)} className="hud-input" style={{ width: 140 }}>
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
            <button className="glow-btn violet" disabled={!notes.trim() || generating} onClick={generateQuiz} style={{ flex: 1 }}>
              {generating ? genStatus || "GENERATING…" : "⚡ GENERATE QUIZ →"}
            </button>
          </div>
          {subject.quizzes.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button className="glow-btn" onClick={() => setPage(`quiz:${subjectId}`)}>
                ▶ TAKE QUIZ ({subject.quizzes.length} questions)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Citations ── */}
      {tab === "citations" && (
        <div className="glass" style={{ padding: 20, minHeight: 300, color: "var(--text-muted)", textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📎</div>
          <div>Citations are saved here</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Highlight text in your notes and mark it as a citation</div>
        </div>
      )}

      {/* ── Outline ── */}
      {tab === "outline" && (
        <div className="glass" style={{ padding: 20, minHeight: 300 }}>
          {notes.trim() ? (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--text-muted)", marginBottom: 12 }}>AUTO-OUTLINE</div>
              {notes.split("\n").filter(l => l.trim()).slice(0, 12).map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span className="font-mono" style={{ color: "var(--neon-cyan)", fontSize: 11, minWidth: 20, marginTop: 2 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{line.trim()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-muted)" }}>Write notes to generate outline</div>
          )}
        </div>
      )}

      {/* ── PDF Upload ── */}
      {tab === "pdf" && (
        <div>
          <div
            className={`drop-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById("pdf-input").click()}
          >
            <input id="pdf-input" type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFileDrop} />
            <div style={{ fontSize: 36, marginBottom: 12 }}>📜</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--neon-violet)", marginBottom: 6 }}>Upload a PDF</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {extracting ? pdfStatus : "Drag and drop a PDF or click to browse"}
            </div>
          </div>
          {pdfStatus && !pdfText && (
            <div className="glass" style={{ marginTop: 16, padding: 16, fontSize: 13, color: "var(--text-muted)" }}>
              {pdfStatus}
            </div>
          )}
          {pdfText && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neon-green)" }}>{pdfStatus || `Extracted: ${pdfName}`}</div>
                <button className="glow-btn green" style={{ fontSize: 11, padding: "6px 14px" }}
                  onClick={() => { updateNotes(subjectId, notes + "\n\n" + pdfText); setNotes(notes + "\n\n" + pdfText); setTab("journal"); }}>
                  SAVE TO JOURNAL →
                </button>
              </div>
              <div className="glass" style={{ padding: 16, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxHeight: 200, overflowY: "auto" }}>
                {pdfText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
