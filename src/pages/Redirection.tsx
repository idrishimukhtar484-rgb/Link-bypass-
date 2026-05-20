import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, increment, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { Link as AppLink } from "@/src/types";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Zap, Loader2, ArrowRight, ShieldCheck, ShieldAlert, BadgeCheck, Timer, ChevronRight, BarChart3, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

interface AdUnitSlotProps {
  atKey: string;
  format?: string;
  height: number;
  width: number;
  scriptSrc: string;
  className?: string;
  label?: string;
}

export function AdUnitSlot({ atKey, format = "iframe", height, width, scriptSrc, className = "", label }: AdUnitSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear dynamic children
    containerRef.current.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.width = `${width}`;
    iframe.height = `${height}`;
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.display = "block";
    iframe.style.margin = "0 auto";
    containerRef.current.appendChild(iframe);

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background-color: transparent; }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${atKey}',
                  'format' : '${format}',
                  'height' : ${height},
                  'width' : ${width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="${scriptSrc}"></script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } catch (e) {
      console.error("Ad slot rendering error", e);
    }
  }, [atKey, format, height, width, scriptSrc]);

  return (
    <div className={`p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-slate-100 ${className}`}>
      {label && <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">{label} - {width}x{height}</span>}
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px` }} className="overflow-hidden bg-white/50 rounded-xl max-w-full shadow-sm" />
    </div>
  );
}

export default function Redirection() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<AppLink | null>(null);
  
  // Multi-page state
  const [stage, setStage] = useState(1); // 1, 2, 3, 4
  const [countdown, setCountdown] = useState(20); // Page 1: 20s
  const [buttonReady, setButtonReady] = useState(false);

  const stageTitles = [
    "Security Verification - Step 1/4",
    "Anti-Bot Analysis - Step 2/4",
    "Encrypted Load - Step 3/4",
    "Final Validation - Step 4/4"
  ];

  const stageDurations = [20, 10, 15, 20]; // Timings as requested: 20, 10, ?, 20

  useEffect(() => {
    async function fetchLink() {
      if (!shortId) return;
      
      try {
        const docRef = doc(db, "links", shortId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast.error("Link not found");
          navigate("/");
          return;
        }

        const linkData = { id: docSnap.id, ...docSnap.data() } as AppLink;
        setLink(linkData);
        setLoading(false);

        // Record click on load of Page 1 ONLY IF UNIQUE per browser in a 24h window
        try {
           const visitedLinksKey = "cpm_visited_links_24h";
           const visited = localStorage.getItem(visitedLinksKey);
           let visitedData: Record<string, number> = {};
           try {
              if (visited) visitedData = JSON.parse(visited);
           } catch (e) {
              visitedData = {};
           }
           
           const now = Date.now();
           const lastVisit = visitedData[shortId];
           
           // If visited over 24 hours ago or never
           const isUnique = !lastVisit || (now - Number(lastVisit) > 24 * 60 * 60 * 1000);

           if (isUnique) {
              // Update visited store
              visitedData[shortId] = now;
              localStorage.setItem(visitedLinksKey, JSON.stringify(visitedData));

              let country = "Unknown";
              try {
                 const geoRes = await fetch("https://ipapi.co/json/");
                 const geoData = await geoRes.json();
                 if (geoData && geoData.country_name) country = geoData.country_name;
              } catch (e) {}

              await updateDoc(docRef, { clicks: increment(1), updatedAt: serverTimestamp() });
              await addDoc(collection(db, "links", docSnap.id, "clicks"), {
                 linkId: docSnap.id,
                 timestamp: serverTimestamp(),
                 country: country,
                 userAgent: navigator.userAgent
              });
              await updateDoc(doc(db, "users", linkData.userId), { totalClicks: increment(1) });
              console.log("Unique genuine click registered.");
           } else {
              console.log("Non-unique click detected. Counting as zero to maintain real, verified data statistics.");
           }
        } catch (err) {
           console.error("View verification failed:", err);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `links/${shortId}`);
        setLoading(false);
      }
    }
    fetchLink();
  }, [shortId, navigate]);

  const [footerOpen, setFooterOpen] = useState(true);

  // Load global script connections for maximum CPM redirects/popunder networks on visit
  useEffect(() => {
    const directScripts = [
      "https://pl29499414.effectivecpmnetwork.com/17f8b04281ec2982609009942d5be3ad/invoke.js",
      "https://pl29499415.effectivecpmnetwork.com/71/ea/85/71ea8584581b777882a26fa333db40c1.js"
    ];

    const mountedScripts: HTMLScriptElement[] = [];

    directScripts.forEach(src => {
      try {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        document.body.appendChild(s);
        mountedScripts.push(s);
      } catch (e) {
        console.error("Failed to inject tracking script", src, e);
      }
    });

    return () => {
      mountedScripts.forEach(s => {
        try {
          s.remove();
        } catch (e) {}
      });
    };
  }, [stage]);

  useEffect(() => {
    if (!loading && link && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setButtonReady(true);
    }
  }, [loading, link, countdown]);

  const handleNextStage = () => {
    if (stage < 4) {
      const nextStage = stage + 1;
      setStage(nextStage);
      setCountdown(stageDurations[nextStage - 1]);
      setButtonReady(false);
      window.scrollTo(0, 0);
      toast.success(`Identity verified! Proceeding to Step ${nextStage}...`);
    } else {
      // Final Redirection
      toast.info("Finalizing secure redirection...");
      setTimeout(() => {
        window.location.href = link?.originalUrl || "/";
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
          <Zap className="h-16 w-16 text-primary-500 fill-current" />
        </motion.div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Opening Security Tunnel...</p>
      </div>
    );
  }

  if (!link) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-24 relative">
      {/* Fixed Left Skyscraper */}
      <div className="fixed left-2 top-24 hidden xl:block z-[40]">
         <AdUnitSlot 
            atKey="3066d72906840528f39f04d7299ddab3" 
            height={300} 
            width={160} 
            scriptSrc="https://www.highperformanceformat.com/3066d72906840528f39f04d7299ddab3/invoke.js"
            label="Skyscraper Left"
         />
      </div>

      {/* Fixed Right Skyscraper */}
      <div className="fixed right-2 top-24 hidden xl:block z-[40]">
         <AdUnitSlot 
            atKey="3066d72906840528f39f04d7299ddab3" 
            height={300} 
            width={160} 
            scriptSrc="https://www.highperformanceformat.com/3066d72906840528f39f04d7299ddab3/invoke.js"
            label="Skyscraper Right"
         />
      </div>

      {/* Dynamic Ad Placement - Top Billboard */}
      <div className="w-full bg-slate-900 border-b sticky top-0 z-[60] py-4 px-4 flex justify-center shadow-md">
         <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Sponsor Leaderboard (300x250 Area)</span>
            <AdUnitSlot 
               atKey="90fe5816a4be07228578692ed2fdeab8" 
               height={250} 
               width={300} 
               scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
               className="p-1 border-0 bg-transparent hover:bg-transparent"
            />
         </div>
      </div>

      <div className="w-full max-w-6xl p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
         <div className="lg:col-span-8 space-y-8">
            {/* Step Progress */}
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-4">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center gap-2">
                       <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black transition-all ${stage >= s ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-slate-100 text-slate-400'}`}>
                          {s}
                       </div>
                       {s < 4 && <div className={`h-1 w-6 rounded-full ${stage > s ? 'bg-primary-600' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Session</div>
                  <div className="text-primary-600 font-black text-xs">#{shortId?.toUpperCase()}</div>
               </div>
            </div>

            {/* Content Top Ad */}
            <AdUnitSlot 
               atKey="90fe5816a4be07228578692ed2fdeab8" 
               height={250} 
               width={300} 
               scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
               label="Premium Content Sponsor"
            />

            <Card className="border-4 rounded-[3rem] shadow-3xl overflow-hidden bg-white">
               <div className="bg-primary-600 h-3 w-full" />
               <div className="p-8 md:p-16 text-center space-y-8">
                  {/* Stage-specific Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                       <div className="flex flex-col items-center">
                          <div className="bg-slate-900 p-6 rounded-[2.5rem] mb-6 shadow-2xl relative">
                             {stage === 1 && <ShieldCheck className="h-16 w-16 text-primary-500" />}
                             {stage === 2 && <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />}
                             {stage === 3 && <BarChart3 className="h-16 w-16 text-blue-500" />}
                             {stage === 4 && <BadgeCheck className="h-16 w-16 text-emerald-500" />}
                             <div className="absolute -top-2 -right-2 h-8 w-8 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-primary-600 fill-current" />
                             </div>
                          </div>
                          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">{stageTitles[stage-1]}</h1>
                          <p className="text-slate-500 font-medium max-w-md mx-auto italic">
                             {stage === 1 && "Verifying your connection speed and browser integrity. Please stay on this page to continue."}
                             {stage === 2 && "Analyzing for potential automated threats. Our firewall is inspecting your unique session ID."}
                             {stage === 3 && "Synchronizing parameters with our high-speed cloud infrastructure. Almost there."}
                             {stage === 4 && "Final safety check complete. Your secure link is ready to be generated in our server."}
                          </p>
                       </div>

                       <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem]">
                          {!buttonReady ? (
                            <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Verification Progress</span>
                                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full font-black text-xs flex items-center gap-2">
                                     <Timer className="h-3 w-3" /> {countdown}s
                                  </span>
                               </div>
                               <div className="h-6 bg-slate-200 rounded-full overflow-hidden p-1">
                                  <motion.div 
                                    key={stage}
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: stageDurations[stage - 1], ease: "linear" }}
                                    className="h-full bg-primary-600 rounded-full"
                                  />
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wait for the countdown to unlock the next action</p>
                            </div>
                          ) : (
                             <motion.div 
                               initial={{ y: 20, opacity: 0 }} 
                               animate={{ y: 0, opacity: 1 }}
                               className="py-12 flex flex-col items-center justify-center space-y-4"
                             >
                                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full animate-bounce">
                                   <ChevronRight className="h-10 w-10 rotate-90" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Verification Complete</h3>
                                <p className="text-primary-600 font-black text-2xl animate-pulse tracking-widest">SCROLL DOWN TO CONTINUE ⬇️</p>
                             </motion.div>
                          )}
                       </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Contextual Ad Space */}
                  <div className="bg-slate-100 rounded-[2.5rem] p-6 border-2 border-dashed border-slate-200">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block text-center">Sponsored Grid (Dual 300x250)</span>
                     <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <AdUnitSlot 
                           atKey="90fe5816a4be07228578692ed2fdeab8" 
                           height={250} 
                           width={300} 
                           scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                           label="Sponsored Segment A"
                        />
                        <AdUnitSlot 
                           atKey="90fe5816a4be07228578692ed2fdeab8" 
                           height={250} 
                           width={300} 
                           scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                           label="Sponsored Segment B"
                        />
                     </div>
                  </div>

                  {/* BOTTOM ACTION BUTTON - Only visible when ready */}
                  {buttonReady && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="pt-12 pb-8 border-t-4 border-slate-900"
                    >
                        <div className="mb-12 flex justify-center">
                           <AdUnitSlot 
                              atKey="90fe5816a4be07228578692ed2fdeab8" 
                              height={250} 
                              width={300} 
                              scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                              label="High Impact Conversion Unit"
                           />
                        </div>

                        <Button 
                          size="lg" 
                          className="w-full h-28 text-4xl font-black rounded-[2rem] shadow-2xl shadow-primary-300 gap-4 group bg-slate-900 hover:bg-slate-800 transition-all active:scale-95"
                          onClick={handleNextStage}
                        >
                          {stage < 4 ? (
                            <span className="flex items-center gap-3">CONTINUE TO STEP {stage + 1} <BadgeCheck className="h-10 w-10 text-emerald-400" /></span>
                          ) : (
                            <span className="flex items-center gap-3">GET YOUR FINAL LINK ✅</span>
                          )} 
                          <ArrowRight className="h-10 w-10 group-hover:translate-x-4 transition-transform text-primary-500" />
                        </Button>
                        <p className="mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] text-center whitespace-nowrap">Safe and Secure Redirection Engine v2.0</p>
                    </motion.div>
                  )}
               </div>
            </Card>

            {/* Middle Expanded Banner */}
            <div className="w-full bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col xl:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
               <div className="relative z-10 max-w-sm">
                  <h3 className="text-2xl font-black tracking-tighter text-primary-400">PREMIUM CDN GATEWAY</h3>
                  <p className="text-slate-300 text-xs font-medium">Link processing verified across distributed high-speed nodes.</p>
               </div>
               <div className="flex-grow flex justify-center">
                  <AdUnitSlot 
                     atKey="90fe5816a4be07228578692ed2fdeab8" 
                     height={250} 
                     width={300} 
                     scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                     label="Middle Banner Unit"
                  />
               </div>
            </div>
         </div>

         {/* Sidebar Ads */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border p-8 rounded-[3rem] shadow-sm space-y-6">
               <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Traffic Insights</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
               </div>
               
               <AdUnitSlot 
                  atKey="90fe5816a4be07228578692ed2fdeab8" 
                  height={250} 
                  width={300} 
                  scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                  label="Sidebar Ad Unit A"
               />

               <AdUnitSlot 
                  atKey="3066d72906840528f39f04d7299ddab3" 
                  height={300} 
                  width={160} 
                  scriptSrc="https://www.highperformanceformat.com/3066d72906840528f39f04d7299ddab3/invoke.js"
                  label="Sidebar Ad Unit B"
               />
            </div>

            <div className="bg-primary-600 rounded-[3rem] p-8 text-white relative overflow-hidden group">
               <Zap className="absolute -bottom-10 -right-10 h-40 w-40 opacity-10 group-hover:scale-125 transition-all duration-1000" />
               <h3 className="text-2xl font-black mb-4 leading-none">JOIN THE NETWORK</h3>
               <p className="text-xs text-primary-100 mb-8 font-medium italic">Create an account and start earning today with the market's highest CPM rates.</p>
               <Button className="w-full bg-white text-primary-600 font-black h-14 rounded-2xl" onClick={() => navigate("/auth")}>REGISTER NOW</Button>
            </div>
         </div>
      </div>

      {/* Sticky Bottom Footer Ad */}
      {footerOpen && (
         <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-3 px-4 flex justify-between items-center z-[50] shadow-2xl">
            <div className="mx-auto flex items-center gap-4 pl-8">
               <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] lg:block hidden animate-pulse">STICKY MONETIZATION UNIT:</span>
               <AdUnitSlot 
                  atKey="90fe5816a4be07228578692ed2fdeab8" 
                  height={250} 
                  width={300} 
                  scriptSrc="https://www.highperformanceformat.com/90fe5816a4be07228578692ed2fdeab8/invoke.js"
                  className="p-1 border-0 bg-transparent hover:bg-transparent"
               />
            </div>
            <Button 
               size="icon" 
               variant="ghost" 
               onClick={() => setFooterOpen(false)} 
               className="text-slate-400 hover:text-white"
            >
               <X className="h-5 w-5" />
            </Button>
         </div>
      )}
    </div>
  );
}
