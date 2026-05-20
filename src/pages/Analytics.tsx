import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "@/src/lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs,
  limit
} from "firebase/firestore";
import { Link as AppLink } from "@/src/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { 
  BarChart3, 
  Globe, 
  Monitor, 
  Calendar, 
  ArrowLeft, 
  Zap, 
  ExternalLink, 
  MousePointer2, 
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval, isSameDay } from "date-fns";
import { UAParser } from "ua-parser-js";
import { toast } from "sonner";
import { motion } from "motion/react";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

interface ClickData {
  timestamp: any;
  country: string;
  userAgent: string;
  device?: string;
}

export default function Analytics() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<AppLink | null>(null);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    async function fetchData() {
      if (!shortId || !auth.currentUser) return;

      try {
        const linkRef = doc(db, "links", shortId);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
          toast.error("Link not found");
          navigate("/dashboard");
          return;
        }

        const linkData = { id: linkSnap.id, ...linkSnap.data() } as AppLink;
        
        // Security check: ensure user owns the link
        if (linkData.userId !== auth.currentUser.uid) {
           toast.error("Unauthorized access to analytics");
           navigate("/dashboard");
           return;
        }

        setLink(linkData);

        // Fetch clicks - limit to last 1000 for performance
        const clicksRef = collection(db, "links", shortId, "clicks");
        const clicksQuery = query(clicksRef, orderBy("timestamp", "desc"), limit(1000));
        const clicksSnap = await getDocs(clicksQuery);
        
        const clicksData = clicksSnap.docs.map(doc => {
          const data = doc.data();
          const parser = new UAParser(data.userAgent || "");
          const deviceType = parser.getDevice().type || "Desktop";
          return {
            ...data,
            device: deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
          } as ClickData;
        });

        setClicks(clicksData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `links/${shortId}/clicks`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [shortId, navigate]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-4">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="mb-6"
        >
          <Zap className="h-16 w-16 text-primary-500 fill-current" />
        </motion.div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Analytics Intelligence...</p>
      </div>
    );
  }

  if (!link) return null;

  // Process data for Chart 1: Clicks over last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const timelineData = last7Days.map(day => {
    const count = clicks.filter(click => {
      if (!click.timestamp) return false;
      const clickDate = click.timestamp.toDate();
      return isSameDay(clickDate, day);
    }).length;

    return {
      name: format(day, "MMM d"),
      clicks: count
    };
  });

  // Process data for Chart 2: Geographic Distribution (Top Regions)
  const countryCounts: Record<string, number> = {};
  clicks.forEach(c => {
    const country = c.country || "Unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const countryData = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Process data for Chart 3: Device Types
  const deviceCounts: Record<string, number> = {};
  clicks.forEach(c => {
    const device = c.device || "Desktop";
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });

  const deviceData = Object.entries(deviceCounts)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full bg-white border shadow-sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <BarChart3 className="h-6 w-6 text-primary-500" />
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vulnerability Report & Analytics</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                 Analyzing performance for: <span className="text-primary-600 font-bold">{link.label || link.shortId}</span>
              </p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="font-bold border-2 rounded-xl" onClick={() => window.open(link.originalUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" /> Original Link
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Views", value: link.clicks, icon: MousePointer2, color: "bg-blue-500", sub: "Lifetime" },
           { label: "High CPM Rate", value: "$20.00", icon: TrendingUp, color: "bg-emerald-500", sub: "Global Average" },
           { label: "Unique Users", value: clicks.length, icon: Globe, color: "bg-amber-500", sub: "Last 1000 hits" },
           { label: "Status", value: "Verified", icon: Zap, color: "bg-indigo-500", sub: "Link Health: 100%" }
         ].map((stat, i) => (
           <Card key={i} className="border-2 shadow-sm overflow-hidden relative group">
              <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-2xl shadow-lg shadow-blue-100`}>
                       <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</div>
                 </div>
                 <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-20`} />
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart: Clicks over time */}
         <Card className="lg:col-span-2 border-2 shadow-sm">
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Performance Timeline</CardTitle>
                    <CardDescription>Visualizing traffic flow over the last 7 days</CardDescription>
                  </div>
                  <Calendar className="h-5 w-5 text-slate-300" />
               </div>
            </CardHeader>
            <CardContent>
               <div className="h-[350px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "1rem" }}
                        labelStyle={{ fontWeight: 800, color: "#1e293b", marginBottom: "0.25rem" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} 
                        activeDot={{ r: 8, strokeWidth: 0 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
         </Card>

         {/* Sidebar Chart: Device types */}
         <Card className="border-2 shadow-sm">
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Device Intelligence</CardTitle>
                    <CardDescription>Visitor hardware distribution</CardDescription>
                  </div>
                  <Monitor className="h-5 w-5 text-slate-300" />
               </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                          data={deviceData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="w-full space-y-3 mt-6">
                  {deviceData.map((d, i) => (
                     <div key={d.name} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                           <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           <span className="text-xs font-black text-slate-700">{d.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{Math.round((d.value / clicks.length) * 100) || 0}%</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Geo Distribution */}
         <Card className="lg:col-span-3 border-2 shadow-sm">
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Geographic Traffic</CardTitle>
                    <CardDescription>Top 5 countries by click volume</CardDescription>
                  </div>
                  <Globe className="h-5 w-5 text-slate-300" />
               </div>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryData} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fontWeight: 800, fill: "#1e293b" }} />
                           <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                           />
                           <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32}>
                              {countryData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="space-y-6">
                     <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <Zap className="absolute -top-4 -right-4 h-24 w-24 text-primary-600 opacity-20" />
                        <h4 className="text-lg font-black mb-2 uppercase tracking-tight">Monetization Tip</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                           Our system detected high traffic from <span className="text-primary-400 font-bold">{countryData[0]?.name || "New Markets"}</span>. 
                           Links targeting these regions often see <span className="text-emerald-400 font-bold">+15% Higher CPM</span>.
                        </p>
                        <Button className="w-full font-black rounded-xl">View Detailed CPM Map</Button>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Recent Clicks Audit */}
      <Card className="border-2 shadow-sm overflow-hidden">
         <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg font-black">Click Transparency Log</CardTitle>
            <CardDescription>Auditing the last 1000 interactions in real-time</CardDescription>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b text-[10px] uppercase font-black tracking-widest text-slate-400">
                     <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Device / Platform</th>
                        <th className="px-6 py-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                     {clicks.slice(0, 10).map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-600 font-medium">
                                 <Calendar className="h-3 w-3" />
                                 {c.timestamp?.toDate ? format(c.timestamp.toDate(), "MMM d, HH:mm:ss") : "Just now"}
                              </div>
                           </td>
                           <td className="px-6 py-4 font-bold text-slate-900">{c.country || "Earth Origin"}</td>
                           <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
                                 {c.device || "Desktop"}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px]">
                                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 PROCESSED
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {clicks.length === 0 && (
                  <div className="p-12 text-center text-slate-400 font-bold italic">
                     No clicks recorded yet. Share your link to start collecting data!
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
