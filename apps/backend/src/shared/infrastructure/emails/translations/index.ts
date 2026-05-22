type TranslationNamespace = Record<string, string>;
type TranslationTable = Record<string, TranslationNamespace>;

const translations: Record<string, TranslationTable> = {
  en: {
    welcome: {
      preview: "Welcome to {company}, {userName}! Please verify your email.",
      heading: "Welcome to {company}, {userName}!",
      body: "We're so glad to have you on board. Please verify your email address to get started.",
      cta: "Verify Email",
      footer: "If you didn't create this account, you can safely ignore this email."
    },
    passwordReset: {
      preview: "Reset your {company} password",
      heading: "Reset Your Password",
      body: "We received a request to reset your {company} password. Click the button below to set a new one.",
      cta: "Reset Password",
      expiry: "This link expires in 15 minutes.",
      footer: "If you didn't request a password reset, you can safely ignore this email."
    }
  },
  es: {
    welcome: {
      preview: "¡Bienvenido a {company}, {userName}! Por favor verifica tu correo.",
      heading: "¡Bienvenido a {company}, {userName}!",
      body: "Nos alegra mucho tenerte a bordo. Por favor verifica tu dirección de correo electrónico para comenzar.",
      cta: "Verificar Correo",
      footer: "Si no creaste esta cuenta, puedes ignorar este correo sin problema."
    },
    passwordReset: {
      preview: "Restablece tu contraseña de {company}",
      heading: "Restablecer Tu Contraseña",
      body: "Recibimos una solicitud para restablecer tu contraseña de {company}. Haz clic en el botón de abajo para crear una nueva.",
      cta: "Restablecer Contraseña",
      expiry: "Este enlace expira en 15 minutos.",
      footer: "Si no solicitaste restablecer tu contraseña, puedes ignorar este correo sin problema."
    }
  },
  ca: {
    welcome: {
      preview: "Benvingut a {company}, {userName}! Si us plau, verifica el teu correu.",
      heading: "Benvingut a {company}, {userName}!",
      body: "Ens alegra molt tenir-te a bord. Si us plau, verifica la teva adreça de correu electrònic per començar.",
      cta: "Verificar Correu",
      footer: "Si no vas crear aquest compte, pots ignorar aquest correu sense problemes."
    },
    passwordReset: {
      preview: "Restableix la teva contrasenya de {company}",
      heading: "Restableix la Teva Contrasenya",
      body: "Vam rebre una sol·licitud per restablir la teva contrasenya de {company}. Fes clic al botó següent per crear-ne una de nova.",
      cta: "Restableix Contrasenya",
      expiry: "Aquest enllaç expira en 15 minuts.",
      footer: "Si no vas sol·licitar restablir la teva contrasenya, pots ignorar aquest correu sense problemes."
    }
  }
};

function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
}

export function t(locale: string, namespace: string, key: string, variables?: Record<string, string>): string {
  const value = translations[locale]?.[namespace]?.[key];
  if (!value) {
    const fallback = translations["en"]?.[namespace]?.[key];
    if (!fallback) return `{${namespace}.${key}}`;
    return variables ? interpolate(fallback, variables) : fallback;
  }
  return variables ? interpolate(value, variables) : value;
}
