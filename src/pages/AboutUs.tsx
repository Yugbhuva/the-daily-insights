import { Link } from 'react-router-dom';
import {
  Newspaper, Award, TrendingUp, Shield,
  Heart, Zap, ChevronRight,
  BookOpen, Globe, Star, Clock
} from 'lucide-react';





const values = [
  {
    icon: Shield,
    title: 'Editorial Independence',
    desc: 'No advertiser, investor, or government dictates our coverage. Our newsroom decisions are made solely by journalists.',
    color: 'bg-red-500/10 text-red-500',
  },
  {
    icon: Star,
    title: 'Accuracy First',
    desc: 'Every claim is verified by at least two independent sources. Corrections are published prominently and without delay.',
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: Heart,
    title: 'Community Driven',
    desc: 'We listen to our readers. Reader tips, feedback, and story ideas shape what we chase next.',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    icon: Zap,
    title: 'Speed Without Sacrifice',
    desc: 'Breaking news within minutes, deep dives within hours. We never let urgency become an excuse for inaccuracy.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: BookOpen,
    title: 'Depth & Context',
    desc: 'Headlines tell you what happened. We tell you why it matters — with history, data, and expert perspectives.',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    desc: 'With correspondents in 24 cities, our reporting is never parochial. The world is our beat.',
    color: 'bg-violet-500/10 text-violet-500',
  },
];



export default function AboutUs() {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-50">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-28 px-4">
        {/* decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-600 opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-3xl" />

        <div className="relative container mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Newspaper size={14} /> Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
            Journalism That <span className="text-red-500">Matters.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            The Daily Insights was built on a single belief — that informed citizens make better decisions.
            We exist to deliver accurate, fearless, and beautifully crafted journalism to every corner of the world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Contact Us <ChevronRight size={16} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Read Latest News <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>



      {/* ── Mission ── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-500 mb-3 block">Our Mission</span>
              <h2 className="text-4xl font-black tracking-tighter mb-6">
                Truth is not a viewpoint.&nbsp;
                <span className="text-zinc-400">It's our foundation.</span>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                We reject the race to the bottom of outrage journalism. Instead, we invest deeply in original reporting —
                sending correspondents to the field, poring through data, and talking to real people whose lives are touched
                by the stories we cover.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Every article you read on The Daily Insights has been fact-checked, edited for clarity, and stripped of
                partisan spin. We report. You decide.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Clock, text: 'News updated every 15 minutes, around the clock.' },
                { icon: Award, text: '6 industry awards for journalistic excellence.' },
                { icon: TrendingUp, text: 'Fastest-growing digital newsroom in our category.' },
                { icon: Shield, text: '100 % editorially independent — no paywalled truths.' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-4 bg-zinc-100 dark:bg-zinc-900/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-red-500 mb-3 block">What We Stand For</span>
            <h2 className="text-4xl font-black tracking-tighter">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>





    </div>
  );
}
