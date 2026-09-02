interface ContactNotificationTemplateProps {
  userName: string;
  userEmail: string;
  message: string;
}

export function ContactNotificationTemplate({
  userName,
  userEmail,
  message,
}: ContactNotificationTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#FAFAFA",
        padding: "40px 20px",
        color: "#18181b",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "32px",
          overflow: "hidden",
          border: "1px solid rgba(255,165,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#ffa500",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            New Contact Inquiry
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "40px" }}>
          <div style={{ marginBottom: "30px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "900",
                marginBottom: "10px",
              }}
            >
              Lead: <span style={{ color: "#ffa500" }}>{userName}</span>
            </h2>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                opacity: "0.6",
                margin: 0,
              }}
            >
              Email: <strong>{userEmail}</strong>
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#FAFAFA",
              borderRadius: "24px",
              padding: "30px",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "1px",
                opacity: "0.4",
                margin: "0 0 10px 0",
              }}
            >
              Message Details
            </h3>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                fontWeight: "600",
                opacity: "0.8",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#FAFAFA",
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: "700",
              opacity: "0.3",
              margin: 0,
            }}
          >
            Automated notification from Corban Technologies LTD Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
