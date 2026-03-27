import { Link } from 'react-router-dom';
import { Twitter, Instagram } from 'lucide-react';
import AdBlock from './AdBlock';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-8 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <AdBlock placement="footer" className="mb-12 border-b border-zinc-900 pb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter mb-6 block">
              THE DAILY INSIGHTS<span className="text-red-600">.</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Delivering high-quality journalism and breaking news since 2024. 
              Stay informed with our comprehensive coverage of world events.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Categories</h3>
            <ul className="space-y-4">
              <li><Link to="/category/politics" className="text-zinc-400 hover:text-white transition-colors">Politics</Link></li>
              <li><Link to="/category/business" className="text-zinc-400 hover:text-white transition-colors">Business</Link></li>
              <li><Link to="/category/technology" className="text-zinc-400 hover:text-white transition-colors">Technology</Link></li>
              <li><Link to="/category/sports" className="text-zinc-400 hover:text-white transition-colors">Sports</Link></li>
              <li><Link to="/category/entertainment" className="text-zinc-400 hover:text-white transition-colors">Entertainment</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-zinc-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact</Link></li>

              <li><Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>


        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs">
          <p>© 2026 The Daily Insights Network. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
