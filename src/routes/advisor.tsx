import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Bot, ShieldCheck, Sparkles, CheckSquare, Square, RefreshCw, Calculator } from 'lucide-react'

export const Route = createFileRoute('/advisor')({
  component: AdvisorPage,
})

function AdvisorPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    hatchery: false,
    clean: false,
    water: false,
    visitors: false,
    rodents: false,
    litter: false,
    records: false,
    vet: false,
  })

  const [flockSize, setFlockSize] = useState('50')
  const [hasHouse, setHasHouse] = useState('yes')
  const [budget, setBudget] = useState('100000-200000')
  const [experience, setExperience] = useState('beginner')
  const [planResult, setPlanResult] = useState<string | null>(null)

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetChecklist = () => {
    setChecklist({
      hatchery: false,
      clean: false,
      water: false,
      visitors: false,
      rodents: false,
      litter: false,
      records: false,
      vet: false,
    })
  }

  const generatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    let sizeNum = parseInt(flockSize) || 50
    let estCost = sizeNum * 1500
    setPlanResult(`Generated Broiler Farm Plan for ${sizeNum} birds: Estimated startup investment is around ₦${estCost.toLocaleString()}. Ensure strict brooding warmth (32-35°C), high-quality commercial starter feed, clean electrolyte water, and proper biosecurity as outlined in your health guide.`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to ERP</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <h1 className="font-bold text-base text-white">Complete Broiler Poultry Health & Farming Guide</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Expert Advisor Workspace</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-10">
        <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional Management Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Approach Broiler Farming as a Business</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Since you are preparing to start broiler farming, approach it as a business, not just as buying chicks, feeding them, and selling them after six weeks. Your profit will depend heavily on good-quality chicks, proper feeding, clean water, temperature control, vaccination, early disease detection, and keeping accurate records.
          </p>
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs leading-relaxed">
            <strong>Important Principle:</strong> You cannot reliably diagnose a broiler disease from droppings or the position in which a bird dies alone. Several diseases cause similar signs, and some require laboratory testing. Using the wrong medicine can waste money, delay treatment, and cause drug residues in meat.
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-extrabold">1</span>
            The Most Important Broiler Diseases
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">1. Coccidiosis</h4>
              <p className="text-xs text-slate-300"><strong>Cause:</strong> Eimeria parasites multiplying in the intestines.</p>
              <p className="text-xs text-slate-300"><strong>Signs:</strong> Bloody or reddish-brown droppings, watery diarrhoea, ruffled feathers, poor growth, pale combs, and weakness.</p>
              <p className="text-xs text-slate-300"><strong>Treatment:</strong> Amprolium or toltrazuril under veterinary guidance.</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">2. Gumboro Disease (IBD)</h4>
              <p className="text-xs text-slate-300"><strong>Cause:</strong> Contagious virus damaging the bursa and weakening immunity.</p>
              <p className="text-xs text-slate-300"><strong>Signs:</strong> Sudden depression, whitish watery diarrhoea, trembling, weakness, dehydration, and sudden mortality.</p>
              <p className="text-xs text-slate-300"><strong>Treatment:</strong> Supportive care, clean water, and electrolyte replacement. No direct antiviral cure.</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">3. Newcastle Disease</h4>
              <p className="text-xs text-slate-300"><strong>Cause:</strong> Newcastle disease paramyxovirus.</p>
              <p className="text-xs text-slate-300"><strong>Signs:</strong> Coughing, sneezing, greenish diarrhoea, twisted necks, and sudden high flock mortality.</p>
              <p className="text-xs text-slate-300"><strong>Action:</strong> Urgent veterinary investigation. Restrict movement immediately if suspected.</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-base">4. Chronic Respiratory Disease (CRD)</h4>
              <p className="text-xs text-slate-300"><strong>Cause:</strong> Mycoplasma gallisepticum, worsened by ammonia and dust.</p>
              <p className="text-xs text-slate-300"><strong>Signs:</strong> Sneezing, rattling, nasal discharge, foamy eyes, and slow growth.</p>
              <p className="text-xs text-slate-300"><strong>Treatment:</strong> Tylosin or doxycycline via veterinarian selection.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-extrabold">2</span>
            Other Common Conditions & Problems
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase">
                  <th className="p-3.5">Condition</th>
                  <th className="p-3.5">Signs to Watch For</th>
                  <th className="p-3.5">Main Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold text-white">Fowl Pox</td>
                  <td className="p-3.5">Wart-like scabs on comb and wattles</td>
                  <td className="p-3.5">Mosquito control, vaccination</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Necrotic Enteritis</td>
                  <td className="p-3.5">Sudden deaths, dark droppings</td>
                  <td className="p-3.5">Manage litter, control coccidiosis</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Colibacillosis (E. coli)</td>
                  <td className="p-3.5">Swollen eyes, respiratory distress</td>
                  <td className="p-3.5">Improve ventilation, sanitise water</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Heat Stress</td>
                  <td className="p-3.5">Open-mouth panting, wings held out</td>
                  <td className="p-3.5">Increase airflow, cool clean water</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Ascites (Water Belly)</td>
                  <td className="p-3.5">Enlarged fluid-filled abdomen</td>
                  <td className="p-3.5">Improve ventilation and oxygen flow</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Brooder Chilling</td>
                  <td className="p-3.5">Loud chirping, tight huddling</td>
                  <td className="p-3.5">Increase brooder temperature, block drafts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-extrabold">6</span>
            6-Week Broiler Vaccination Schedule in Nigeria
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase">
                  <th className="p-3.5">Approximate Age</th>
                  <th className="p-3.5">Vaccine / Task</th>
                  <th className="p-3.5">Important Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold text-white">Day 1</td>
                  <td className="p-3.5">Hatchery Record Check</td>
                  <td className="p-3.5">Confirm what vaccines were given at the hatchery.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Day 7–10</td>
                  <td className="p-3.5">Newcastle Vaccine (Lasota/HB1)</td>
                  <td className="p-3.5">Administer via eye-drop or clean drinking water.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Day 10–14</td>
                  <td className="p-3.5">1st Gumboro (IBD) Vaccine</td>
                  <td className="p-3.5">Timing depends on maternal antibodies.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Day 18–21</td>
                  <td className="p-3.5">Gumboro Booster</td>
                  <td className="p-3.5">Second dose for sustained immunity.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-white">Day 21–28</td>
                  <td className="p-3.5">Newcastle Booster</td>
                  <td className="p-3.5">Final viral booster before heavy growth phase.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-sm font-extrabold">9</span>
              Farm Preparation & Biosecurity Checklist
            </h3>
            <button onClick={resetChecklist} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'hatchery', label: 'Buy chicks from a reputable hatchery with vaccination history' },
              { id: 'clean', label: 'Clean and disinfect poultry house between flocks' },
              { id: 'water', label: 'Provide clean, tested water daily and inspect drinkers' },
              { id: 'visitors', label: 'Control visitors, footwear, and equipment movement' },
              { id: 'rodents', label: 'Control rodents, flies, and wild birds around feed stores' },
              { id: 'litter', label: 'Keep wood shavings litter dry and prevent ammonia build-up' },
              { id: 'records', label: 'Record daily feed, water, mortality, and medication' },
              { id: 'vet', label: 'Establish veterinary support before stocking' },
            ].map(item => (
              <div key={item.id} onClick={() => toggleCheck(item.id)} className="cursor-pointer p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex items-center gap-3 transition">
                <span className="text-emerald-400">
                  {checklist[item.id] ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-600" />}
                </span>
                <span className={`text-xs ${checklist[item.id] ? 'line-through text-slate-500' : 'text-slate-200'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-800/50 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Interactive Planning Tool</span>
            <h3 className="text-2xl font-extrabold text-white">Let's Plan Your First Flock</h3>
            <p className="text-xs text-slate-300">Customize your parameters below to generate a tailored estimate for your batch.</p>
          </div>

          <form onSubmit={generatePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">How many broilers do you want to start with?</label>
                <select value={flockSize} onChange={(e) => setFlockSize(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold">
                  <option value="50">50 birds — small trial flock</option>
                  <option value="100">100 birds — manageable first commercial batch</option>
                  <option value="200">200 birds</option>
                  <option value="500">500 or more birds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Do you already have a poultry house?</label>
                <select value={hasHouse} onChange={(e) => setHasHouse(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold">
                  <option value="yes">Yes, an existing building I can adapt</option>
                  <option value="no">No, I need to build one</option>
                  <option value="temp">I plan to use a temporary structure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">What is your available startup budget?</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold">
                  <option value="below-100k">Below ₦100,000</option>
                  <option value="100000-200000">₦100,000–₦200,000</option>
                  <option value="200000-400000">₦200,000–₦400,000</option>
                  <option value="400000-800000">₦400,000–₦800,000</option>
                  <option value="above-800k">Above ₦800,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">How much poultry experience do you have?</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold">
                  <option value="beginner">I'm a beginner</option>
                  <option value="previous">I've raised broilers before</option>
                  <option value="experienced">I have substantial poultry experience</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition">
              <Calculator className="w-4 h-4" />
              <span>Prepare My Broiler Farm Plan</span>
            </button>
          </form>

          {planResult && (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs leading-relaxed space-y-2">
              <strong className="block text-sm text-white font-bold">Your Custom Batch Blueprint:</strong>
              <p>{planResult}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}