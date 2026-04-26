"use client";

/**
 * Root-level error UI — must not depend on root layout or Providers
 * (no wagmi/redux/theme). Required own <html>/<body> per App Router.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/global-error
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui", background: "#0a0008", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
        {process.env.NODE_ENV === "development" && error?.digest ? (
          <p style={{ opacity: 0.7, fontSize: "0.875rem" }}>Digest: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(139,35,152,0.35)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
