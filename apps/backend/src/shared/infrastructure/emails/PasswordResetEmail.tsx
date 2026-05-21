import { Heading, Text, Link } from "@react-email/components";
import EmailLayout from "./EmailLayout.js";
import { t } from "./translations/index.js";

interface PasswordResetEmailProps {
  resetUrl?: string;
  company?: string;
  locale?: string;
}

export default function PasswordResetEmail({
  resetUrl = "#",
  company = "UpQuit",
  locale = "en",
}: PasswordResetEmailProps) {
  return (
    <EmailLayout locale={locale}>
      <Heading style={{ color: "#333", fontSize: "24px", margin: "0 0 20px" }}>
        {t(locale, "passwordReset", "heading")}
      </Heading>
      <Text style={{ color: "#555", fontSize: "16px", lineHeight: "1.5" }}>
        {t(locale, "passwordReset", "body", { company })}
      </Text>
      <Link
        href={resetUrl}
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
        {t(locale, "passwordReset", "cta")}
      </Link>
      <Text style={{ color: "#888", fontSize: "14px", marginTop: "20px" }}>
        {t(locale, "passwordReset", "expiry")}
      </Text>
      <Text style={{ color: "#999", fontSize: "12px", marginTop: "24px" }}>
        {t(locale, "passwordReset", "footer")}
      </Text>
    </EmailLayout>
  );
}
