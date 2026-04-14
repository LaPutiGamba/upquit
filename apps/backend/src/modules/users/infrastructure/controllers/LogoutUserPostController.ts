import { Request, Response } from "express";

export default function LogoutUserPostController(_req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.sendStatus(204);
}
