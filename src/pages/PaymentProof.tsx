import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { ShieldCheck, Calendar, CreditCard, UserCheck, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

export default function PaymentProof() {
  const proofs = [
    { id: "TX_99210", user: "mu***@gmail.com", amount: "$145.20", method: "PayPal", date: new Date() },
    { id: "TX_99209", user: "id***@gmail.com", amount: "$50.00", method: "Paytm", date: new Date(Date.now() - 86400000) },
    { id: "TX_99208", user: "ak***@yahoo.com", amount: "$320.45", method: "Bank Transfer", date: new Date(Date.now() - 172800000) },
    { id: "TX_99207", user: "sa***@gmail.com", amount: "$12.00", method: "UPI", date: new Date(Date.now() - 259200000) },
    { id: "TX_99206", user: "jo***@hotmail.com", amount: "$88.10", method: "Binance", date: new Date(Date.now() - 345600000) },
    { id: "TX_99205", user: "ve***@gmail.com", amount: "$22.50", method: "PayPal", date: new Date(Date.now() - 432000000) },
    { id: "TX_99204", user: "ra***@gmail.com", amount: "$500.00", method: "Bank Transfer", date: new Date(Date.now() - 518400000) },
    { id: "TX_99203", user: "ti***@gmail.com", amount: "$5.00", method: "Paytm", date: new Date(Date.now() - 604800000) },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-600 mb-4 uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" /> Verified Payments
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Payment Proof</h1>
          <p className="text-slate-500">Live feed of the latest payments sent to our members.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border">
           <div className="text-right">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid Out</p>
             <p className="text-2xl font-black text-emerald-600 leading-tight">$2,548,210.00+</p>
           </div>
           <div className="bg-emerald-500 p-2 rounded-xl">
             <CreditCard className="h-6 w-6 text-white" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 shadow-2xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 border-b-2">
            <TableRow>
              <TableHead className="py-6 px-8 text-slate-900 font-bold uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="py-6 px-8 text-slate-900 font-bold uppercase tracking-widest text-[10px]">Member</TableHead>
              <TableHead className="py-6 px-8 text-slate-900 font-bold uppercase tracking-widest text-[10px]">Amount</TableHead>
              <TableHead className="py-6 px-8 text-slate-900 font-bold uppercase tracking-widest text-[10px]">Method</TableHead>
              <TableHead className="py-6 px-8 text-slate-900 font-bold uppercase tracking-widest text-[10px] text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proofs.map((proof) => (
              <TableRow key={proof.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="py-6 px-8 flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {format(proof.date, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="py-6 px-8 font-bold text-slate-700">
                   {proof.user}
                </TableCell>
                <TableCell className="py-6 px-8 font-black text-emerald-600 text-lg">
                  {proof.amount}
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {proof.method}
                  </div>
                </TableCell>
                <TableCell className="py-6 px-8 text-right">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full gap-1">
                    <UserCheck className="h-3 w-3" /> Paid <ArrowUpRight className="h-3 w-3" />
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-12 p-8 bg-slate-950 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 text-center md:text-left">
           <h3 className="text-2xl font-bold mb-2">Want to be on this list?</h3>
           <p className="text-slate-400">Join our high-paying platform and start earning money today.</p>
        </div>
        <button className="relative z-10 bg-white text-slate-950 px-10 py-4 rounded-2xl font-extrabold hover:bg-primary-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl">
          Register Account
        </button>
      </div>
    </div>
  );
}
