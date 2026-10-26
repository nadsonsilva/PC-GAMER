import { createHmac, timingSafeEqual } from "node:crypto";
function secret(){return process.env.RECEIPT_SIGNING_SECRET || process.env.OTP_HASH_SECRET || "";}
export function receiptSignature(id:string){
  if(secret().length<32) throw new Error("Configure RECEIPT_SIGNING_SECRET (32+ caracteres)");
  return createHmac("sha256",secret()).update(`receipt:${id}`).digest("hex");
}
export function checkReceiptSignature(id:string,signature:string){
 if (!/^[0-9a-f]{64}$/.test(signature))return false;
 try {return timingSafeEqual(Buffer.from(receiptSignature(id),"hex"),Buffer.from(signature,"hex"));} catch{return false;}
}
function safe(value:string){return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^ -~]/g,"?").replace(/[()\\]/g," ").slice(0,110);}
export function makeReceiptPdf(lines:string[]):Buffer {
 const objects:string[]=[];
 const stream = ["BT","/F1 13 Tf","50 770 Td",...lines.flatMap((line,i)=>[i ? "0 -28 Td":"",`(${safe(line)}) Tj`].filter(Boolean)),"ET"].join("\n");
 objects.push("<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",`<< /Length ${Buffer.byteLength(stream,"ascii")} >>\nstream\n${stream}\nendstream`);
 let body="%PDF-1.4\n";const offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(body,"ascii"));body+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
 const position=Buffer.byteLength(body,"ascii");body+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(x=>`${String(x).padStart(10,"0")} 00000 n \n`).join("")+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF\n`;
 return Buffer.from(body,"ascii");
}
