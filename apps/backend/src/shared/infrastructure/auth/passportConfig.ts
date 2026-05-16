import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/users/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials not configured. Google authentication will be unavailable.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      callbackURL: GOOGLE_CALLBACK_URL
    },
    (accessToken: string, refreshToken: string, profile: any, done: (err: Error | null, user?: any) => void) => {
      const user = {
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        displayName: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value
      };

      return done(null, user);
    }
  )
);

export default passport;
