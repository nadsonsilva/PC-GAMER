import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){
 if(!isAdmin()) return NextResponse.json({message:"Não autorizado"},{status:401});
 const [leads,orders, events]=await Promise.all([
  prisma.lead.findMany({take:100,orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,verifiedAt:true,createdAt:true}}),
  prisma.order.findMany({take:100,orderBy:{createdAt:"desc"},select:{id:true,number:true,status:true,amountCents:true,createdAt:true,paidAt:true,lead:{select:{name:true,email:true}}}}),
  prisma.analyticsEvent.groupBy({by:["name"],_count:{_all:true}}),
 ]);
 return NextResponse.json({leads,orders,events},{headers:{"Cache-Control":"no-store"}});
}
