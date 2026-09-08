import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, ShieldCheck, AlertCircle, 
  CheckCircle2, Utensils, Sparkles, ChevronRight, HelpCircle, 
  Apple, Flame, Scale 
} from 'lucide-react';
import { FOOD_DATABASE } from '../data/sampleData';
import { FoodGuideItem } from '../types';

export const FoodDatabaseView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGi, setSelectedGi] = useState<string>('all');

  // Plate method simulator interactive state
  const [plateVeggie, setPlateVeggie] = useState<string>('Mchicha na Sukuma Wiki');
  const [plateProtein, setPlateProtein] = useState<string>('Samaki Sato wa Kuoka');
  const [plateCarb, setPlateCarb] = useState<string>('Ugali wa Dona (Kipande cha Wastani)');

  const filteredFoods = FOOD_DATABASE.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.swahiliName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesGi = selectedGi === 'all' || item.gi === selectedGi;
    return matchesSearch && matchesCategory && matchesGi;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Kamusi ya Vyakula & Elimu ya Lishe ya Kisukari</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Fahamu viwango vya Glycemic Index (GI), wanga, na jinsi ya kupanga sahani salama ya vyakula vya Afrika Mashariki
        </p>
      </div>

      {/* Interactive Plate Method Visualizer (Mbinu ya Sahani ya Kisukari) */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>Mwongozo wa Kimataifa wa Kisukari (Plate Method)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Mbinu ya Sahani ya Kisukari (Mpangilio Sahihi)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Njia rahisi zaidi ya kudhibiti sukari bila kupima gramu kwa mizani kila wakati:
            </p>
          </div>
        </div>

        {/* Visual Interactive Plate */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Circular Plate Illustration */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-slate-800 border-8 border-slate-700 shadow-2xl p-2 flex flex-col overflow-hidden">
              {/* Top Half: 1/2 Non-starchy vegetables */}
              <div className="h-1/2 w-full bg-emerald-600/90 rounded-t-full p-3 flex flex-col items-center justify-center text-center border-b-2 border-slate-700 hover:bg-emerald-500 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  1/2 ya Sahani (50%)
                </span>
                <span className="text-xs font-bold text-white mt-0.5">Mboga za Majani</span>
                <span className="text-[10px] text-emerald-200 line-clamp-1">{plateVeggie}</span>
              </div>

              {/* Bottom Half: Split into 1/4 Protein & 1/4 Carbs */}
              <div className="h-1/2 w-full flex">
                {/* 1/4 Lean Protein */}
                <div className="w-1/2 h-full bg-blue-600/90 rounded-bl-full p-2.5 flex flex-col items-center justify-center text-center border-r-2 border-slate-700 hover:bg-blue-500 transition-colors">
                  <span className="text-[10px] font-black uppercase text-blue-100">1/4 (25%)</span>
                  <span className="text-xs font-bold text-white">Protini Bora</span>
                  <span className="text-[9px] text-blue-200 line-clamp-1">{plateProtein}</span>
                </div>

                {/* 1/4 Complex Carbs */}
                <div className="w-1/2 h-full bg-amber-600/90 rounded-br-full p-2.5 flex flex-col items-center justify-center text-center hover:bg-amber-500 transition-colors">
                  <span className="text-[10px] font-black uppercase text-amber-100">1/4 (25%)</span>
                  <span className="text-xs font-bold text-white">Wanga Wenye Nyuzi</span>
                  <span className="text-[9px] text-amber-200 line-clamp-1">{plateCarb}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Plate Builder Selectors */}
          <div className="md:col-span-6 space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                1/2 Sahani: Chagua Mboga za Majani (GI Ndogo Sana):
              </label>
              <select
                value={plateVeggie}
                onChange={(e) => setPlateVeggie(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="Mchicha na Sukuma Wiki">Mchicha na Sukuma Wiki (Salama Sana)</option>
                <option value="Kisamvu cha Nazi Kiasi">Kisamvu cha Majani ya Mihogo</option>
                <option value="Kabichi na Karoti Kiasi">Saladi ya Kabichi na Matango</option>
                <option value="Broccoli na Bamia">Bamia na Mboga Chotara</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                1/4 Sahani: Chagua Protini Bora (0g Wanga):
              </label>
              <select
                value={plateProtein}
                onChange={(e) => setPlateProtein(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="Samaki Sato wa Kuoka">Samaki Sato wa Kuoka / Kupaka (Omega-3)</option>
                <option value="Dagaa wa Kukaanga Kiasi">Dagaa wa Ziwa Victoria</option>
                <option value="Kuku wa Kienyeji bila Ngozi">Kuku wa Kienyeji Konda</option>
                <option value="Maharage ya Kuchemsha / Kunde">Maharage ya Kuchemsha / Kunde</option>
                <option value="Mayai 2 ya Kuchemsha">Mayai 2 ya Kuchemsha</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                1/4 Sahani: Chagua Wanga Wenye Nyuzinyuzi (Complex Carbs):
              </label>
              <select
                value={plateCarb}
                onChange={(e) => setPlateCarb(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="Ugali wa Dona (Kipande cha Wastani)">Ugali wa Dona (GI ya Wastani - Bora)</option>
                <option value="Ugali wa Mtama na Ulezi">Ugali wa Mtama na Ulezi (GI Chini - Salama Sana)</option>
                <option value="Wali wa Brown (Kikombe 1)">Wali wa Brown (Brown Rice)</option>
                <option value="Ndizi Mbichi 2 za Kuchemsha">Ndizi Mbichi 2 za Kuchemsha (Machalari)</option>
                <option value="Viazi Vitamu vya Kuchemsha Kiasi">Viazi Vitamu vya Kuchemsha</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              ✓ <strong>Mbinu ya Kula:</strong> Anza kula mboga na protini kwanza, kisha malizia na wanga. Hii hupunguza kasi ya sukari kupanda kwa zaidi ya 40%!
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters for Food Library */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tafuta chakula (mfano: Ugali, Ndizi, Parachichi, Samaki, Chapati)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Makundi Yote ya Vyakula</option>
            <option value="Wanga">Wanga & Nafaka</option>
            <option value="Mboga">Mboga za Majani</option>
            <option value="Protini">Protini & Samaki/Maharage</option>
            <option value="Matunda">Matunda</option>
            <option value="Vinywaji">Vinywaji</option>
          </select>

          {/* GI Filter */}
          <select
            value={selectedGi}
            onChange={(e) => setSelectedGi(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Glycemic Index Zote</option>
            <option value="Chini">GI ya Chini (Salama)</option>
            <option value="Wastani">GI ya Wastani</option>
            <option value="Juu">GI ya Juu (Tahadhari)</option>
          </select>
        </div>

        {/* Food Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredFoods.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.gi === 'Chini' ? 'bg-emerald-100 text-emerald-800' :
                    item.gi === 'Wastani' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    GI: {item.gi} ({item.giValue})
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.safety === 'Salama Sana' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                    item.safety === 'Salama kwa Kiasi' ? 'bg-blue-50 text-blue-700 border border-blue-300' :
                    item.safety === 'Tumia kwa Tahadhari' ? 'bg-amber-50 text-amber-700 border border-amber-300' :
                    'bg-rose-50 text-rose-700 border border-rose-300'
                  }`}>
                    {item.safety}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              {/* Nutrition summary */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                <span>Wanga/100g: <strong className="text-emerald-700">{item.carbsPer100g}g</strong></span>
                <span>Nyuzi (Fiber): <strong className="text-teal-700">{item.fiberPer100g}g</strong></span>
              </div>

              {/* Diabetic Tip */}
              <div className="text-xs text-slate-700 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900">Ushauri kwa Mgonjwa: </span>
                {item.tips}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
