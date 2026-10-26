import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkReceiptSignature, makeReceiptPdf } from "@/lib/receipt";
import { product } from "@/lib/product";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:{id:string}}){
 const url=new URL(request.url);
 if(!checkReceiptSignature(params.id,url.searchParams.get("signature")||"")) return NextResponse.json({message:"Não autorizado"},{status:403});
 const order=await prisma.order.findUnique({where:{id:params.id},include:{lead:true}});
 if(!order || order.status!=="PAID" || !order.paidAt) return NextResponse.json({message:"Comprovante indisponível"},{status:404});
 const pdf=makeReceiptPdf(["PC GAMER - COMPROVANTE DE PEDIDO","Documento comercial - nao e nota fiscal",`Pedido: #${order.number}`,`Produto: ${product.name}`,`Cliente: ${order.lead.name}`,`Valor: R$ ${(order.amountCents/100).toFixed(2)}`,`Pagamento: ${order.paidAt.toISOString()}`,"Situacao: PAGO","Confirmado pelo backend via Mercado Pago"]);
 return new NextResponse(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="comprovante-${order.number}.pdf"`,"Cache-Control":"private, no-store"}});
}
