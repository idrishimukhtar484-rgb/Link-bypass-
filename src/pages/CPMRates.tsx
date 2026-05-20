import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Globe, TrendingUp, DollarSign } from "lucide-react";

export default function CPMRates() {
  const rates = [
    { country: "Greenland", cpm: "$22.50", level: "High" },
    { country: "United States", cpm: "$18.00", level: "High" },
    { country: "United Kingdom", cpm: "$15.50", level: "High" },
    { country: "Canada", cpm: "$14.00", level: "High" },
    { country: "Germany", cpm: "$12.00", level: "Mid" },
    { country: "Australia", cpm: "$11.50", level: "Mid" },
    { country: "India", cpm: "$10.00", level: "Mid" },
    { country: "Brazil", cpm: "$8.50", level: "Low" },
    { country: "Worldwide (Others)", cpm: "$3.50", level: "Base" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Payout Rates</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          We offer some of the highest CPM rates in the industry. Check out our current payout rates per 1,000 views.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm text-center">
          <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
             <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900">Highest CPM</h3>
          <p className="text-sm text-slate-500">Up to $22.50 in selected regions</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm text-center">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
             <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900">Worldwide Traffic</h3>
          <p className="text-sm text-slate-500">We accept traffic from all countries</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm text-center">
          <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
             <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-900">Weekly Payouts</h3>
          <p className="text-sm text-slate-500">Get your money fast every Monday</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 font-bold">
            <TableRow>
              <TableHead className="py-6 px-8 text-slate-900">Country / Region</TableHead>
              <TableHead className="py-6 px-8 text-right text-slate-900">CPM Rate (per 1,000 views)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate, i) => (
              <TableRow key={rate.country} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                <TableCell className="py-4 px-8 font-semibold flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${rate.level === "High" ? "bg-emerald-500" : rate.level === "Mid" ? "bg-blue-500" : "bg-slate-400"}`} />
                   {rate.country}
                </TableCell>
                <TableCell className="py-4 px-8 text-right font-black text-primary-600 text-lg">
                  {rate.cpm}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-center text-slate-400 text-xs mt-8">
        * Rates are dynamic and may change based on advertiser demand.
      </p>
    </div>
  );
}
