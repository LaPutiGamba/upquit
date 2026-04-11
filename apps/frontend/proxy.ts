import createMiddleware from "next-intl/middleware";
import { routing } from "./localization/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(ca|en|es)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"]
};
