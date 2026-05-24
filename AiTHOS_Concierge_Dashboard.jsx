import React, { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// AiTHOS Phase 1 — Concierge Record-Assembly Dashboard
//
// SCOPE / DATA BOUNDARY (read before changing anything):
// This tool holds COORDINATION data only — coded subject labels, source names,
// request statuses, dates, and process notes. It deliberately has NOWHERE to
// enter a diagnosis, a result, or any clinical content. Subjects are identified
// by code (S01–S07); the code-to-name key lives ONLY in the secure AiTHOS
// system, never here. This is a working surface, NOT the system of record.
// ---------------------------------------------------------------------------

const FOLLOWUP_DAYS = 30; // right-of-access window that anchors follow-up

const STATUSES = {
  not_sent: { label: "Not sent", ramp: "gray" },
  requested: { label: "Requested", ramp: "blue" },
  followup: { label: "Follow-up due", ramp: "amber" },
  received: { label: "Received", ramp: "teal" },
  partial: { label: "Partial / gap", ramp: "coral" },
};

const RAMP = {
  gray: { fill: "#F1EFE8", text: "#444441", border: "#888780" },
  blue: { fill: "#E6F1FB", text: "#0C447C", border: "#378ADD" },
  amber: { fill: "#FAEEDA", text: "#633806", border: "#BA7517" },
  teal: { fill: "#E1F5EE", text: "#085041", border: "#1D9E75" },
  coral: { fill: "#FAECE7", text: "#712B13", border: "#D85A30" },
};

const SOURCE_TYPES = ["Hospital", "Primary care", "Specialist", "Lab", "Imaging", "Pharmacy", "Other"];

const uid = () => Math.random().toString(36).slice(2, 9);

function daysSince(dateStr) {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr + "T00:00:00").getTime();
  return Math.floor(ms / 86400000);
}

// A source is "follow-up due" when requested, not yet received, and past the window
function effectiveStatus(src) {
  if (src.status === "requested") {
    const d = daysSince(src.dateRequested);
    if (d !== null && d >= FOLLOWUP_DAYS) return "followup";
  }
  return src.status;
}

function emptySubject(code) {
  return { id: uid(), code, sources: [] };
}

function emptySource() {
  return {
    id: uid(),
    name: "",
    type: "Hospital",
    contact: "",
    status: "not_sent",
    dateRequested: "",
    dateReceived: "",
    notes: "",
    history: [],
  };
}

