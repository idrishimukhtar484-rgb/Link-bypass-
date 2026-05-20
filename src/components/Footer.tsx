import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="bg-primary-500 p-1.5 rounded-lg">
              <Zap className="h-6 w-6 text-white fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Link<span className="text-primary-500">Pulse</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed">
            LinkPulse is the highest paying link shortener on the market. Shorten links, share them, and earn money for every visitor.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Resources</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/cpm" className="hover:text-white transition-colors">CPM Rates</Link></li>
            <li><Link to="/payment-proof" className="hover:text-white transition-colors">Payment Proof</Link></li>
            <li><Link to="/auth" className="hover:text-white transition-colors">Join Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
        &copy; {new Date().getFullYear()} LinkPulse Inc. All rights reserved.
      </div>
    </footer>
  );
}
