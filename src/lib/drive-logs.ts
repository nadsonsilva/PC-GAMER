import { createSign } from "node:crypto";
// Optional: Google Drive service account. Only technical event identifiers, never customer data.
function base64url(x:string|Buffer){return Buffer.from(x).toString("base64url");}
export async function saveErrorToDrive(event:string, kind:string){
 const folder=process.env.GOOGLE_DRIVE_LOG_FOLDER_ID; const json=process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
 if(!folder || !json) return;
 const account=JSON.parse(json) as {client_email:string;private_key:string};
 const now=Math.floor(Date.now()/1000);
 const head=base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
 const payload=base64url(JSON.stringify({iss:account.client_email,scope:"https://www.googleapis.com/auth/drive.file",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
 const unsigned=`${head}.${payload}`;const signature=createSign("RSA-SHA256").update(unsigned).end().sign(account.private_key).toString("base64url");
 const grant=new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:`${unsigned}.${signature}`});
 const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:grant,signal:AbortSignal.timeout(6000)});
 if(!tokenResponse.ok)throw Error("Falha de autenticação no Google Drive");
 const token=await tokenResponse.json() as {access_token:string};
 const boundary="pcglog";
 const metadata=JSON.stringify({name:`pcg-error-${Date.now()}.json`,parents:[folder],mimeType:"application/json"});
 const content=JSON.stringify({time:new Date().toISOString(),event:event.slice(0,80),errorType:kind});
 const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
 const upload=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",{method:"POST",headers:{Authorization:`Bearer ${token.access_token}`,"Content-Type":`multipart/related; boundary=${boundary}`},body,signal:AbortSignal.timeout(8000)});
 if(!upload.ok)throw Error(`Falha de upload no Google Drive (${upload.status})`);
}
