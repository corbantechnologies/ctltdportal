interface OffersNotificationTemplateProps {
  userName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  offerTitle: string;
  offerSlug: string;
}

export function OffersNotificationTemplate({
  userName,
  phone,
  whatsapp,
  email,
  offerTitle,
  offerSlug,
}: OffersNotificationTemplateProps) {
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
            New Offer Claim Received
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
              Interested in: <strong>{offerTitle}</strong>
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
                margin: "0 0 20px 0",
              }}
            >
              Contact Details
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  opacity: "0.5",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                PHONE NUMBER
              </span>
              <span style={{ fontSize: "16px", fontWeight: "900" }}>
                {phone}
              </span>
            </div>

            {whatsapp && (
              <div style={{ marginBottom: "15px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    opacity: "0.5",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  WHATSAPP NUMBER
                </span>
                <span style={{ fontSize: "16px", fontWeight: "900" }}>
                  {whatsapp}
                </span>
              </div>
            )}

            {email && (
              <div style={{ marginBottom: "15px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    opacity: "0.5",
                    display: "block",
                    marginBottom: "2px",
                  }}
                >
                  EMAIL ADDRESS
                </span>
                <span style={{ fontSize: "16px", fontWeight: "900" }}>
                  {email}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: "30px" }}>
            <a
              href={`https://corbantechnologies.org/offers/${offerSlug}`}
              style={{
                display: "block",
                textAlign: "center",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                padding: "16px",
                borderRadius: "16px",
                textDecoration: "none",
                fontWeight: "900",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              View Offer Details
            </a>
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
            Automated internal notification from Corban Technologies LTD Portal.
          </p>
        </div>
      </div>
    </div>
  );
}
