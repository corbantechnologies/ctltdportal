interface OffersTemplateProps {
  userName: string;
  offerTitle: string;
}

export function OffersTemplate({ userName, offerTitle }: OffersTemplateProps) {
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
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#000000",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: "900",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Corban <span style={{ color: "#ffa500" }}>Technologies</span>
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: "40px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Hello {userName},{" "}
            <span style={{ color: "#ffa500" }}>Claim Received!</span>
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              fontWeight: "600",
              opacity: "0.7",
              marginBottom: "30px",
            }}
          >
            Thank you for your interest in our <strong>{offerTitle}</strong>.
            We&apos;ve successfully received your claim request and our team is
            already on it.
          </p>

          <div
            style={{
              backgroundColor: "#FFF7ED",
              border: "1px solid #FFEDD5",
              borderRadius: "24px",
              padding: "24px",
              marginBottom: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#ffa500",
                margin: "0 0 10px 0",
              }}
            >
              What&apos;s Next?
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                fontWeight: "700",
                opacity: "0.8",
                margin: 0,
              }}
            >
              One of our solution architects will reach out to you within the
              next 24 hours via phone or WhatsApp to discuss your project
              requirements and finalize the details of this offer.
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "700",
                opacity: "0.5",
                marginBottom: "20px",
              }}
            >
              Need immediate assistance?
            </p>
            <a
              href="https://wa.me/254768978865"
              style={{
                display: "inline-block",
                backgroundColor: "#25D366",
                color: "#FFFFFF",
                padding: "16px 32px",
                borderRadius: "16px",
                textDecoration: "none",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            backgroundColor: "#FAFAFA",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              opacity: "0.4",
              margin: 0,
            }}
          >
            &copy; 2026 Corban Technologies LTD. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "10px",
              fontWeight: "600",
              opacity: "0.3",
              marginTop: "10px",
            }}
          >
            Building the infrastructure that powers East African growth.
          </p>
        </div>
      </div>
    </div>
  );
}