export default function App() {
  const [subjects, setSubjects] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load persisted data
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("aithos:subjects");
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setSubjects(parsed);
          setActiveId(parsed[0]?.id ?? null);
          return;
        }
      } catch (e) {
        // no existing data — fall through to seed
      }
      const seed = Array.from({ length: 7 }, (_, i) =>
        emptySubject("S" + String(i + 1).padStart(2, "0"))
      );
      setSubjects(seed);
      setActiveId(seed[0].id);
    })();
  }, []);

  // Persist on change
  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      await window.storage.set("aithos:subjects", JSON.stringify(next));
    } catch (e) {
      console.error("save failed", e);
    }
    setSaving(false);
  }, []);

  const update = useCallback(
    (next) => {
      setSubjects(next);
      persist(next);
    },
    [persist]
  );

  if (!subjects) {
    return <div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>Loading…</div>;
  }

  const active = subjects.find((s) => s.id === activeId) || subjects[0];

  // ---- mutations -----------------------------------------------------------
  const mutateActive = (fn) => {
    update(subjects.map((s) => (s.id === active.id ? fn(structuredClone(s)) : s)));
  };

  const addSource = () =>
    mutateActive((s) => {
      s.sources.push(emptySource());
      return s;
    });

  const removeSource = (sid) =>
    mutateActive((s) => {
      s.sources = s.sources.filter((x) => x.id !== sid);
      return s;
    });

  const setSourceField = (sid, field, value) =>
    mutateActive((s) => {
      const src = s.sources.find((x) => x.id === sid);
      if (!src) return s;
      // Auto-stamp dates and log history on status changes
      if (field === "status") {
        if (value === "requested" && !src.dateRequested) {
          src.dateRequested = new Date().toISOString().slice(0, 10);
        }
        if (value === "received" && !src.dateReceived) {
          src.dateReceived = new Date().toISOString().slice(0, 10);
        }
        src.history.push({
          id: uid(),
          when: new Date().toISOString().slice(0, 10),
          text: "Status → " + STATUSES[value].label,
        });
      }
      src[field] = value;
      return s;
    });

  const addNote = (sid, text) =>
    mutateActive((s) => {
      const src = s.sources.find((x) => x.id === sid);
      if (!src || !text.trim()) return s;
      src.history.push({ id: uid(), when: new Date().toISOString().slice(0, 10), text: text.trim() });
      return s;
    });

  // ---- summary counts ------------------------------------------------------
  const allSources = subjects.flatMap((s) => s.sources);
  const counts = {
    total: allSources.length,
    outstanding: allSources.filter((x) => ["requested", "followup"].includes(effectiveStatus(x))).length,
    followup: allSources.filter((x) => effectiveStatus(x) === "followup").length,
    received: allSources.filter((x) => effectiveStatus(x) === "received").length,
  };

  // ---- styles --------------------------------------------------------------
  const card = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "1rem 1.25rem",
  };
  const label = { fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 };

  function StatusPill({ status }) {
    const r = RAMP[STATUSES[status].ramp];
    return (
      <span
        style={{
          background: r.fill,
          color: r.text,
          fontSize: 12,
          padding: "3px 10px",
          borderRadius: "var(--border-radius-md)",
          whiteSpace: "nowrap",
        }}
      >
        {STATUSES[status].label}
      </span>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0" }}>
      <h2 className="sr-only" style={{ position: "absolute", left: -9999 }}>
        AiTHOS Phase 1 concierge record-assembly tracking dashboard, identifying subjects by code only.
      </h2>

      {/* header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Record-assembly tracker</h1>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          {saving ? "Saving…" : "Saved"}
        </span>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1.25rem" }}>
        Phase 1 validation · subjects identified by code only · coordination data, no health content
      </p>

      {/* summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          ["Sources", counts.total],
          ["Outstanding", counts.outstanding],
          ["Follow-up due", counts.followup],
          ["Received", counts.received],
        ].map(([l, v]) => (
          <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* subject tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
        {subjects.map((s) => {
          const out = s.sources.filter((x) => ["requested", "followup"].includes(effectiveStatus(x))).length;
          const fu = s.sources.some((x) => effectiveStatus(x) === "followup");
          const isActive = s.id === active.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              aria-label={"Subject " + s.code}
              style={{
                border: isActive ? "2px solid var(--color-border-info)" : "0.5px solid var(--color-border-secondary)",
                background: isActive ? "var(--color-background-info)" : "transparent",
                color: "var(--color-text-primary)",
                borderRadius: "var(--border-radius-md)",
                padding: "6px 12px",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {s.code}
              {fu && <span style={{ width: 6, height: 6, borderRadius: "50%", background: RAMP.amber.border, display: "inline-block" }} />}
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{s.sources.length}</span>
            </button>
          );
        })}
      </div>

      {/* active subject */}
      <div style={{ ...card, marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Subject {active.code}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Name & identifiers live in secure AiTHOS, not here</div>
          </div>
          <button onClick={addSource} style={{ fontSize: 13, padding: "6px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer" }}>
            <i className="ti ti-plus" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true" />
            Add source
          </button>
        </div>

        {active.sources.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>
            No sources yet. Add each place that holds this subject's records.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {active.sources.map((src) => (
            <SourceRow
              key={src.id}
              src={src}
              StatusPill={StatusPill}
              label={label}
              onField={(f, v) => setSourceField(src.id, f, v)}
              onRemove={() => removeSource(src.id)}
              onNote={(t) => addNote(src.id, t)}
            />
          ))}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>
        Follow-up flags after {FOLLOWUP_DAYS} days from request. This is a working surface — confirm status into the secure AiTHOS system, which remains the source of truth.
      </p>
    </div>
  );
}

