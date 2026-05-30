"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Chip,
  Ornament,
  Placeholder,
  Stamp,
  TreeViz,
  UPIQR,
  UttarakhandMap,
} from "@/components/shared";
import { MessageThread } from "@/components/messaging";
import { PlotCard } from "@/components/plot";
import { FarmerVerifiedCard } from "@/components/farmer-verified-card";
import { type District, type Farmer, type Plot, type Thread } from "@/lib/data";
import { useDistricts, useFarmers, usePlots } from "@/lib/db/hooks";
import { submitDonation } from "@/app/donate/actions";
import { compressImage } from "@/lib/image-compress";
import type { Screen } from "./types";

type PickerStep = "list" | "profile" | "pay" | "success";
type Plan = "plant" | "care" | "grove";

export function Picker({ navigate }: { navigate: (s: Screen) => void }) {
  const [step, setStep] = useState<PickerStep>("list");
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("care");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofSignedUrl, setProofSignedUrl] = useState<string | null>(null);
  const [treeNum, setTreeNum] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const districts = useDistricts() ?? [];
  const farmers = useFarmers() ?? [];
  const plots = usePlots() ?? [];

  const farmer = farmerId ? farmers.find((f) => f.id === farmerId) ?? null : null;
  const district = farmer ? districts.find((d) => d.id === farmer.districtId) ?? null : null;

  async function goToSuccess() {
    if (!farmer) return;
    if (!proofFile) {
      setSubmitError("Please attach your UPI payment screenshot first.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    let compressedBlob: Blob;
    try {
      const compressed = await compressImage(proofFile);
      compressedBlob = compressed.blob;
    } catch (e) {
      setSubmitting(false);
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(`Could not process the screenshot: ${msg}`);
      return;
    }

    const fd = new FormData();
    fd.set("farmer_id", farmer.id);
    fd.set("plan", plan);
    fd.set("donor_name", donorName);
    fd.set("donor_email", donorEmail);
    fd.set("donor_phone", donorPhone);
    fd.set("payment_method", "upi_manual");
    if (isAnonymous) fd.set("is_anonymous", "on");
    fd.set("payment_proof", compressedBlob, "payment-proof.jpg");

    const result = await submitDonation({ error: null }, fd);
    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    setTreeNum(result.reference ?? "—");
    setProofSignedUrl(result.paymentProofUrl ?? null);
    setStep("success");
  }

  if (step === "success" && farmer && treeNum) {
    return (
      <ThreadSuccess
        farmer={farmer}
        plan={plan}
        treeNum={treeNum}
        donorName={donorName || "You"}
        proofUrl={proofSignedUrl ?? proofPreviewUrl}
        navigate={navigate}
      />
    );
  }

  if (step === "pay" && farmer && district) {
    return (
      <PayFlow
        farmer={farmer}
        district={district}
        plan={plan}
        paymentConfirmed={paymentConfirmed}
        setPaymentConfirmed={setPaymentConfirmed}
        donorName={donorName}
        setDonorName={setDonorName}
        donorEmail={donorEmail}
        setDonorEmail={setDonorEmail}
        donorPhone={donorPhone}
        setDonorPhone={setDonorPhone}
        isAnonymous={isAnonymous}
        setIsAnonymous={setIsAnonymous}
        proofFile={proofFile}
        proofPreviewUrl={proofPreviewUrl}
        setProofFile={(f) => {
          setProofFile(f);
          if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
          setProofPreviewUrl(f ? URL.createObjectURL(f) : null);
        }}
        submitting={submitting}
        submitError={submitError}
        onBack={() => setStep("profile")}
        onDone={goToSuccess}
      />
    );
  }

  if (step === "profile" && farmer && district) {
    return (
      <FarmerProfile
        farmer={farmer}
        district={district}
        plots={plots.filter((p) => (farmer.plotIds ?? []).includes(p.id))}
        plan={plan}
        setPlan={setPlan}
        onBack={() => setStep("list")}
        onPay={() => setStep("pay")}
      />
    );
  }

  // LIST view
  const visibleFarmers = selectedDistrict
    ? farmers.filter((f) => f.districtId === selectedDistrict)
    : farmers;

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div style={{ marginBottom: 22 }}>
        <button
          className="btn ghost sm"
          onClick={() => navigate("home")}
          style={{ marginBottom: 18 }}
        >
          ← Home
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <Stamp color="var(--terra)" rotation={-2}>
                active pilot
              </Stamp>
              <Chip>Uttarakhand · India</Chip>
              <Chip>
                {farmers.length} farmers · {districts.length} districts
              </Chip>
            </div>
            <h1 style={{ fontSize: 64, lineHeight: 1.02 }}>
              Meet the people
              <br />
              <em>doing the work</em>.
            </h1>
          </div>
          <p style={{ color: "var(--ink-2)", maxWidth: 360, fontSize: 16 }}>
            Every farmer here was introduced through a village panchayat or a
            local foundation. We&apos;ve visited every plot. Read their story,
            then pay them directly.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 28,
          marginTop: 28,
          alignItems: "start",
        }}
      >
        <div style={{ position: "sticky", top: 88 }}>
          <UttarakhandMap
            pins={districts}
            selected={selectedDistrict}
            onSelect={(id) =>
              setSelectedDistrict(id === selectedDistrict ? null : id)
            }
            height={440}
          />
          <div
            style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            <button
              onClick={() => setSelectedDistrict(null)}
              className="tag"
              style={{
                background: !selectedDistrict ? "var(--ink)" : "var(--paper)",
                color: !selectedDistrict ? "var(--paper)" : "var(--ink-2)",
                border: `1px solid ${!selectedDistrict ? "var(--ink)" : "var(--line)"}`,
                cursor: "pointer",
                padding: "5px 12px",
              }}
            >
              All districts
            </button>
            {districts.map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setSelectedDistrict(d.id === selectedDistrict ? null : d.id)
                }
                className="tag"
                style={{
                  background:
                    selectedDistrict === d.id ? "var(--moss)" : "var(--paper)",
                  color:
                    selectedDistrict === d.id ? "var(--paper)" : "var(--ink-2)",
                  border: `1px solid ${selectedDistrict === d.id ? "var(--moss)" : "var(--line)"}`,
                  cursor: "pointer",
                  padding: "5px 12px",
                }}
              >
                {d.name}
              </button>
            ))}
          </div>

          {selectedDistrict && (
            <div
              className="card"
              style={{
                background: "var(--paper-2)",
                padding: 18,
                marginTop: 14,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                About {districts.find((d) => d.id === selectedDistrict)?.name}
              </div>
              <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 13 }}>
                {districts.find((d) => d.id === selectedDistrict)?.why}
              </p>
            </div>
          )}
        </div>

        <div className="col" style={{ gap: 18 }}>
          {visibleFarmers.map((f) => {
            const d = districts.find((x) => x.id === f.districtId);
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFarmerId(f.id);
                  setStep("profile");
                }}
                className="card frame"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", gap: 16 }}>
                  <Placeholder
                    label={f.name.split(" ")[0]}
                    tone={f.photoTone === "neutral" ? "neutral" : f.photoTone}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 14,
                      flexShrink: 0,
                    }}
                    aspect={null}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 26,
                          }}
                        >
                          {f.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--muted)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {f.village} · {d?.elevation}
                        </div>
                      </div>
                      <Chip tone={d?.priority === "critical" ? "terra" : ""}>
                        {d?.priority}
                      </Chip>
                    </div>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 16,
                        lineHeight: 1.4,
                        color: "var(--ink-2)",
                      }}
                    >
                      &quot;{f.quoteEn}&quot;
                    </p>
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {f.plants.map((p) => (
                        <span
                          key={p}
                          className="tag"
                          style={{ fontSize: 10 }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <hr className="dotted-rule" style={{ margin: "16px 0" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 18,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--muted)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span>{f.years} yrs</span>
                    <span>{f.treesPlanted} planted</span>
                    <span>
                      {Math.round((f.treesAlive / f.treesPlanted) * 100)}% alive
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                      }}
                    >
                      ₹{f.rate}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      per tree
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {visibleFarmers.length === 0 && (
            <div
              className="card"
              style={{
                background: "var(--paper-2)",
                padding: 32,
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              No farmers yet in this district. We&apos;re recruiting — let us
              know if you know someone.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Farmer profile -----
function FarmerProfile({
  farmer,
  district,
  plots,
  plan,
  setPlan,
  onBack,
  onPay,
}: {
  farmer: Farmer;
  district: District;
  plots: Plot[];
  plan: Plan;
  setPlan: (p: Plan) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <button
        className="btn ghost sm"
        onClick={onBack}
        style={{ marginBottom: 22 }}
      >
        ← All farmers
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 36,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Placeholder
              label={farmer.name.split(" ")[0]}
              tone={farmer.photoTone === "neutral" ? "neutral" : farmer.photoTone}
              style={{
                width: 112,
                height: 112,
                borderRadius: "50%",
                flexShrink: 0,
              }}
              aspect={null}
            />
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                {farmer.village} · {district.name}
              </div>
              <h1 style={{ fontSize: 56, lineHeight: 1 }}>{farmer.name}</h1>
              <div
                style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                <Chip>{farmer.years} yrs farming</Chip>
                <Chip>{farmer.plot}</Chip>
                <Chip tone="terra">{district.elevation}</Chip>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              background: "color-mix(in oklch, var(--terra-soft) 50%, var(--paper))",
              borderRadius: 12,
              borderLeft: "3px solid var(--terra)",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.4,
              }}
            >
              &quot;{farmer.quoteEn}&quot;
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--muted)",
              }}
            >
              — {farmer.quote}
            </div>
          </div>

          <Ornament
            label={`${farmer.name.split(" ")[0]}-ji's ${plots.length > 1 ? "plots" : "plot"} · the actual land`}
          />
          <div style={{ height: 16 }} />
          <div
            className="col"
            style={{ gap: 18, marginBottom: 28 }}
          >
            {plots.length > 0 ? (
              plots.map((p) => <PlotCard key={p.id} plot={p} />)
            ) : (
              <Placeholder
                label="plot details coming soon"
                tone="moss"
                aspect="16/9"
              />
            )}
          </div>

          <Ornament label={`Why we plant in ${district.name}`} />
          <div style={{ height: 16 }}></div>
          <div className="card" style={{ background: "var(--paper-2)", padding: 22 }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontStyle: "italic",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {district.why}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 18,
                marginTop: 22,
              }}
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  Soil
                </div>
                <div style={{ fontSize: 14 }}>{district.soil}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  Rainfall
                </div>
                <div style={{ fontSize: 14 }}>{district.rainfall}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  Elevation
                </div>
                <div style={{ fontSize: 14 }}>{district.elevation}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Ornament label={`What ${farmer.name.split(" ")[0]} plants`} />
            <div style={{ height: 16 }}></div>
            <div className="grid-3">
              {farmer.plants.map((s, i) => (
                <div key={s} className="card frame" style={{ padding: 18 }}>
                  <TreeViz stage={(2 + (i % 2)) as 2 | 3} height={140} />
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 18,
                    }}
                  >
                    {s}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Ornament
              label={`${farmer.name.split(" ")[0]}-ji's charter · verified planter`}
            />
            <div style={{ height: 16 }}></div>
            <FarmerVerifiedCard farmer={farmer} plots={plots} />
          </div>
        </div>

        <div style={{ position: "sticky", top: 88 }}>
          <div className="card frame" style={{ padding: 22, position: "relative" }}>
            <div style={{ position: "absolute", top: -10, right: 16 }}>
              <Stamp color="var(--moss)" rotation={3}>
                100% to farmer
              </Stamp>
            </div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Pay {farmer.name.split(" ")[0]}-ji directly
            </div>

            <div className="col" style={{ gap: 10 }}>
              {([
                { id: "plant" as const, label: "Plant one tree", price: farmer.rate, note: "Sapling + planting only. No follow-up watering.", popular: false },
                { id: "care" as const, label: "Plant + care for 1 year", price: farmer.rateCare, note: "Sapling, watering through dry season, replanting if it dies.", popular: true },
                { id: "grove" as const, label: "Grove of 5 (with care)", price: farmer.rateCare * 5, note: "Mixed species. Best for gifting or honoring someone.", popular: false },
              ]).map((opt) => (
                <label
                  key={opt.id}
                  className="card"
                  style={{
                    cursor: "pointer",
                    padding: 14,
                    border:
                      plan === opt.id
                        ? "1.5px solid var(--moss)"
                        : "1px solid var(--line)",
                    background:
                      plan === opt.id
                        ? "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))"
                        : "var(--paper)",
                    position: "relative",
                  }}
                >
                  {opt.popular && (
                    <div style={{ position: "absolute", top: -8, right: 12 }}>
                      <Stamp
                        color="var(--terra)"
                        rotation={3}
                        style={{ fontSize: 9, padding: "2px 6px" }}
                      >
                        popular
                      </Stamp>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="radio"
                      name="plan"
                      checked={plan === opt.id}
                      onChange={() => setPlan(opt.id)}
                      style={{
                        marginTop: 4,
                        accentColor: "oklch(0.42 0.085 145)",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 18,
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 20,
                          }}
                        >
                          ₹{opt.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div
                        style={{
                          color: "var(--muted)",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {opt.note}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <hr className="dotted-rule" style={{ margin: "18px 0" }} />

            <button
              className="btn moss"
              onClick={onPay}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Pay ₹
              {(plan === "plant"
                ? farmer.rate
                : plan === "care"
                  ? farmer.rateCare
                  : farmer.rateCare * 5
              ).toLocaleString("en-IN")}{" "}
              via UPI <span className="arrow">→</span>
            </button>

            <div
              style={{
                marginTop: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                textAlign: "center",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Opens GPay · PhonePe · Paytm · BHIM
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: "var(--paper-2)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--ink-2)",
              }}
            >
              ✦ <strong>Photo proof within 7 days.</strong> If we can&apos;t
              verify the planting, we refund you and remove the farmer from our
              list.
            </div>
          </div>

          <div
            className="card"
            style={{
              marginTop: 18,
              padding: 18,
              background: "var(--paper-2)",
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Track record
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  {farmer.treesPlanted}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  trees planted
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  {Math.round((farmer.treesAlive / farmer.treesPlanted) * 100)}%
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  still alive
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  {farmer.donorsThisYear}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  donors this year
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  {farmer.pendingTrees}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ready to plant
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Payment screenshot picker (mobile-friendly) -----
function ProofPicker({
  proofFile,
  proofPreviewUrl,
  setProofFile,
}: {
  proofFile: File | null;
  proofPreviewUrl: string | null;
  setProofFile: (f: File | null) => void;
}) {
  const inputId = "payment-proof-input";
  const kb = proofFile ? Math.round(proofFile.size / 1024) : 0;

  return (
    <div
      style={{
        marginTop: 6,
        padding: 14,
        background: proofFile
          ? "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))"
          : "var(--paper-2)",
        border: `1px ${proofFile ? "solid var(--moss)" : "dashed var(--line-2)"}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div className="eyebrow">Payment screenshot · required</div>
        {proofFile && (
          <button
            type="button"
            onClick={() => setProofFile(null)}
            style={{
              background: "none",
              border: 0,
              color: "var(--terra)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 0,
            }}
          >
            remove ×
          </button>
        )}
      </div>

      <p
        style={{
          margin: "6px 0 12px",
          fontSize: 12,
          color: "var(--ink-2)",
          lineHeight: 1.45,
        }}
      >
        Take a screenshot of the successful UPI payment (any UPI app) and attach
        it here. We compress it before upload — works on slow connections.
      </p>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setProofFile(f);
        }}
        style={{ display: "none" }}
      />

      {proofFile && proofPreviewUrl ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofPreviewUrl}
            alt="Payment screenshot preview"
            style={{
              width: 72,
              height: 72,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid var(--moss)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--moss)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              ✓ attached
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-2)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {proofFile.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                marginTop: 2,
              }}
            >
              {kb}KB · will compress before upload
            </div>
          </div>
          <label
            htmlFor={inputId}
            className="btn ghost sm"
            style={{ cursor: "pointer", whiteSpace: "nowrap" }}
          >
            replace
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="btn"
          style={{
            display: "inline-flex",
            cursor: "pointer",
            background: "var(--paper)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
        >
          📷 Choose screenshot
        </label>
      )}
    </div>
  );
}

// ----- UPI Pay Flow -----
function PayFlow({
  farmer,
  district,
  plan,
  paymentConfirmed,
  setPaymentConfirmed,
  donorName,
  setDonorName,
  donorEmail,
  setDonorEmail,
  donorPhone,
  setDonorPhone,
  isAnonymous,
  setIsAnonymous,
  proofFile,
  proofPreviewUrl,
  setProofFile,
  submitting,
  submitError,
  onBack,
  onDone,
}: {
  farmer: Farmer;
  district: District;
  plan: Plan;
  paymentConfirmed: boolean;
  setPaymentConfirmed: (v: boolean) => void;
  donorName: string;
  setDonorName: (v: string) => void;
  donorEmail: string;
  setDonorEmail: (v: string) => void;
  donorPhone: string;
  setDonorPhone: (v: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  proofFile: File | null;
  proofPreviewUrl: string | null;
  setProofFile: (f: File | null) => void;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onDone: () => void;
}) {
  const amount =
    plan === "plant"
      ? farmer.rate
      : plan === "care"
        ? farmer.rateCare
        : farmer.rateCare * 5;
  const upiLink = `upi://pay?pa=${farmer.upi}&pn=${encodeURIComponent(farmer.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`PlantTree-${farmer.id}`)}`;

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <button
        className="btn ghost sm"
        onClick={onBack}
        style={{ marginBottom: 22 }}
      >
        ← Back to {farmer.name.split(" ")[0]}&apos;s profile
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Step 1 of 2 · pay {farmer.name.split(" ")[0]}-ji
          </div>
          <h2 style={{ marginBottom: 16 }}>
            Send <em>₹{amount.toLocaleString("en-IN")}</em> directly via UPI
          </h2>
          <p style={{ color: "var(--ink-2)", maxWidth: 480 }}>
            Pick one of these methods. The money goes to{" "}
            <strong>{farmer.name}&apos;s</strong> bank account in {district.name} —
            not to PlantTree.life. We never see it.
          </p>

          <div
            className="card frame"
            style={{
              marginTop: 24,
              padding: 24,
              display: "flex",
              gap: 22,
              alignItems: "center",
            }}
          >
            <UPIQR upi={farmer.upi} size={180} label="Scan with any UPI app" />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Method 1
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  marginBottom: 8,
                }}
              >
                Scan the QR
              </div>
              <p
                style={{
                  color: "var(--ink-2)",
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Open GPay, PhonePe, Paytm, or any UPI app on your phone and scan
                this QR. The amount pre-fills to ₹{amount.toLocaleString("en-IN")}.
              </p>
            </div>
          </div>

          <div className="card frame" style={{ marginTop: 16, padding: 24 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Method 2
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                marginBottom: 12,
              }}
            >
              Copy the UPI ID
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--paper-2)",
                padding: 14,
                borderRadius: 8,
                border: "1px dashed var(--line-2)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                  color: "var(--ink)",
                }}
              >
                {farmer.upi}
              </div>
              <button
                className="btn sm"
                onClick={() => {
                  navigator.clipboard?.writeText(farmer.upi);
                }}
              >
                Copy
              </button>
            </div>
            <p style={{ marginTop: 12, color: "var(--ink-2)", fontSize: 13 }}>
              Send <strong>₹{amount.toLocaleString("en-IN")}</strong> with
              reference{" "}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "var(--paper-2)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                PlantTree-{farmer.id}
              </span>
            </p>
          </div>

          <div className="card frame" style={{ marginTop: 16, padding: 24 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Method 3 · phone only
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                marginBottom: 8,
              }}
            >
              Open my UPI app
            </div>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: 13,
                margin: "0 0 14px",
              }}
            >
              On a phone, this opens your default UPI app with everything
              pre-filled.
            </p>
            <a href={upiLink} className="btn moss" style={{ textDecoration: "none" }}>
              Pay ₹{amount.toLocaleString("en-IN")} now{" "}
              <span className="arrow">→</span>
            </a>
          </div>
        </div>

        <div style={{ position: "sticky", top: 88 }}>
          <div className="card frame" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Step 2 of 2 · tell us you paid
            </div>
            <h3 style={{ marginBottom: 8 }}>Confirm your payment</h3>
            <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 0 }}>
              After paying, fill this in and attach your UPI payment screenshot.
              The screenshot lands in your private thread with{" "}
              {farmer.name.split(" ")[0]}-ji as soon as our team verifies it.
            </p>

            <div className="col" style={{ gap: 12, marginTop: 16 }}>
              <label>
                <div
                  className="eyebrow"
                  style={{
                    marginBottom: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <span>
                    Your name {isAnonymous ? "(for our records only)" : "(for the certificate)"}
                  </span>
                </div>
                <input
                  className="input"
                  placeholder={isAnonymous ? "Still recorded internally" : "Aditya M."}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 2,
                  fontSize: 13,
                  color: "var(--ink-2)",
                }}
              >
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{
                    marginTop: 3,
                    accentColor: "oklch(0.42 0.085 145)",
                  }}
                />
                <span>
                  Donate <strong>anonymously</strong> · {farmer.name.split(" ")[0]}-ji
                  and the public will see &ldquo;Anonymous&rdquo; instead of your
                  name. You can still log in to follow your tree.
                </span>
              </label>
              <label>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Email · for updates
                </div>
                <input
                  className="input"
                  placeholder="aditya@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
              </label>
              <label>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Phone · for SMS notifications
                </div>
                <input
                  className="input"
                  placeholder="+91 9XXXX XXXXX"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                />
              </label>

              <ProofPicker
                proofFile={proofFile}
                proofPreviewUrl={proofPreviewUrl}
                setProofFile={setProofFile}
              />

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  marginTop: 6,
                  fontSize: 13,
                  color: "var(--ink-2)",
                }}
              >
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  style={{
                    marginTop: 3,
                    accentColor: "oklch(0.42 0.085 145)",
                  }}
                />
                <span>
                  I&apos;ve paid{" "}
                  <strong>₹{amount.toLocaleString("en-IN")}</strong> to{" "}
                  {farmer.name}&apos;s UPI. I understand PlantTree.life never
                  received my money — it went directly to the farmer.
                </span>
              </label>
            </div>

            <button
              className="btn moss"
              disabled={!paymentConfirmed || !proofFile || submitting}
              onClick={onDone}
              style={{
                marginTop: 18,
                width: "100%",
                justifyContent: "center",
                opacity:
                  paymentConfirmed && proofFile && !submitting ? 1 : 0.4,
                cursor:
                  paymentConfirmed && proofFile && !submitting
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {submitting
                ? "Submitting your donation..."
                : `I've paid — open my chat with ${farmer.name.split(" ")[0]}-ji`}{" "}
              {!submitting && <span className="arrow">→</span>}
            </button>

            {submitError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background:
                    "color-mix(in oklch, var(--terra-soft) 35%, var(--paper))",
                  border: "1px solid var(--terra)",
                  borderRadius: 6,
                  color: "var(--terra)",
                  fontSize: 13,
                }}
              >
                {submitError}
              </div>
            )}
          </div>

          <div
            className="card"
            style={{
              marginTop: 16,
              padding: 16,
              background: "var(--paper-2)",
              fontSize: 12,
              color: "var(--ink-2)",
            }}
          >
            <strong>What happens next:</strong>
            <ol
              style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.7 }}
            >
              <li>
                Our team verifies your screenshot, then opens a private thread
                between you and {farmer.name.split(" ")[0]}-ji
              </li>
              <li>
                {farmer.name.split(" ")[0]}-ji plants within 7 days · posts
                photo
              </li>
              <li>All updates land on your private tree page</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Thread-based Success -----
function ThreadSuccess({
  farmer,
  plan,
  treeNum,
  donorName,
  proofUrl,
  navigate,
}: {
  farmer: Farmer;
  plan: Plan;
  treeNum: string;
  donorName: string;
  proofUrl: string | null;
  navigate: (s: Screen) => void;
}) {
  const amount =
    plan === "plant"
      ? farmer.rate
      : plan === "care"
        ? farmer.rateCare
        : farmer.rateCare * 5;
  const tier =
    plan === "plant"
      ? "plant only"
      : plan === "care"
        ? "plant + 1 yr care"
        : "grove of 5";
  const speciesName = farmer.plants[0];

  const initialThread: Thread = useMemo(
    () => ({
      treeId: treeNum,
      donor: donorName,
      farmerId: farmer.id,
      messages: [
        {
          id: "sys-open",
          from: "system",
          time: "just now",
          kind: "thread-open",
          text: `Thread opened · ₹${amount.toLocaleString("en-IN")} paid to ${farmer.name.split(" ")[0]}-ji · ${speciesName} · ${tier}`,
        },
        ...(proofUrl
          ? [
              {
                id: "local-proof",
                from: "donor" as const,
                time: "just now",
                kind: "payment-proof" as const,
                caption: "Payment screenshot",
                photoUrl: proofUrl,
              },
            ]
          : []),
      ],
    }),
    [treeNum, donorName, farmer, amount, tier, speciesName, proofUrl],
  );

  // If the parent passed a blob: URL (Supabase signing failed and we fell back
  // to the local preview), revoke it on unmount. Signed Storage URLs are
  // plain https and need no cleanup.
  useEffect(() => {
    return () => {
      if (proofUrl?.startsWith("blob:")) URL.revokeObjectURL(proofUrl);
    };
  }, [proofUrl]);

  return (
    <div className="shell" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <Stamp color="var(--moss)" rotation={-2}>
          Donation #{treeNum} received · verification pending
        </Stamp>
        <h1 style={{ marginTop: 20, marginBottom: 14, fontSize: 56 }}>
          You&apos;re in the same room as{" "}
          <em>{farmer.name.split(" ")[0]}-ji</em> now.
        </h1>
        <p
          style={{
            color: "var(--ink-2)",
            fontSize: 17,
            lineHeight: 1.55,
            maxWidth: 620,
            margin: "0 auto",
          }}
        >
          A private thread just opened between you and the farmer. Send a quick
          hello, attach your payment screenshot, and the planting starts within
          a week.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <MessageThread
            thread={initialThread}
            farmer={farmer}
            donorName={donorName}
            height={560}
          />
          <div
            style={{
              marginTop: 14,
              padding: "12px 18px",
              background:
                "color-mix(in oklch, var(--moss-soft) 30%, var(--paper))",
              border: "1px dashed var(--moss)",
              borderRadius: 10,
              fontSize: 13,
              color: "var(--ink-2)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "var(--moss)" }}>✓</span>
            <span>
              <strong>Screenshot received.</strong>{" "}
              {farmer.name.split(" ")[0]}-ji will see it as soon as our team
              verifies the payment — and will respond when the sapling is in the
              ground, usually within 3–7 days.
            </span>
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="card frame" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              What happens next
            </div>
            {[
              { d: "Now", t: "Receipt + private tree page emailed to you" },
              {
                d: "Today",
                t: `${farmer.name.split(" ")[0]}-ji sees the thread and replies`,
              },
              {
                d: "Within 7 days",
                t: "Sapling planted · photo posted in-thread",
              },
              { d: "Every 2 months", t: "Growth update with photo" },
              { d: "Year 1", t: "Survived the first dry season" },
            ].map((s, i, a) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "10px 0",
                  borderBottom:
                    i < a.length - 1 ? "1px dotted var(--line-2)" : "none",
                }}
              >
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
                <div style={{ flex: 1, fontSize: 14 }}>{s.t}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18, background: "var(--paper-2)" }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Your tree page
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.55,
              }}
            >
              Every photo, milestone and message from{" "}
              {farmer.name.split(" ")[0]}-ji will also appear on your private
              tree page — viewable forever, shareable with anyone.
            </p>
            <button
              className="btn ghost sm"
              style={{ marginTop: 12 }}
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/donor";
              }}
            >
              Go to my trees <span className="arrow">→</span>
            </button>
          </div>

          <div
            style={{
              padding: 14,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            prototype · no real money moved
          </div>
        </div>
      </div>
    </div>
  );
}
