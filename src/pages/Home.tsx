import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Link2, Zap, BarChart3, Globe, DollarSign, ArrowRight, Copy, Star, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { nanoid } from "nanoid";
import { db, auth } from "@/src/lib/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuickShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    if (!auth.currentUser) {
      toast.error("Please login to shorten links!");
      navigate("/auth");
      return;
    }

    setLoading(true);
    const shortId = nanoid(7);
    
    // Auto-prefix URL
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    try {
      new URL(finalUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      console.log("Shortening URL:", finalUrl);
      if (!auth.currentUser) throw new Error("Auth required");

      await setDoc(doc(db, "links", shortId), {
        originalUrl: finalUrl,
        shortId,
        userId: auth.currentUser.uid,
        clicks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const fullShortUrl = `${window.location.origin}/s/${shortId}`;
      console.log("Success! Shortened URL:", fullShortUrl);
      setShortenedUrl(fullShortUrl);
      toast.success("Link shortened successfully!");
      setUrl(""); // Clear input
    } catch (error: any) {
      console.error("Home shorten error:", error);
      toast.error(error.message || "Failed to shorten link. Please try again.");
      handleFirestoreError(error, OperationType.CREATE, "links");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    toast.success("Copied to clipboard!");
  };

  const features = [
    {
      title: "Fast Redirections",
      description: "Our high-speed infrastructure ensures your visitors never wait.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      title: "Detailed Analytics",
      description: "Track every click with geographical and device insights.",
      icon: BarChart3,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "High CPM Rates",
      description: "Earn more than any other platform with our premium ad network.",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      title: "Global Reach",
      description: "Monetize traffic from every corner of the world effectively.",
      icon: Globe,
      color: "text-purple-500",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 bg-slate-50 border-b overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-primary-100 rounded-full text-[10px] font-black text-primary-600 mb-8 uppercase tracking-[0.2em] shadow-sm">
              <Zap className="h-3 w-3 fill-current" />
              Highest CPM Shortener of 2024
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-slate-950 mb-6 leading-[1.05] tracking-tighter">
              Shorten links. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Earn more cash.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Your traffic is valuable. Monetize every click with our advanced multi-page verification system and industry-leading $20.00 CPM rates.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-16">
               <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active payouts</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="bg-primary-500 h-2 w-2 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instant stats</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="bg-indigo-500 h-2 w-2 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Anti-fraud secure</span>
               </div>
            </div>

            {/* Quick Shortener */}
            <div className="max-w-3xl mx-auto mb-16 px-2 sm:px-0">
              <div className="bg-white p-2 rounded-3xl border-4 border-slate-100 shadow-2xl relative">
                 <div className="absolute -top-3 -right-3 bg-primary-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg animate-bounce">
                    UP TO $20 CPM
                 </div>
                 <form onSubmit={handleQuickShorten} className="flex flex-col md:flex-row gap-2">
                    <div className="flex-grow flex items-center gap-3 px-4 py-3 md:py-0">
                       <Link2 className="h-5 w-5 text-slate-400" />
                       <input 
                          type="text" 
                          placeholder="Paste your long URL here..." 
                          className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-900 placeholder:text-slate-300"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                       />
                    </div>
                    <Button size="lg" className="h-14 px-10 font-bold rounded-2xl shadow-lg shadow-primary-200" disabled={loading}>
                       {loading ? "..." : "Shorten & Earn"}
                    </Button>
                 </form>
              </div>
              
              {!auth.currentUser && (
                <p className="mt-4 text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                   <Zap className="h-3 w-3 text-amber-500" />
                   Log in required to track earnings and clicks
                </p>
              )}

              <AnimatePresence>
                {shortenedUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 bg-white border-2 border-emerald-500 p-8 rounded-[2rem] flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <TrendingUp className="h-24 w-24" />
                    </div>
                    
                    <div className="flex items-center gap-4 w-full">
                       <div className="bg-emerald-500 p-4 rounded-2xl shrink-0 shadow-lg shadow-emerald-100">
                          <Zap className="h-6 w-6 text-white fill-current" />
                       </div>
                       <div className="flex flex-col text-left truncate flex-grow">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 font-mono">Monetization Active</span>
                          <code className="text-emerald-700 font-black text-2xl truncate">{shortenedUrl}</code>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-3 h-16 rounded-2xl shadow-lg shadow-emerald-100 text-lg" onClick={copyToClipboard}>
                         <Copy className="h-5 w-5" /> Copy Link
                      </Button>
                      <Button variant="outline" className="border-4 border-emerald-100 text-emerald-600 font-black h-16 rounded-2xl hover:bg-emerald-50 text-lg" onClick={() => window.open(shortenedUrl, "_blank")}>
                         Test Link
                      </Button>
                    </div>

                    <div className="w-full flex items-center gap-3 pt-4 border-t border-emerald-50">
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Revenue: $18.50 - $20.00 CPM</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-8 grayscale opacity-50 px-4 flex-wrap">
               <div className="font-black text-2xl tracking-tighter">BITLY</div>
               <div className="font-black text-2xl tracking-tighter italic">rebrandly</div>
               <div className="font-black text-2xl tracking-tighter">TURL</div>
               <div className="font-black text-2xl tracking-tighter">LINKTR.EE</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Built for Professionals</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage your links, track your audience, and maximize your revenue in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white border hover:shadow-2xl transition-all hover:-translate-y-1 group"
              >
                <div className={`${feature.bg} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-32 px-4">
         <div className="max-w-7xl mx-auto bg-slate-950 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
               <div>
                  <div className="text-5xl font-black text-white mb-2">15M+</div>
                  <div className="text-primary-400 font-bold uppercase tracking-widest text-xs">Total Clicks</div>
               </div>
               <div className="border-y md:border-y-0 md:border-x border-slate-800 py-12 md:py-0">
                  <div className="text-5xl font-black text-white mb-2">450k+</div>
                  <div className="text-primary-400 font-bold uppercase tracking-widest text-xs">Daily Views</div>
               </div>
               <div>
                  <div className="text-5xl font-black text-white mb-2">$85k+</div>
                  <div className="text-primary-400 font-bold uppercase tracking-widest text-xs">Paid Monthly</div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary-600 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">Ready to boost your earnings?</h2>
          <p className="text-primary-50 mb-12 text-lg max-w-xl mx-auto">
            Join 10,000+ publishers today. No credit card required. Weekly payouts guaranteed with the highest industry CPM.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" variant="secondary" className="h-16 px-12 font-bold text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform" onClick={() => navigate("/auth")}>
              Create Free Account
            </Button>
            <div className="flex items-center gap-3 text-white">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-primary-600 bg-slate-200 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="user" />
                    </div>
                  ))}
               </div>
               <div className="text-sm font-bold">10k+ publishers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
