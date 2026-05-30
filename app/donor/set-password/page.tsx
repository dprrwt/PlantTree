"use client";

import { useActionState } from "react";
import { setDonorPassword, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

export default function SetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    setDonorPassword,
    initialState,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "36px 32px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--moss)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          your grove · first time
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 38,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Set a <em>password</em>
        </h1>
        <p
          style={{
            color: "var(--ink-2)",
            marginTop: 10,
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Your tree is ready. Choose a password and you&apos;ll be taken to
          your grove. Future visits, just sign in with this email + password.
        </p>

        <form action={formAction} style={{ marginTop: 24 }}>
          <label
            style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            New password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
            disabled={pending}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              fontFamily: "inherit",
              background: "var(--paper-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 8,
              color: "var(--ink)",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            Confirm password
          </label>
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              fontFamily: "inherit",
              background: "var(--paper-2)",
              border: "1px solid var(--line-2)",
              borderRadius: 8,
              color: "var(--ink)",
              boxSizing: "border-box",
            }}
          />

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
                lineHeight: 1.5,
              }}
            >
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "13px 22px",
              borderRadius: 8,
              border: "1px solid var(--moss)",
              background: pending ? "var(--paper-2)" : "var(--moss)",
              color: pending ? "var(--muted)" : "var(--paper)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: pending ? "wait" : "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {pending ? "Saving..." : "Set password & view my grove"}
          </button>
        </form>
      </div>
    </div>
  );
}
