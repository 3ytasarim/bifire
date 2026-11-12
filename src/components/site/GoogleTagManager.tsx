import Script from "next/script";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";

/** Google Tag Manager kapsayıcısı. NEXT_PUBLIC_GTM_ID ile değiştirilebilir; yalnız production'da yüklenir (geliştirme trafiği raporlara girmez). */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TPCLTV6F";

/**
 * Tek betik, sırası garanti: (1) Consent Mode v2 varsayılanı: analitik/pazarlama REDDEDİLMİŞ (KVKK: açık rıza
 * olmadan çerez yazılmaz), (2) ziyaretçinin daha önce kaydettiği tercih varsa onu uygular, (3) GTM'i yükler.
 * Tercih değişince CookieConsent `gtag('consent','update', …)` gönderir.
 */
const bootstrap = (id: string) => `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var c=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null');if(c){var a=c.analytics?'granted':'denied',m=c.marketing?'granted':'denied';gtag('consent','update',{analytics_storage:a,ad_storage:m,ad_user_data:m,ad_personalization:m});}}catch(e){}
(function(w,d,s,l,i){w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;

export function GoogleTagManager() {
  if (process.env.NODE_ENV !== "production" || !GTM_ID) return null;
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {bootstrap(GTM_ID)}
      </Script>
      <noscript>
        <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
      </noscript>
    </>
  );
}
