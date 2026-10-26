"use client";
import Script from "next/script";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
export default function AnalyticsScripts(){
 const ga=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
 const clarity=process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
 useEffect(()=>{track("visualizou_produto");},[]);
 return <>
  {ga && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive"/><Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga)},{'anonymize_ip':true});`}</Script></>}
  {clarity && <Script id="clarity-init" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script',${JSON.stringify(clarity)});`}</Script>}
 </>;
}
