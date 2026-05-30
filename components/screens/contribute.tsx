"use client";

// Contribute — public, no-auth submission of a plot and/or farmer.
// Single smart form: toggle what you're adding, fill verified details,
// phone OTP (simulated), photo + GPS, lands in the operator Submissions queue.

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stamp } from "@/components/shared";
import { useDistricts } from "@/lib/db/hooks";
import { submitContribution } from "@/app/contribute/actions";
import type { Screen } from "./types";

const STORAGE_KEY = "planttree_contribute_draft";
const PHONE_RE = /^[+0-9 ]{8,}$/;

type Adding = "plot" | "farmer" | "both";

interface Fields {
  who: string;
  name: string;
  phone: string;
  orgName?: string;
  orgReg?: string;
  orgRole?: string;
  orgDoc?: boolean;
  district: string;
  village: string;
  size: string;
  landState: string;
  water: string;
  owner: string;
  farmerName: string;
  farmerAgreed: string;
  note: string;
}

const EMPTY_FIELDS: Fields = {
  who: "",
  name: "",
  phone: "",
  district: "",
  village: "",
  size: "",
  landState: "",
  water: "",
  owner: "",
  farmerName: "",
  farmerAgreed: "",
  note: "",
};

export function Contribute({ navigate }: { navigate?: (s: Screen) => void }) {
  const router = useRouter();
  // In the SPA shell we get `navigate` and stay in-page; on the standalone
  // /contribute route there's no SPA, so fall back to a real navigation home.
  const go = (s: Screen) => (navigate ? navigate(s) : router.push("/"));

  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState<Adding>("both");
  const [f, setF] = useState<Fields>(EMPTY_FIELDS);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ref, setRef] = useState("");
  const [tries, setTries] = useState(false); // show validation after first attempt
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const districts = useDistricts() ?? [];

  // Load any saved draft once on mount so a dropped signal doesn't lose answers.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.adding) setAdding(saved.adding);
      if (saved.f) setF({ ...EMPTY_FIELDS, ...saved.f });
      if (saved.gps) setGps(saved.gps);
      if (saved.photo) setPhoto(saved.photo);
    } catch {
      // ignore corrupt draft
    }
    setHydrated(true);
  }, []);

  // Persist the whole draft as it changes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ adding, f, gps, photo }),
      );
    } catch {
      // storage may be unavailable (private mode) — non-fatal
    }
  }, [hydrated, adding, f, gps, photo]);

  const set = (k: keyof Fields, v: string | boolean) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const needPlot = adding === "plot" || adding === "both";
  const needFarmer = adding === "farmer" || adding === "both";
  const isOrg = f.who === "ngo" || f.who === "panchayat";

  // validation
  const errs: Record<string, string> = {};
  if (!f.who) errs.who = "Tell us who you are";
  if (!f.name.trim()) errs.name = "Your name is needed";
  if (!PHONE_RE.test(f.phone)) errs.phone = "A valid phone number is needed";
  if (!f.district) errs.district = "Pick a district";
  if (!f.village.trim()) errs.village = "Village name is needed";
  if (isOrg && !(f.orgName || "").trim())
    errs.orgName =
      f.who === "ngo" ? "Name the NGO / foundation" : "Name the panchayat";
  if (needPlot) {
    if (!f.landState) errs.landState = "What's on the land now?";
    if (!f.owner.trim()) errs.owner = "Who owns / uses the land?";
    if (!photo) errs.photo = "One photo of the land is required";
    if (!gps) errs.gps = "Drop a location pin";
  }
  if (needFarmer) {
    if (!f.farmerName.trim()) errs.farmerName = "Farmer's name is needed";
    if (!f.farmerAgreed) errs.farmerAgreed = "Has the farmer agreed?";
  }
  const baseValid = Object.keys(errs).length === 0;
  const canSubmit = baseValid && verified;

  const trust = [
    verified && "phone verified",
    gps && "GPS present",
    photo && "photo attached",
    isOrg && (f.orgName || "").trim() && "vouched by org",
  ].filter(Boolean) as string[];

  function dropPin() {
    // Real GPS when the browser allows it; otherwise a coordinate near the
    // chosen district (Uttarakhand mid-hills) so the prototype still flows.
    const jitter = () => (Math.random() - 0.5) * 0.04;
    const fallback = () =>
      setGps({
        lat: +(29.6 + jitter()).toFixed(4),
        lng: +(79.6 + jitter()).toFixed(4),
      });
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setGps({
            lat: +pos.coords.latitude.toFixed(4),
            lng: +pos.coords.longitude.toFixed(4),
          }),
        fallback,
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      fallback();
    }
  }

  function sendOtp() {
    if (!PHONE_RE.test(f.phone)) {
      setTries(true);
      return;
    }
    setOtpSent(true);
  }
  function checkOtp(v: string) {
    setOtp(v);
    if (v.length === 6) setVerified(true);
  }

  async function submit() {
    setTries(true);
    setServerError(null);
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const { ref: newRef } = await submitContribution({
        adding,
        who: f.who,
        name: f.name,
        phone: f.phone,
        orgName: f.orgName,
        orgReg: f.orgReg,
        orgRole: f.orgRole,
        orgDoc: f.orgDoc,
        district: f.district,
        village: f.village,
        gps,
        size: f.size,
        water: f.water,
        landState: f.landState,
        owner: f.owner,
        photo,
        farmerName: f.farmerName,
        farmerAgreed: f.farmerAgreed,
        note: f.note,
        trust,
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // non-fatal
      }
      setRef(newRef);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Something went wrong — please retry.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSubmitted(false);
    setRef("");
    setF(EMPTY_FIELDS);
    setAdding("both");
    setGps(null);
    setPhoto(false);
    setVerified(false);
    setOtpSent(false);
    setOtp("");
    setTries(false);
  }

  if (submitted) {
    return (
      <div
        className="shell"
        style={{ paddingTop: 60, paddingBottom: 100, maxWidth: 720 }}
      >
        <div style={{ textAlign: "center" }}>
          <Stamp color="var(--moss)" rotation={-2}>
            {ref} · received
          </Stamp>
          <h1 style={{ marginTop: 22, marginBottom: 16 }}>
            Thank you. We&apos;ll <em>look into it</em>.
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 17,
              lineHeight: 1.55,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Your submission is in our research queue. An operator will review
            it, call you on the number you verified, and — if it fits — schedule
            a site visit. Nothing goes live on the map until we&apos;ve seen it
            in person.
          </p>
        </div>

        <div className="card frame" style={{ marginTop: 36, padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            What happens to {ref}
          </div>
          {[
            { d: "Now", t: "Logged in the operator's Submissions queue", on: true },
            { d: "Few days", t: "Operator reviews + calls you to confirm details", on: false },
            { d: "Next window", t: "Site visit — soil sample, GPS, photos", on: false },
            { d: "After visit", t: "Promoted to “field-visited”, then “planting”", on: false },
          ].map((s, i, a) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                padding: "11px 0",
                borderBottom:
                  i < a.length - 1 ? "1px dotted var(--line-2)" : "none",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `2px solid ${s.on ? "var(--moss)" : "var(--line-2)"}`,
                  background: s.on ? "var(--moss)" : "transparent",
                  flexShrink: 0,
                }}
              ></div>
              <div
                style={{
                  width: 96,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {s.d}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: s.on ? "var(--ink)" : "var(--ink-2)",
                }}
              >
                {s.t}
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "var(--paper-2)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            Track anytime: planttree.life/contribute/status/{ref.toLowerCase()} ·
            sent to your phone by SMS
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <button className="btn" onClick={() => go("where")}>
            See where we plant <span className="arrow">→</span>
          </button>
          <button className="btn ghost" onClick={reset}>
            Add another
          </button>
        </div>
      </div>
    );
  }

  const errStyle: React.CSSProperties = {
    color: "var(--terra)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.04em",
    marginTop: 4,
  };
  const showErr = (k: string) =>
    tries && errs[k] ? <div style={errStyle}>{errs[k]}</div> : null;

  const chip = (selected: boolean): React.CSSProperties => ({
    cursor: "pointer",
    padding: "6px 12px",
    background: selected ? "var(--moss)" : "var(--paper)",
    color: selected ? "var(--paper)" : "var(--ink-2)",
    border: "1px solid " + (selected ? "var(--moss)" : "var(--line)"),
  });

  return (
    <div className="shell" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="contribute-grid">
        {/* LEFT: form */}
        <div>
          <button
            className="btn ghost sm"
            onClick={() => go("where")}
            style={{ marginBottom: 18 }}
          >
            ← Where we plant
          </button>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Contribute · no account needed
          </div>
          <h1 style={{ marginBottom: 14 }}>
            Know land that needs <em>trees</em>?
          </h1>
          <p
            style={{
              color: "var(--ink-2)",
              fontSize: 16,
              lineHeight: 1.55,
              maxWidth: 560,
              marginBottom: 28,
            }}
          >
            Tell us about a barren or degrading plot, or a farmer who wants to
            plant. We&apos;ll research it, call you, and visit in person. You
            don&apos;t need to know the soil science — that&apos;s our job. Just
            point us at the land.
          </p>

          {/* Explainer band — sets expectations before the form */}
          <div
            className="card"
            style={{
              padding: 22,
              marginBottom: 18,
              background: "var(--paper-2)",
              border: "1px dashed var(--line-2)",
            }}
          >
            <div className="contribute-band">
              {[
                { n: "What we're after", d: "Barren, eroding or unused land near a village — ideally with some water within reach. A slope losing its trees is exactly right." },
                { n: "What you needn't know", d: "No soil science, no measurements, no coordinates to type. Rough answers are fine — we confirm everything on the visit." },
                { n: "What happens next", d: "We research it, call you on your verified number, and visit in person. Nothing appears on the map until we've stood on the land." },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{ borderLeft: "2px solid var(--moss)", paddingLeft: 14 }}
                >
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    {b.n}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-2)",
                      lineHeight: 1.55,
                    }}
                  >
                    {b.d}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What are you adding */}
          <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              What are you adding?
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { v: "plot", l: "A plot of land" },
                { v: "farmer", l: "A farmer" },
                { v: "both", l: "A plot + the farmer on it" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setAdding(o.v as Adding)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: 14,
                    border:
                      "1px solid " +
                      (adding === o.v ? "var(--moss)" : "var(--line)"),
                    background:
                      adding === o.v
                        ? "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))"
                        : "var(--paper)",
                    color: "var(--ink)",
                    fontFamily: "inherit",
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* About you */}
          <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              About you
            </div>
            <div className="col" style={{ gap: 14 }}>
              <div>
                <label
                  className="eyebrow"
                  style={{ display: "block", marginBottom: 6 }}
                >
                  You are a…
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["resident", "Local resident"],
                    ["farmer", "The farmer"],
                    ["ngo", "NGO / foundation"],
                    ["panchayat", "Panchayat"],
                    ["other", "Other"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => set("who", v)}
                      className="tag"
                      style={chip(f.who === v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                {showErr("who")}
              </div>

              {isOrg && (
                <div
                  style={{
                    padding: 16,
                    background:
                      "color-mix(in oklch, var(--moss-soft) 22%, var(--paper))",
                    border: "1px dashed var(--moss)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    className="eyebrow"
                    style={{ marginBottom: 10, color: "var(--moss)" }}
                  >
                    {f.who === "ngo"
                      ? "Your organisation vouches for this — tell us who"
                      : "Panchayat details"}
                  </div>
                  <div className="col" style={{ gap: 12 }}>
                    <div>
                      <label
                        className="eyebrow"
                        style={{ display: "block", marginBottom: 6 }}
                      >
                        {f.who === "ngo" ? "NGO / foundation name" : "Panchayat name"}
                      </label>
                      <input
                        className="input"
                        value={f.orgName || ""}
                        onChange={(e) => set("orgName", e.target.value)}
                        placeholder={
                          f.who === "ngo"
                            ? "e.g. Hark Foundation, Almora"
                            : "e.g. Dhauladevi Gram Panchayat"
                        }
                      />
                      {showErr("orgName")}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label
                          className="eyebrow"
                          style={{ display: "block", marginBottom: 6 }}
                        >
                          {f.who === "ngo"
                            ? "Registration / 12A no."
                            : "Resolution no."}{" "}
                          <span
                            style={{
                              textTransform: "none",
                              letterSpacing: 0,
                              color: "var(--muted)",
                            }}
                          >
                            · optional
                          </span>
                        </label>
                        <input
                          className="input"
                          value={f.orgReg || ""}
                          onChange={(e) => set("orgReg", e.target.value)}
                          placeholder="if handy"
                        />
                      </div>
                      <div>
                        <label
                          className="eyebrow"
                          style={{ display: "block", marginBottom: 6 }}
                        >
                          Your role
                        </label>
                        <input
                          className="input"
                          value={f.orgRole || ""}
                          onChange={(e) => set("orgRole", e.target.value)}
                          placeholder={
                            f.who === "ngo"
                              ? "e.g. field coordinator"
                              : "e.g. secretary"
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="eyebrow"
                        style={{ display: "block", marginBottom: 6 }}
                      >
                        Letter / resolution{" "}
                        <span
                          style={{
                            textTransform: "none",
                            letterSpacing: 0,
                            color: "var(--muted)",
                          }}
                        >
                          · optional, speeds verification
                        </span>
                      </label>
                      <button
                        onClick={() => set("orgDoc", !f.orgDoc)}
                        className="placeholder-img"
                        style={{
                          width: "100%",
                          height: 56,
                          borderRadius: 8,
                          border: f.orgDoc ? "1px solid var(--moss)" : undefined,
                          cursor: "pointer",
                        }}
                      >
                        <span className="label">
                          {f.orgDoc
                            ? "✓ document attached (tap to remove)"
                            : "tap to attach a letter or panchayat resolution"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Your name
                  </label>
                  <input
                    className="input"
                    value={f.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Full name"
                  />
                  {showErr("name")}
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Phone
                  </label>
                  <input
                    className="input"
                    value={f.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 9XXXX XXXXX"
                    disabled={verified}
                  />
                  {showErr("phone")}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Where is it?
            </div>
            <div className="col" style={{ gap: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    District
                  </label>
                  <select
                    className="input"
                    value={f.district}
                    onChange={(e) => set("district", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    <option value="other">Other / not listed</option>
                  </select>
                  {showErr("district")}
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Village
                  </label>
                  <input
                    className="input"
                    value={f.village}
                    onChange={(e) => set("village", e.target.value)}
                    placeholder="Village name"
                  />
                  {showErr("village")}
                </div>
              </div>
              {needPlot && (
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Drop a location pin
                  </label>
                  <button
                    onClick={dropPin}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border:
                        "1px dashed " + (gps ? "var(--moss)" : "var(--line-2)"),
                      background: gps
                        ? "color-mix(in oklch, var(--moss-soft) 25%, var(--paper))"
                        : "var(--paper-2)",
                      color: "var(--ink)",
                      fontFamily: "inherit",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: "var(--terra)" }}>◉</span>
                    {gps
                      ? `Pin dropped · ${gps.lat}° N, ${gps.lng}° E (tap to redo)`
                      : "Tap to use my current location"}
                  </button>
                  {showErr("gps")}
                </div>
              )}
            </div>
          </div>

          {/* About the land */}
          {needPlot && (
            <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                About the land{" "}
                <span
                  style={{
                    textTransform: "none",
                    letterSpacing: 0,
                    color: "var(--muted)",
                  }}
                >
                  · rough is fine, we measure on the visit
                </span>
              </div>
              <div className="col" style={{ gap: 14 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <label
                      className="eyebrow"
                      style={{ display: "block", marginBottom: 6 }}
                    >
                      Rough size
                    </label>
                    <select
                      className="input"
                      value={f.size}
                      onChange={(e) => set("size", e.target.value)}
                    >
                      <option value="">Don&apos;t know</option>
                      <option>Under ½ acre</option>
                      <option>½ – 1 acre</option>
                      <option>1 – 3 acres</option>
                      <option>More than 3 acres</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="eyebrow"
                      style={{ display: "block", marginBottom: 6 }}
                    >
                      Water nearby?
                    </label>
                    <select
                      className="input"
                      value={f.water}
                      onChange={(e) => set("water", e.target.value)}
                    >
                      <option value="">Unsure</option>
                      <option>Yes — spring / naula / stream</option>
                      <option>Yes — borewell / tank</option>
                      <option>No water source close</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    What&apos;s on the land now?
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      "Bare / eroding",
                      "Degrading — patchy",
                      "Some trees left",
                      "Old farmland, unused",
                    ].map((o) => (
                      <button
                        key={o}
                        onClick={() => set("landState", o)}
                        className="tag"
                        style={chip(f.landState === o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  {showErr("landState")}
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Who owns / uses the land?
                  </label>
                  <input
                    className="input"
                    value={f.owner}
                    onChange={(e) => set("owner", e.target.value)}
                    placeholder="e.g. the farmer's family · Van Panchayat · community"
                  />
                  {showErr("owner")}
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Photo of the land · GPS camera required
                  </label>
                  <button
                    onClick={() => setPhoto(!photo)}
                    className="placeholder-img"
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      borderRadius: 8,
                      border: photo ? "1px solid var(--moss)" : undefined,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <span className="label">
                      {photo
                        ? "✓ GPS photo attached (tap to remove)"
                        : "tap to shoot with a GPS camera app"}
                    </span>
                    {photo && gps && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--paper)",
                          background:
                            "color-mix(in oklch, var(--ink) 78%, transparent)",
                          padding: "3px 7px",
                          borderRadius: 4,
                          letterSpacing: "0.03em",
                        }}
                      >
                        ◉ {gps.lat}° N, {gps.lng}° E · stamped on photo
                      </span>
                    )}
                  </button>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--muted)",
                      letterSpacing: "0.03em",
                      lineHeight: 1.5,
                    }}
                  >
                    Use a GPS-camera app (GPS Map Camera, Open Camera, etc.) so
                    the latitude &amp; longitude are printed onto the image. We
                    read the stamped coordinates to confirm the plot&apos;s real
                    location.
                  </div>
                  {showErr("photo")}
                </div>
              </div>
            </div>
          )}

          {/* About the farmer */}
          {needFarmer && (
            <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                About the farmer
              </div>
              <div className="col" style={{ gap: 14 }}>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Farmer&apos;s name
                  </label>
                  <input
                    className="input"
                    value={f.farmerName}
                    onChange={(e) => set("farmerName", e.target.value)}
                    placeholder="Full name"
                  />
                  {showErr("farmerName")}
                </div>
                <div>
                  <label
                    className="eyebrow"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Have they agreed to plant + tend trees?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      ["yes", "Yes, they've agreed"],
                      ["notyet", "Not yet — just a lead"],
                    ].map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => set("farmerAgreed", v)}
                        className="tag"
                        style={chip(f.farmerAgreed === v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  {showErr("farmerAgreed")}
                </div>
              </div>
            </div>
          )}

          {/* Anything else */}
          <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
            <label
              className="eyebrow"
              style={{ display: "block", marginBottom: 10 }}
            >
              Anything else?{" "}
              <span
                style={{
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "var(--muted)",
                }}
              >
                · optional · Hindi fine
              </span>
            </label>
            <textarea
              className="input"
              rows={3}
              value={f.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Why this land matters, who to talk to, best time to visit…"
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Verify + submit */}
          <div
            className="card frame"
            style={{ padding: 22, background: "var(--paper-2)" }}
          >
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Verify your phone to submit
            </div>
            {!verified ? (
              <div>
                {!otpSent ? (
                  <button
                    className="btn"
                    onClick={sendOtp}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Send me a code by SMS
                  </button>
                ) : (
                  <div>
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: 13,
                        color: "var(--ink-2)",
                      }}
                    >
                      Code sent to <strong>{f.phone}</strong>.{" "}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--muted)",
                        }}
                      >
                        (demo: type any 6 digits)
                      </span>
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        className="input"
                        value={otp}
                        onChange={(e) =>
                          checkOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="6-digit code"
                        inputMode="numeric"
                        style={{
                          letterSpacing: "0.3em",
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                      <button
                        className="btn ghost sm"
                        onClick={() => setOtpSent(false)}
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--moss)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                ✓ Phone verified — {f.phone}
              </div>
            )}

            <button
              className="btn moss"
              onClick={submit}
              disabled={!canSubmit || submitting}
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 16,
                opacity: canSubmit && !submitting ? 1 : 0.5,
                cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "Submitting…" : "Submit to the research queue"}{" "}
              {!submitting && <span className="arrow">→</span>}
            </button>
            {tries && !baseValid && (
              <div style={{ ...errStyle, textAlign: "center", marginTop: 10 }}>
                Please complete the highlighted fields above.
              </div>
            )}
            {tries && baseValid && !verified && (
              <div style={{ ...errStyle, textAlign: "center", marginTop: 10 }}>
                Verify your phone to submit.
              </div>
            )}
            {serverError && (
              <div style={{ ...errStyle, textAlign: "center", marginTop: 10 }}>
                {serverError}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: rail */}
        <div className="contribute-rail">
          <div className="card frame" style={{ padding: 22, marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              How your submission is checked
            </div>
            <div
              className="col"
              style={{ gap: 12, fontSize: 13, color: "var(--ink-2)" }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--moss)" }}>1</span>
                <span>
                  <strong>Phone verified</strong> — a real, reachable number. No
                  account, no password.
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--moss)" }}>2</span>
                <span>
                  <strong>Photo + GPS</strong> — proof the land is real, so we
                  can find it.
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--moss)" }}>3</span>
                <span>
                  <strong>Operator review</strong> — nothing shows on the map
                  until we&apos;ve visited in person.
                </span>
              </div>
            </div>
          </div>

          <div className="card frame" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Verification so far
            </div>
            {["phone verified", "GPS present", "photo attached", "vouched by org"].map(
              (item) => {
                const on = trust.includes(item);
                return (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 0",
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${on ? "var(--moss)" : "var(--line-2)"}`,
                        background: on ? "var(--moss)" : "transparent",
                        flexShrink: 0,
                      }}
                    ></div>
                    <span style={{ color: on ? "var(--ink)" : "var(--muted)" }}>
                      {item}
                    </span>
                  </div>
                );
              },
            )}
            <div
              style={{
                marginTop: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.5,
              }}
            >
              Stronger signals = faster site visit. NGO / panchayat submissions
              are prioritised.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
