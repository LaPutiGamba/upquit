import { Heading, Text, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout.js";
import { t } from "./translations/index.js";

interface WelcomeEmailProps {
  userName?: string;
  verificationUrl?: string;
  company?: string;
  locale?: string;
}

export default function WelcomeEmail({
  userName = "User",
  verificationUrl = "#",
  company = "UpQuit",
  locale = "en",
}: WelcomeEmailProps) {
  return (
    <EmailLayout locale={locale}>
      <Heading style={{ color: "#333", fontSize: "24px", margin: "0 0 20px" }}>
        {t(locale, "welcome", "heading", { company, userName })}
      </Heading>
      <Text style={{ color: "#555", fontSize: "16px", lineHeight: "1.5" }}>
        {t(locale, "welcome", "body")}
      </Text>
      <Link
        href={verificationUrl}
        style={{
          display: "inline-block",
          backgroundColor: "#007bff",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "16px",
          marginTop: "16px",
        }}
      >
        {t(locale, "welcome", "cta")}
      </Link>
      <Text style={{ color: "#999", fontSize: "12px", marginTop: "24px" }}>
        {t(locale, "welcome", "footer")}
      </Text>
    </EmailLayout>
  );
}
