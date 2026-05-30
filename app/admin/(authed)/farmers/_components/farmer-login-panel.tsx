"use client";

import { useActionState } from "react";
import {
  createFarmerLogin,
  deleteFarmerLogin,
  resetFarmerPassword,
  type FarmerLoginActionState,
  type FarmerLoginStatus,
} from "../login-actions";

const initialState: FarmerLoginActionState = { error: null };

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  background: "var(--paper-2)",
  border: "1px solid var(--line-2)",
  borderRadius: 6,
  color: "var(--ink)",
  boxSizing: "border-box",
};

const sectionStyle: React.CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: 22,
  marginBottom: 18,
};

const sectionHeader: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 14,
};

interface Props {
  farmerId: string;
  farmerName: string;
  status: FarmerLoginStatus;
}

export function FarmerLoginPanel({ farmerId, farmerName, status }: Props) {
  if (status.hasLogin) {
    return <ResetForm farmerId={farmerId} status={status} />;
  }
  return <CreateForm farmerId={farmerId} farmerName={farmerName} />;
}

function CreateForm({
  farmerId,
  farmerName,
}: {
  farmerId: string;
  farmerName: string;
}) {
  const bound = createFarmerLogin.bind(null, farmerId);
  const [state, formAction, pending] = useActionState(bound, initialState);

  return (
    <section style={sectionStyle}>
      <div style={sectionHeader}>login access</div>
      <p
        style={{
          margin: "0 0 16px",
          fontSize: 13,
          color: "var(--ink-2)",
          lineHeight: 1.55,
        }}
      >
        Create an email + password for {farmerName} so they can sign in at{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          /farmer/login
        </code>{" "}
        and manage their trees. Share the credentials with them in person.
      </p>

      <form action={formAction}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <div>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="farmer@example.com"
              disabled={pending}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Initial password</label>
            <input
              name="password"
              type="text"
              required
              minLength={8}
              placeholder="At least 8 characters"
              disabled={pending}
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "var(--muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Write it down to share with the farmer.
            </div>
          </div>
        </div>

        {state.error && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background:
                "color-mix(in oklch, var(--terra-soft) 35%, var(--paper))",
              border: "1px solid var(--terra)",
              borderRadius: 6,
              color: "var(--terra)",
              fontSize: 13,
            }}
          >
            {state.error}
          </div>
        )}
        {state.ok && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background:
                "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))",
              border: "1px solid var(--moss)",
              borderRadius: 6,
              color: "var(--moss)",
              fontSize: 13,
            }}
          >
            ✓ Login created. {farmerName} can now sign in at /farmer/login.
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 16,
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid var(--moss)",
            background: pending ? "var(--paper-2)" : "var(--moss)",
            color: pending ? "var(--muted)" : "var(--paper)",
            fontSize: 14,
            fontFamily: "inherit",
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {pending ? "Creating account..." : "Create login"}
        </button>
      </form>
    </section>
  );
}

function ResetForm({
  farmerId,
  status,
}: {
  farmerId: string;
  status: FarmerLoginStatus;
}) {
  const bound = resetFarmerPassword.bind(null, farmerId);
  const [state, formAction, pending] = useActionState(bound, initialState);

  return (
    <section style={sectionStyle}>
      <div style={sectionHeader}>login access</div>
      <div
        style={{
          padding: "12px 14px",
          background: "var(--paper-2)",
          border: "1px solid var(--line-2)",
          borderRadius: 6,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            email
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              color: "var(--ink)",
            }}
          >
            {status.email ?? "—"}
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--moss)",
            border: "1px solid var(--moss)",
            padding: "2px 8px",
            borderRadius: 4,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          ✓ login active
        </span>
      </div>

      <form action={formAction}>
        <label style={labelStyle}>Reset password</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="New password (at least 8 characters)"
            disabled={pending}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)", flex: 1 }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid var(--terra)",
              background: pending ? "var(--paper-2)" : "transparent",
              color: pending ? "var(--muted)" : "var(--terra)",
              fontSize: 14,
              fontFamily: "inherit",
              cursor: pending ? "wait" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {pending ? "Saving..." : "Reset password"}
          </button>
        </div>

        {state.error && (
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
            {state.error}
          </div>
        )}
        {state.ok && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background:
                "color-mix(in oklch, var(--moss-soft) 40%, var(--paper))",
              border: "1px solid var(--moss)",
              borderRadius: 6,
              color: "var(--moss)",
              fontSize: 13,
            }}
          >
            ✓ Password reset. Share the new one with the farmer.
          </div>
        )}
      </form>

      <hr className="dotted-rule" style={{ margin: "20px 0 14px" }} />

      <form
        action={deleteFarmerLogin.bind(null, farmerId)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Wrong email or want to start over? Delete the login and create a new
          one. The farmer record stays — only the auth account is removed.
        </div>
        <button
          type="submit"
          onClick={(e) => {
            if (
              !confirm(
                "Delete this farmer's login? They won't be able to sign in until you create a new one.",
              )
            ) {
              e.preventDefault();
            }
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid var(--terra)",
            background: "transparent",
            color: "var(--terra)",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Delete login
        </button>
      </form>
    </section>
  );
}
