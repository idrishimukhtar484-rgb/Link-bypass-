import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { db } from "@/src/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  onSnapshot,
  doc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { Link as AppLink } from "@/src/types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { Link2, Copy, Trash2, ExternalLink, BarChart, Plus, LayoutDashboard, MousePointer2, TrendingUp, DollarSign, Wallet, ArrowUpRight } from "lucide-react";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

export default function Dashboard({ user }: { user: User }) {
  const [links, setLinks] = useState<AppLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [shortening, setShortening] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "links"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppLink[];
      setLinks(linksData);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load links. This might be due to a missing index.");
      handleFirestoreError(error, OperationType.LIST, "links");
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Simple URL validation and auto-prefixing
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    try {
      new URL(finalUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      setShortening(false);
      return;
    }

    setShortening(true);
    const shortId = nanoid(7);
    const newLink: any = {
      originalUrl: finalUrl,
      shortId,
      userId: user.uid,
      clicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (label.trim()) {
      newLink.label = label.trim();
    }

    try {
      console.log("Saving link:", shortId, newLink);
      // Use shortId as document ID for public getDoc access
      const docRef = doc(db, "links", shortId);
      await setDoc(docRef, newLink);
      
      toast.success("Link shortened successfully!");
      setUrl("");
      setLabel("");
    } catch (error: any) {
      console.error("Shorten error:", error);
      toast.error(error.message || "Failed to shorten link. Please try again.");
      if (error.code === 'permission-denied') {
        toast.error("Permission denied. Please make sure you are logged in correctly.");
      }
      handleFirestoreError(error, OperationType.CREATE, "links");
    } finally {
      setShortening(false);
    }
  };

  const copyToClipboard = (shortId: string) => {
    const fullUrl = `${window.location.origin}/s/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteDoc(doc(db, "links", id));
      toast.success("Link deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `links/${id}`);
    }
  };

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const estEarnings = (totalClicks * 0.02).toFixed(2);

  // Get most recent link for the quick copy section
  const latestLink = links[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
            <div className="bg-primary-600 p-2 rounded-xl">
               <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            Publisher Overview
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Welcome back! Your links are performing at peak efficiency.</p>
        </div>
        <div className="flex bg-slate-900 rounded-3xl p-4 shadow-2xl items-center gap-6">
           <div className="px-2">
              <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Active Balance</div>
              <div className="text-2xl font-black text-white">${estEarnings}</div>
           </div>
           <Button className="bg-primary-600 hover:bg-primary-500 font-bold px-6 rounded-2xl h-12 shadow-lg shadow-primary-900/50">
              WITHDRAW
           </Button>
        </div>
      </div>

      {/* Shorten Form */}
      <Card className="border-2 shadow-lg overflow-hidden">
        <div className="bg-primary-600 h-2" />
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary-500" />
            Create New Link
          </CardTitle>
          <CardDescription>Enter your long URL and get a shortened version in seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleShorten} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 lg:col-span-7">
              <Input 
                placeholder="Paste your long URL here (https://...)" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 border-2"
                required
              />
            </div>
            <div className="md:col-span-12 lg:col-span-3">
              <Input 
                placeholder="Label (optional)" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-12 border-2"
              />
            </div>
            <div className="md:col-span-12 lg:col-span-2">
              <Button type="submit" size="lg" className="h-12 w-full font-bold shadow-lg shadow-primary-200" disabled={shortening}>
                {shortening ? "..." : "Shorten"}
              </Button>
            </div>
          </form>

          {/* Quick Copy Result */}
          <AnimatePresence>
            {latestLink && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-6 border-t"
              >
                <div className="bg-primary-50 p-6 rounded-2xl border-2 border-primary-100 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-grow w-full">
                    <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">Your Shortened Link</p>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border-2 border-primary-200">
                      <code className="text-primary-700 font-bold text-lg truncate flex-grow">
                        {window.location.origin}/s/{latestLink.shortId}
                      </code>
                      <div className="flex items-center gap-2">
                         <Button onClick={() => copyToClipboard(latestLink.shortId)} className="shrink-0 font-bold gap-2">
                           <Copy className="h-4 w-4" /> Copy
                         </Button>
                         <Button variant="outline" className="shrink-0 font-bold" onClick={() => window.location.href = `/s/${latestLink.shortId}`}>
                            Test
                         </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-l border-primary-200 pl-6 hidden md:flex">
                     <TrendingUp className="h-5 w-5 text-primary-500" />
                     <span className="text-[10px] font-bold text-primary-600 uppercase">Live Ready</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Views", value: totalClicks, icon: MousePointer2, color: "bg-blue-600", trend: "+$2.30 today" },
          { label: "Estimated Earnings", value: `$${estEarnings}`, icon: DollarSign, color: "bg-emerald-600", trend: "High CPM" },
          { label: "Global CPM", value: "$20.00", icon: TrendingUp, color: "bg-amber-600", trend: "Stable" },
          { label: "Referral Bonus", value: "$0.00", icon: Wallet, color: "bg-indigo-600", trend: "0 Users" }
        ].map((stat, i) => (
          <Card key={i} className="border-4 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className={`${stat.color} p-3 rounded-2xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.trend}</div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-20`} />
          </Card>
        ))}
      </div>

      {/* Links List */}
      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Your Shortened Links</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-slate-100 animate-pulse rounded-lg" />)}
            </div>
          ) : links.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 uppercase text-[10px] font-bold tracking-widest text-slate-500">
                  <TableRow>
                    <TableHead>Label / Target</TableHead>
                    <TableHead>Short Link</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id} className="hover:bg-slate-50/50 group">
                      <TableCell className="max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">
                          {link.label || "Untitled Link"}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {link.originalUrl}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-primary-600 font-bold bg-primary-50 px-2 py-1 rounded text-sm">
                            {window.location.origin}/s/{link.shortId}
                          </code>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary-100 hover:text-primary-600" onClick={() => copyToClipboard(link.shortId)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <MousePointer2 className="h-4 w-4 text-slate-400" />
                          {link.clicks}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-slate-500 text-sm">
                        {link.createdAt ? (() => {
                          const date = link.createdAt instanceof Timestamp ? link.createdAt.toDate() : new Date(link.createdAt);
                          return isNaN(date.getTime()) ? "..." : format(date, "MMM d, yyyy");
                        })() : "..."}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-primary-500 hover:text-primary-600 hover:bg-primary-50"
                              onClick={() => window.open(`/dashboard/analytics/${link.shortId}`, "_self")}
                           >
                             <BarChart className="h-4 w-4" />
                           </Button>
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(link.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center">
               <div className="bg-slate-100 p-6 rounded-full mb-6">
                 <Link2 className="h-12 w-12 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No links found</h3>
               <p className="text-slate-500 max-w-sm">
                 You haven't shortened any links yet. Use the form above to create your first link.
               </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
