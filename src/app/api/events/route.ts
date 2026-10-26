import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EVENTS } from "@/lib/analytics";
export const runtime="nodejs";
export async function POST(request:Request){
  const len=Number(request.headers.get("content-length")||0);
  if(len>256) return NextResponse.json({message:"Requisição grande"},{status:413});
  const data=await request.json().catch(()=>null);
  if(!data || typeof data.name!=="string" || !EVENTS.includes(data.name as typeof EVENTS[number])) return NextResponse.json({message:"Evento inválido"},{status:400});
  await prisma.analyticsEvent.create({data:{name:data.name}});
  return NextResponse.json({ok:true});
}
