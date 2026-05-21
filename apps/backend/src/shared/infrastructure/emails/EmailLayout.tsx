import { Html, Body, Container, Img, Hr, Text } from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

const LOGO_URL = process.env.RESEND_LOGO_URL || "";

export default function EmailLayout({ children, locale = "en" }: EmailLayoutProps) {
  return (
    <Html>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f9fc", padding: "40px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px" }}>
          {LOGO_URL && (
            <Img
              src={LOGO_URL}
              alt="UpQuit"
              width="120"
              height="36"
              style={{ marginBottom: "24px" }}
            />
          )}
          {children}
          <Hr style={{ margin: "24px 0", borderColor: "#e6e6e6" }} />
          <Text style={{ color: "#999", fontSize: "12px", textAlign: "center" }}>
            &copy; {new Date().getFullYear()} UpQuit. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
