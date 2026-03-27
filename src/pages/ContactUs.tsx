import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No actual submission — for testing only
    setSubmitted(true);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-50">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-20 px-4">
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-600 opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-3xl" />
        <div className="relative container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Mail size={14} /> Get In Touch
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
            Contact <span className="text-red-500">Us</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            Have a tip, a story idea, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-3 gap-12">

          {/* ── Contact Info ── */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter mb-6">Reach Us</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5">Email</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">hello@thedailyinsights.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5">Phone</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">+1 (555) 012-3456</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5">Address</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">123 Press Lane, London, EC1A 1BB</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Form ── */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-4">
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter">Message Sent!</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Thanks for reaching out. We'll get back to you within 1–2 business days.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-8 space-y-6 shadow-sm"
              >
                <h2 className="text-2xl font-black tracking-tighter">Send a Message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
                  >
                    <option value="" disabled>Select a subject…</option>
                    <option value="tip">News Tip</option>
                    <option value="correction">Correction Request</option>
                    <option value="advertising">Advertising Enquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Write your message here…"
                    value={form.message}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-red-500 outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-semibold px-6 py-3 rounded-xl text-sm"
                >
                  <Send size={16} /> Submit Message
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
