import React, { useState } from 'react';
import { 
  Apple, Utensils, Heart, Shield, Droplets, Sparkles, BookOpen, 
  CheckCircle2, AlertTriangle, Baby, UserCheck, Flame, Scale, ChevronRight
} from 'lucide-react';

export const GeneralNutritionGuideView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('plate');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-teal-700/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <Apple className="w-3.5 h-3.5" />
            <span>Mwongozo wa Taifa wa Lishe Bora & Afya ya Jamii</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ushauri wa Kilishe kwa Ujumla (General Nutrition Guide)
          </h2>
          <p className="text-sm text-teal-100/90 max-w-2xl">
            Jifunze mpangilio sahihi wa sahani bora ya chakula cha Kitanzania, vyakula vya kuimarisha kinga ya mwili, na kanuni za kuzuia magonjwa yasiyoambukiza kama presha na moyo.
          </p>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar text-xs sm:text-sm font-bold">
        <button
          onClick={() => setSelectedCategory('plate')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === 'plate'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Sahani Kamili ya Chakula Bora
        </button>

        <button
          onClick={() => setSelectedCategory('groups')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === 'groups'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Makundi 6 ya Vyakula
        </button>

        <button
          onClick={() => setSelectedCategory('prevention')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === 'prevention'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Kinga ya Presha & Moyo
        </button>

        <button
          onClick={() => setSelectedCategory('life_stages')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === 'life_stages'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Lishe Kulingana na Rika
        </button>

        <button
          onClick={() => setSelectedCategory('cooking_tips')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            selectedCategory === 'cooking_tips'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Kanuni za Upishi Salama
        </button>
      </div>

      {/* Category 1: The Healthy Balanced Plate */}
      {selectedCategory === 'plate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Kanuni ya "Sahani Kamili" ya Chakula Bora cha Kitanzania (The Healthy Plate Model)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kila mlo wako mkuu unapaswa kugawanywa kwa uwiano ufuatao ili kuupa mwili virutubisho vyote bila kurundika wanga na mafuta:
              </p>
            </div>

            {/* Visual Plate Representation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Graphic plate breakdown */}
              <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-8 border-slate-300 overflow-hidden shadow-inner flex flex-col">
                  {/* Top Half: 50% Vegetables & Fruits */}
                  <div className="h-1/2 w-full bg-emerald-600 text-white p-3 flex flex-col items-center justify-center text-center">
                    <span className="font-black text-sm uppercase tracking-wider">50% ya Sahani</span>
                    <span className="text-xs font-bold mt-0.5">Mboga za Majani & Matunda</span>
                    <span className="text-[10px] text-emerald-100">Mchicha, Sukuma, Matembele, Saladi, Matango</span>
                  </div>

                  {/* Bottom Half split 25% Carbs + 25% Protein */}
                  <div className="h-1/2 w-full flex">
                    {/* Bottom Left: 25% Whole Grains */}
                    <div className="w-1/2 h-full bg-amber-600 text-white p-2 flex flex-col items-center justify-center text-center border-r-2 border-white">
                      <span className="font-black text-xs uppercase">25% Wanga</span>
                      <span className="text-[10px] font-bold mt-0.5">Nafaka Zisizokobolewa</span>
                      <span className="text-[9px] text-amber-100">Dona, Ulezi, Mtama, Brown Rice</span>
                    </div>

                    {/* Bottom Right: 25% Lean Protein */}
                    <div className="w-1/2 h-full bg-teal-600 text-white p-2 flex flex-col items-center justify-center text-center">
                      <span className="font-black text-xs uppercase">25% Protini</span>
                      <span className="text-[10px] font-bold mt-0.5">Protini Safi</span>
                      <span className="text-[9px] text-teal-100">Samaki, Dagaa, Maharage, Mayai, Kuku</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-bold mt-4">
                  + Glasi 1 ya Maji Safi & Kipande cha Tunda Pembeni
                </span>
              </div>

              {/* Explanations */}
              <div className="md:col-span-6 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    <h4 className="text-sm font-black text-emerald-950">1. Nusu ya Sahani (50%): Mboga za Majani & Saladi</h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Mboga hutoa vitamini (A, C, K), madini (chuma, potassium, magnesium) na nyuzinyuzi zinazosaidia kuzuia choo kigumu na kupunguza kasi ya wanga kufyonzwa kwenye damu.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                    <h4 className="text-sm font-black text-amber-950">2. Robo ya Sahani (25%): Wanga Bora wa Asili</h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Tumia wanga wa ngumi moja: ugali wa dona au ulezi, viazi vitamu, ndizi za kupika au wali wa kahawia. Epuka kujaza sahani nzima ugali wa sembe kama ilivyo desturi ya wengi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                    <h4 className="text-sm font-black text-teal-950">3. Robo ya Sahani (25%): Protini Safi</h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Hujenga na kukarabati seli, kuimarisha misuli na kutoa shibe ya kudumu. Pendelea samaki (sato, sangara, dagaa), mayai, dengu, maharage na kuku wa kienyeji asiye na mafuta.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Category 2: 6 Main Food Groups */}
      {selectedCategory === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '1. Nafaka & Mizizi (Nishati)',
              items: 'Dona, Ulezi, Mtama, Ngano kamili, Viazi vitamu, Mihogo ya kuchemsha.',
              role: 'Hutoa nguvu ya kufanya kazi na virutubisho vya kundi la Vitamin B.',
              color: 'border-amber-300 bg-amber-50/60 text-amber-950',
            },
            {
              title: '2. Mboga za Majani (Kinga & Madini)',
              items: 'Mchicha, Sukuma wiki, Matembele, Mnavu, Kisamvu, Mlenda, Saladi.',
              role: 'Kinga dhidi ya saratani, kuzuia upungufu wa damu na kudhibiti shinikizo la damu.',
              color: 'border-emerald-300 bg-emerald-50/60 text-emerald-950',
            },
            {
              title: '3. Matunda Asilia (Vitamini & Antioxidants)',
              items: 'Mapera, Machungwa, Mapapai, Ndizi mbivu, Embe, Parachichi, Tikiti.',
              role: 'Huongeza kinga ya mwili (Vitamini C & A) na kulinda ngozi na macho.',
              color: 'border-orange-300 bg-orange-50/60 text-orange-950',
            },
            {
              title: '4. Jamii ya Wanyama & Samaki (Ujenzi)',
              items: 'Samaki wa maji baridi na baharini, Dagaa, Mayai, Kuku, Nyama konda.',
              role: 'Protini yenye asidi amino zote, Madini chuma yanayofyonzwa haraka, na Vitamin B12.',
              color: 'border-teal-300 bg-teal-50/60 text-teal-950',
            },
            {
              title: '5. Jamii ya Mikunde & Mbegu (Mimea)',
              items: 'Maharage ya soya, Dengu, Njegere, Kunde, Mbegu za maboga, Alizeti, Karanga.',
              role: 'Protini safi isiyo na lehemu (cholesterol) na utajiri mkubwa wa Zinc na Magnesium.',
              color: 'border-indigo-300 bg-indigo-50/60 text-indigo-950',
            },
            {
              title: '6. Mafuta na Sukari (Kiasi Kidogo Sana)',
              items: 'Mafuta ya alizeti, mzeituni, nazi halisi. Epuka mafuta ya wanyama yaliyoganda.',
              role: 'Husaidia kufyonza vitamini A, D, E, K. Tumia vijiko 2 tu kwa siku wakati wa kupika.',
              color: 'border-rose-300 bg-rose-50/60 text-rose-950',
            },
          ].map((group, idx) => (
            <div key={idx} className={`p-4 sm:p-5 rounded-2xl border ${group.color} space-y-2`}>
              <h4 className="font-extrabold text-sm">{group.title}</h4>
              <p className="text-xs font-semibold text-slate-800">
                <strong>Mifano:</strong> {group.items}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Faida Mwilini:</strong> {group.role}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Category 3: Prevention of Hypertension & Heart Disease */}
      {selectedCategory === 'prevention' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <span>Lishe ya Kuzuia Shinikizo la Juu la Damu (Hypertension) na Magonjwa ya Moyo</span>
            </h3>
            <p className="text-xs text-slate-500">
              Zaidi ya 70% ya vifo vitokanavyo na mshtuko wa moyo au kiharusi vinaweza kuzuilika kwa mtindo huu wa ulaji (DASH Diet principles):
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="font-extrabold text-emerald-950 text-sm block">Vitu vya Kufanya Kila Siku:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                <li><strong>Kula Vyakula Vyenye Madini ya Potassium:</strong> Ndizi, parachichi, mchicha na viazi vitamu husaidia kutoa chumvi iliyozidi mwilini kupitia mkojo.</li>
                <li><strong>Tumia Kitunguu Saumu na Tangawizi:</strong> Husaidia mishipa ya damu kutanuka (Vasodilation) na kupunguza msukumo wa damu.</li>
                <li><strong>Kula Samaki Mara 2 hadi 3 kwa Wiki:</strong> Mafuta ya Omega-3 husafisha kuta za mishipa ya damu na kuzuia kuganda kwa damu.</li>
                <li><strong>Tembea Dakika 30 Kila Siku:</strong> Hupunguza msongo wa mawazo na kuimarisha misuli ya moyo.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="font-extrabold text-rose-950 text-sm block">Vitu vya Kupunguza au Kusitisha Kabisa:</span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                <li><strong>Punguza Chumvi:</strong> Isizidi kijiko 1 kidogo cha chai (chini ya gramu 5) kwa siku nzima ya kupikia familia. Usiongeze chumvi mbichi mezani.</li>
                <li><strong>Epuka Vyakula Vyenye Mafuta ya Trans:</strong> Chipsi za kukaangwa kwenye mafuta yaliyorudiwa mara nyingi, keki za viwandani, na nyama za kusindikwa (sausages).</li>
                <li><strong>Punguza Unywaji wa Pombe:</strong> Pombe kali na bia nyingi hupandisha shinikizo la damu moja kwa moja na kuongeza mafuta ya ini.</li>
                <li><strong>Sitisha Matumizi ya Sigara na Tumbaku:</strong> Huharibu safu ya ndani ya mishipa ya damu.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Category 4: Life Stages */}
      {selectedCategory === 'life_stages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <Baby className="w-5 h-5" />
              <h4 className="font-black text-sm">Watoto & Vijana Wanaokua</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wanahitaji protini nyingi (mayai, maziwa, samaki, kunde) kwa ukuaji wa ubongo na kimo. Hakikisha wanapata unga wa lishe wenye ulezi, soya na ngano badala ya kuwapa soda na biskuti za sukari.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-800">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-black text-sm">Wajawazito & Wanaonyonyesha</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ulaji wenye madini chuma (dagaa, spinachi, maini) kuzuia upungufu wa damu (Anemia), Folic acid ya kuzuia ulemavu wa mgongo wa mtoto, na Calcium (maziwa/dagaa) kwa mifupa imara.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-800">
              <UserCheck className="w-5 h-5" />
              <h4 className="font-black text-sm">Wazee & Watu Wazima (50+)</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kimetaboliki inapungua, hivyo wanahitaji kalori kidogo lakini nyuzinyuzi nyingi na maji mengi. Punguza nyama nyekundu na ongeza samaki, mboga za asili zilizopikwa vizuri, na supu nyepesi za mboga.
            </p>
          </div>

        </div>
      )}

      {/* Category 5: Safe Cooking Tips */}
      {selectedCategory === 'cooking_tips' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Kanuni 6 za Upishi Salama wa Asili ya Kitanzania Bila Kupoteza Virutubisho
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">1. Usichemshe Mboga za Majani Kupita Kiasi:</strong>
              <span className="text-slate-600">Mboga zikipikwa hadi kubadilika kuwa rangi ya kahawia zinapoteza 80% ya Vitamini C na Folate. Zichemshe dakika 3 hadi 5 tu zikiwa za kijani kibichi.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">2. Epuka Kurudia Mafuta ya Kukaanga:</strong>
              <span className="text-slate-600">Mafuta yakichomwa mara 2 au 3 hutengeneza viambata vya saratani (Carcinogenic Free Radicals) na mafuta ya trans yanayoziba mishipa ya moyo.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">3. Tumia Viungo Asili Badala ya Vipodozi vya Viwandani:</strong>
              <span className="text-slate-600">Tumia kitunguu saumu, tangawizi, mdalasini, bizari na manjano badala ya cubes za viwandani zenye chumvi nyingi ya MSG (Monosodium Glutamate).</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">4. Upishi wa Mvuke na Kuchemsha:</strong>
              <span className="text-slate-600">Pika samaki, kuku na viazi kwa njia ya mvuke (steaming) au kuchoma kiasi badala ya kuvisambaza kwenye sufuria nzima ya mafuta (deep frying).</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">5. Osha Mboga Kabla ya Kuzikata:</strong>
              <span className="text-slate-600">Ukikata mboga kwanza kisha ukaziosha kwenye maji yanayotiririka, vitamini zote zinazoyeyuka kwenye maji (B na C) huoshwa na kupotea.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">6. Hifadhi ya Nafaka na Unga:</strong>
              <span className="text-slate-600">Unga wa dona na ulezi una kiinitete hai (germ) hivyo unapaswa kuhifadhiwa mahali pakavu na baridi kuzuia usiharibike au kupata uvundo.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