function SourceRow({ src, StatusPill, label, onField, onRemove, onNote }) {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [letterOpen, setLetterOpen] = useState(false);
  const eff = effectiveStatus(src);
  const since = daysSince(src.dateRequested);

  const input = {
    width: "100%",
    fontSize: 14,
    padding: "7px 9px",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input
          value={src.name}
          placeholder="Source name (e.g., Stanford Health)"
          onChange={(e) => onField("name", e.target.value)}
          style={{ ...input, flex: 2, minWidth: 160 }}
        />
        <select value={src.type} onChange={(e) => onField("type", e.target.value)} style={{ ...input, flex: 1, minWidth: 110 }}>
          {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={src.status} onChange={(e) => onField("status", e.target.value)} style={{ ...input, flex: 1, minWidth: 120 }}>
          {Object.entries(STATUSES).filter(([k]) => k !== "followup").map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <StatusPill status={eff} />
        <button onClick={() => setOpen(!open)} aria-label="Toggle details" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)" }}>
          <i className={open ? "ti ti-chevron-up" : "ti ti-chevron-down"} aria-hidden="true" />
        </button>
        <button onClick={onRemove} aria-label="Remove source" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)" }}>
          <i className="ti ti-trash" aria-hidden="true" />
        </button>
      </div>

      {eff === "followup" && (
        <div style={{ fontSize: 12, color: RAMP.amber.text, marginTop: 8 }}>
          <i className="ti ti-clock" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true" />
          Requested {since} days ago — follow-up is due.
        </div>
      )}

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div>
              <label style={label}>Secure contact / intake</label>
              <input value={src.contact} placeholder="portal, fax, or address" onChange={(e) => onField("contact", e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Date requested</label>
              <input type="date" value={src.dateRequested} onChange={(e) => onField("dateRequested", e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Date received</label>
              <input type="date" value={src.dateReceived} onChange={(e) => onField("dateReceived", e.target.value)} style={input} />
            </div>
          </div>

          <div>
            <label style={label}>Notes (process / coordination only)</label>
            <textarea
              value={src.notes}
              placeholder="e.g., clerk asked for portal form; date range confirmed"
              onChange={(e) => onField("notes", e.target.value)}
              rows={2}
              style={{ ...input, resize: "vertical" }}
            />
          </div>

          {/* history */}
          {src.history.length > 0 && (
            <div>
              <label style={label}>Status history</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {src.history.map((h) => (
                  <div key={h.id} style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{h.when}</span>
                    {"  ·  "}
                    {h.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={noteText}
              placeholder="Add a tracking note…"
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onNote(noteText); setNoteText(""); } }}
              style={{ ...input, flex: 1 }}
            />
            <button onClick={() => { onNote(noteText); setNoteText(""); }} style={{ fontSize: 13, padding: "0 14px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer" }}>
              Log
            </button>
          </div>

          {/* letter generator */}
          <button onClick={() => setLetterOpen(!letterOpen)} style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer" }}>
            <i className="ti ti-file" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true" />
            {letterOpen ? "Hide" : "Generate"} request letter
          </button>

          {letterOpen && <LetterBlock src={src} />}
        </div>
      )}
    </div>
  );
}

function LetterBlock({ src }) {
  const letter = buildLetter(src);
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.6 }}>
        {letter}
      </pre>
      <button
        onClick={() => { navigator.clipboard?.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        style={{ marginTop: 10, fontSize: 13, padding: "6px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", cursor: "pointer" }}
      >
        <i className="ti ti-copy" style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden="true" />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function buildLetter(src) {
  const to = src.name || "[records office / provider name]";
  const via = src.contact || "[secure portal / fax / address]";
  const date = src.dateRequested || "[date of request]";
  return [
    `Date: ${date}`,
    `To: ${to}`,
    `Via: ${via}`,
    ``,
    `Re: Patient request for access to records`,
    ``,
    `To the Medical Records / Health Information Management team,`,
    ``,
    `I am writing to request access to my own health records. This is a`,
    `request made by me, the patient, under my individual right of access`,
    `at 45 C.F.R. § 164.524.`,
    ``,
    `Patient name: [concierge to fill in — from secure AiTHOS]`,
    `Date of birth: [concierge to fill in]`,
    `Address on file: [concierge to fill in]`,
    `Other identifiers (MRN, etc.): [concierge to fill in]`,
    ``,
    `Records requested: [record types — e.g., visit records, labs,`,
    `imaging, medications, procedures, clinician notes]`,
    `Date range: [or "all available records"]`,
    ``,
    `Please provide the records in electronic form via my preferred secure`,
    `method: [secure portal / encrypted file / mail + destination].`,
    `If electronic delivery is not readily producible, please contact me`,
    `before using another method.`,
    ``,
    `If there is a permitted fee for copying, please tell me the amount`,
    `before processing so I can confirm.`,
    ``,
    `Signed by me, the patient:`,
    ``,
    `______________________________________`,
    `[patient signature]        Date: __________`,
  ].join("\n");
}
