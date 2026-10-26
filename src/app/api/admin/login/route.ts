import { NextResponse } from "next/server";
import { validToken, issueSession, ADMIN_COOKIE } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function POST(request:Request) {
  const body = await request.json().catch(()=>({}));
  if (typeof body.token !== "string" || !validToken(body.token)) return NextResponse.json({message:"Não autorizado"},{status:401});
  const result=NextResponse.json({ok:true});
  result.cookies.set(ADMIN_COOKIE,issueSession(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:8*3600});
  return result;
}
