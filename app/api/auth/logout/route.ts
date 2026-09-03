import { NextRequest, NextResponse } from "next/server";
import {
  EMPLOYEE_ID_COOKIE_NAME,
  ORG_ID_COOKIE_NAME,
  ROLE_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.delete(ROLE_COOKIE_NAME);
  response.cookies.delete(ORG_ID_COOKIE_NAME);
  response.cookies.delete(EMPLOYEE_ID_COOKIE_NAME);

  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-")) {
      response.cookies.delete(name);
    }
  });

  return response;
}
