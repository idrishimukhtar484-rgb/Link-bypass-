import React, { useState, useEffect } from "react";
import { db, auth } from "@/src/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  where
} from "firebase/firestore";
import { Link as AppLink } from "@/src/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { toast } from "sonner";
import { 
  ShieldAlert, 
  Users, 
  Link2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Search,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { OperationType, handleFirestoreError } from "@/src/lib/errorHandler";

interface UserStat {
  uid: string;
  email: string;
  totalClicks: number;
}

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [links, setLinks] = useState<AppLink[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      if (!auth.currentUser) {
        navigate("/auth");
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", auth.currentUser.uid));
        if (adminSnap.exists()) {
          setIsAdmin(true);
          fetchData();
        } else {
          setIsAdmin(false);
          toast.error("Unauthorized access");
          navigate("/dashboard");
        }
      } catch (err) {
        setIsAdmin(false);
        navigate("/dashboard");
      }
    }

    async function fetchData() {
      try {
        // Fetch all links
        const linksSnap = await getDocs(query(collection(db, "links"), orderBy("createdAt", "desc")));
        const linksData = linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppLink));
        setLinks(linksData);

        // Fetch all users
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserStat));
        setUsers(usersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "admin_data");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [navigate]);

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteDoc(doc(db, "links", id));
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success("Link deleted successfully");
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `links/${id}`);
    }
  };

  const filteredLinks = links.filter(l => 
    l.shortId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.label && l.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdmin === null || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
         <ShieldAlert className="h-12 w-12 text-primary-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
               <div className="bg-red-600 p-2 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
               </div>
               System Governance
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">High-level administration and oversight panel.</p>
         </div>
         <Button variant="outline" onClick={() => navigate("/dashboard")} className="font-bold border-2 rounded-xl">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Back to Dashboard
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-4 border-slate-900 bg-slate-900 text-white shadow-2xl">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Total System Clicks</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-4xl font-black">{links.reduce((s, l) => s + (l.clicks || 0), 0)}</div>
               <div className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> VERIFIED TRAFFIC
               </div>
            </CardContent>
         </Card>
         <Card className="border-2 shadow-sm">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-4xl font-black text-slate-900">{users.length}</div>
               <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> TOTAL PUBLISHERS
               </div>
            </CardContent>
         </Card>
         <Card className="border-2 shadow-sm">
            <CardHeader className="pb-2">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Total Active Links</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-4xl font-black text-slate-900">{links.length}</div>
               <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> SYSTEM ASSETS
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-2 shadow-xl overflow-hidden">
         <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
            <div>
               <CardTitle className="font-black text-xl">Global Link Ledger</CardTitle>
               <CardDescription>Oversight of every short link generated by our engine.</CardDescription>
            </div>
            <div className="relative w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                  placeholder="Search system links..." 
                  className="pl-10 h-10 border-2 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <Table>
                  <TableHeader className="bg-slate-50/50 uppercase text-[10px] font-black tracking-[0.22em] text-slate-400">
                     <TableRow>
                        <TableHead className="px-6 py-4">Link Identity</TableHead>
                        <TableHead className="px-6 py-4">Status</TableHead>
                        <TableHead className="px-6 py-4 text-center">Volume</TableHead>
                        <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {filteredLinks.map((l) => (
                        <TableRow key={l.id} className="hover:bg-slate-50/30">
                           <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <span className="font-black text-slate-900 uppercase text-xs">{l.label || "System Asset"}</span>
                                 <code className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded w-fit mt-1">/{l.shortId}</code>
                                 <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[200px]">{l.originalUrl}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500">
                                 <CheckCircle className="h-3 w-3" /> Active
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className="text-sm font-black text-slate-900">{l.clicks}</div>
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">HITS</div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-500" onClick={() => window.open(l.originalUrl, "_blank")}>
                                    <ExternalLink className="h-4 w-4" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteLink(l.id)}>
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </td>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
