export interface TanzaniaRegionData {
  name: string;
  zone: 'Pwani' | 'Kati' | 'Kaskazini' | 'Ziwa' | 'Nyanda za Juu Kusini' | 'Kusini' | 'Magharibi' | 'Zanzibar';
  districts: string[];
  commonStaples: string[];
  commonVegetables: string[];
  commonProteins: string[];
  localSpecialties: string[];
  dietaryAdviceSummary: string;
}

export const TANZANIA_REGIONS: TanzaniaRegionData[] = [
  {
    name: 'Dar es Salaam',
    zone: 'Pwani',
    districts: ['Ilala', 'Kinondoni', 'Ubungo', 'Temeke', 'Kigamboni'],
    commonStaples: ['Uji wa Ulezi na Mtama', 'Ugali wa Dona', 'Viazi Vitamu vya Kuchemsha', 'Muhogo Mbichi wa Kuchemsha'],
    commonVegetables: ['Mchicha', 'Kisamvu (Bila Nazi Nyingi)', 'Matembele', 'Bamia', 'Majani ya Maboga'],
    commonProteins: ['Samaki Wabichi (Changu, Pono, Jodari)', 'Dagaa wa Kigoma/Mwanza', 'Maharage ya Nambale', 'Kuku wa Kienyeji'],
    localSpecialties: ['Mchuzi Mwepesi wa Samaki', 'Kisamvu cha Karanga', 'Supu ya Samaki na Tangawizi'],
    dietaryAdviceSummary: 'Huko Dar es Salaam, tumia kwa wingi samaki wabichi wa baharini na dagaa badala ya nyama nyekundu. Pika kisamvu na matembele kwa kitunguu swaumu badala ya mafuta mengi au nazi nzito.',
  },
  {
    name: 'Dodoma',
    zone: 'Kati',
    districts: ['Dodoma Jiji', 'Bahi', 'Chamwino', 'Chemba', 'Kondoa', 'Kongwa', 'Mpwapwa'],
    commonStaples: ['Ugali wa Mtama Mweupe/Mwekundu', 'Uji wa Ulezi', 'Ugali wa Dona', 'Viazi Vitamu vya Asili'],
    commonVegetables: ['Mlenda wa Kienyeji', 'Ilende', 'Chisanji', 'Kunde (Mboga za Majani)', 'Mchicha'],
    commonProteins: ['Kuku wa Kienyeji wa Asili', 'Dengu', 'Kunde Kavu', 'Karanga Changa', 'Nyama Konda ya Mbuzi'],
    localSpecialties: ['Mlenda Usiotiwa Magadi Mengi', 'Supu ya Kuku wa Kienyeji na Zabibu Kavu', 'Uji wa Mtama na Ulezi'],
    dietaryAdviceSummary: 'Dodoma ina utajiri mkubwa wa nafaka zisizokobolewa kama mtama na ulezi zenye glycemic index ndogo. Mlenda na mboga za asili zina nyuzinyuzi nyingi zinazoshusha sukari na presha kwa haraka.',
  },
  {
    name: 'Arusha',
    zone: 'Kaskazini',
    districts: ['Arusha Jiji', 'Arusha DC', 'Meru', 'Karatu', 'Monduli', 'Longido', 'Ngorongoro'],
    commonStaples: ['Ndizi za Kupika (Mshale/Uganda)', 'Ugali wa Dona Safi', 'Ngano Kamili', 'Viazi Mviringo vya Kuchemsha'],
    commonVegetables: ['Mboga za Majani za Kienyeji', 'Brokoli ya Kienyeji', 'Kabichi Safi', 'Majani ya Maboga', 'Kisamvu'],
    commonProteins: ['Maziwa Mgando Asilia (Kupunguza Mafuta)', 'Maharage ya Nambale/Soya', 'Kuku wa Kienyeji', 'Nyama Konda'],
    localSpecialties: ['Machalari ya Ndizi na Mboga Nyingi', 'Kisamvu cha Karanga za Meru', 'Supu ya Mbuzi Konda'],
    dietaryAdviceSummary: 'Arusha ina wingi wa parachichi, mboga za kijani na ndizi za kupika. Punguza ulaji wa nyama choma na badala yake tumia machalari ya ndizi chache na mboga nyingi za majani pamoja na maharage.',
  },
  {
    name: 'Kilimanjaro',
    zone: 'Kaskazini',
    districts: ['Moshi Mjini', 'Moshi Vijijini', 'Hai', 'Siha', 'Rombo', 'Mwanga', 'Same'],
    commonStaples: ['Ndizi za Kupika (Mshale, Nshara)', 'Ugali wa Dona', 'Uji wa Ulezi na Maziwa Konda', 'Viazi Vitamu'],
    commonVegetables: ['Mchicha wa Moshi', 'Maboga na Majani Yake', 'Kisamvu', 'Saladi ya Asili ya Parachichi na Nyanya'],
    commonProteins: ['Maharage ya Rombo/Hai', 'Samaki wa Bwawa la Nyumba ya Mungu', 'Maziwa Freshi/Mgando', 'Kuku wa Kienyeji'],
    localSpecialties: ['Machalari Yasiyo na Mafuta Mengi', 'Nshare za Ndizi na Maharage', 'Kisamvu cha Asili'],
    dietaryAdviceSummary: 'Kilimanjaro ina ndizi na parachichi tele. Kwa wagonjwa wa kisukari, kula ndizi zisizozidi mbili zilizochanganywa na mboga nyingi za majani na maharage ili kuzuia sukari kupanda.',
  },
  {
    name: 'Mwanza',
    zone: 'Ziwa',
    districts: ['Nyamagana', 'Ilemela', 'Magu', 'Misungwi', 'Sengerema', 'Ukerewe', 'Kwimba'],
    commonStaples: ['Ugali wa Dona ya Mahindi', 'Ugali wa Muhogo Changa', 'Viazi Lishe vya Orange', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu Safi', 'Matembele ya Ziwani', 'Mchicha', 'Mrenda', 'Majani ya Kunde'],
    commonProteins: ['Samaki Sato (Tilapia)', 'Sangara Konda (Nile Perch)', 'Dagaa Safi wa Ziwa Victoria', 'Maharage ya Nyanza'],
    localSpecialties: ['Sato wa Kuchemsha na Tangawizi', 'Dagaa wa Kukaanga kwa Maji na Nyanya', 'Supu ya Sangara'],
    dietaryAdviceSummary: 'Mwanza ina utajiri wa samaki sato, sangara na dagaa wenye mafuta mazuri ya Omega-3 yanayolinda moyo na kurekebisha presha. Tumia samaki wa kuchemsha au kubana badala ya kukaanga kwa mafuta mengi.',
  },
  {
    name: 'Mbeya',
    zone: 'Nyanda za Juu Kusini',
    districts: ['Mbeya Jiji', 'Mbeya Vijijini', 'Rungwe', 'Kyela', 'Chunya', 'Mbarali'],
    commonStaples: ['Ugali wa Dona Safi', 'Mchele wa Brown/Nusu-Kobole wa Kyela', 'Ndizi za Tukuyu', 'Viazi Vitamu vya Kuchemsha'],
    commonVegetables: ['Kisamvu cha Rungwe', 'Mchicha wa Majani Mapana', 'Kabichi', 'Kunde za Kienyeji', 'Matembele'],
    commonProteins: ['Maharage ya Uyole/Mbeya', 'Samaki wa Ziwa Nyasa/Kyela', 'Maziwa ya Asili ya Rungwe', 'Dengu'],
    localSpecialties: ['Mchuzi wa Maharage Safi na Parachichi', 'Ndizi za Kuchemsha na Samaki', 'Uji wa Ulezi na Maziwa Konda'],
    dietaryAdviceSummary: 'Mbeya ina ardhi yenye rutuba ya maharage, parachichi na viazi lishe. Maharage ya Mbeya yana protini na nyuzinyuzi nyingi zinazosaidia kudhibiti uzito na kuweka sukari katika uwiano bora.',
  },
  {
    name: 'Morogoro',
    zone: 'Pwani',
    districts: ['Morogoro Mjini', 'Morogoro Vijijini', 'Kilosa', 'Kilombero', 'Ulanga', 'Mvomero', 'Gairo', 'Malinyi'],
    commonStaples: ['Ugali wa Dona Safi', 'Mchele wa Kilombero (Kiasi Kidogo)', 'Viazi Vitamu', 'Muhogo wa Kuchemsha'],
    commonVegetables: ['Matembele Safi', 'Kisamvu cha Uluguru', 'Mchicha', 'Bamia', 'Majani ya Maboga'],
    commonProteins: ['Samaki wa Mto Kilombero/Wami', 'Dagaa', 'Maharage ya Kilosa', 'Dengu', 'Kuku wa Kienyeji'],
    localSpecialties: ['Mchuzi wa Samaki na Bamia', 'Kisamvu cha Karanga Safi', 'Supu ya Kuku wa Asili'],
    dietaryAdviceSummary: 'Morogoro ina mboga za majani tele za milima ya Uluguru. Punguza ulaji wa wali mweupe mwingi wa Kilombero na badala yake pendelea ugali wa dona, viazi vitamu, na mboga nyingi za kijani.',
  },
  {
    name: 'Tanga',
    zone: 'Pwani',
    districts: ['Tanga Jiji', 'Muheza', 'Pangani', 'Korogwe', 'Lushoto', 'Handeni', 'Kilindi', 'Mkinga'],
    commonStaples: ['Ugali wa Dona', 'Ndizi za Lushoto', 'Muhogo wa Kuchemsha', 'Viazi Mviringo vya Usambara'],
    commonVegetables: ['Mboga za Lushoto (Brokoli, Kabichi, Koliflower, Figili)', 'Mchicha', 'Kisamvu', 'Bamia'],
    commonProteins: ['Samaki Wabichi wa Baharini (Kolekole, Tasi)', 'Dagaa wa Tanga', 'Maharage ya Lushoto', 'Dengu'],
    localSpecialties: ['Supu ya Samaki Tanga', 'Mchuzi wa Dagaa na Mboga za Usambara', 'Kisamvu kisicho na mafuta mengi'],
    dietaryAdviceSummary: 'Tanga inajumuisha pwani na milima ya Usambara yenye mboga adimu za kijani. Tumia samaki wa baharini na mboga za Lushoto zilizopikwa kwa mvuke ili kulinda mishipa ya damu na presha.',
  },
  {
    name: 'Kagera',
    zone: 'Ziwa',
    districts: ['Bukoba Mjini', 'Bukoba Vijijini', 'Muleba', 'Karagwe', 'Kyerwa', 'Missenyi', 'Ngara'],
    commonStaples: ['Ndizi za Bukoba (Matoke)', 'Ugali wa Dona ya Mahindi', 'Viazi Lishe', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu cha Asili', 'Mchicha wa Bukoba', 'Doodo (Mchicha Pori)', 'Majani ya Maboga'],
    commonProteins: ['Samaki wa Ziwa Victoria (Kambale, Sato)', 'Maharage ya Karagwe', 'Senene (Kwa msimu, bila kukaanga kwa mafuta mengi)', 'Kuku wa Kienyeji'],
    localSpecialties: ['Matoke ya Samaki na Maharage', 'Kisamvu cha Ndimu na Kitunguu Swamu', 'Supu ya Sato Safi'],
    dietaryAdviceSummary: 'Huko Kagera, matoke ni chakula kikuu. Kwa ajili ya kisukari na uzito, changanya matoke na maharage mengi ya Karagwe na mboga za asili ili kupunguza kasi ya wanga kugeuka sukari.',
  },
  {
    name: 'Kigoma',
    zone: 'Magharibi',
    districts: ['Kigoma Ujiji', 'Kigoma Vijijini', 'Kasulu', 'Kibondo', 'Buhigwe', 'Kakonko', 'Uvinza'],
    commonStaples: ['Ugali wa Dona', 'Ugali wa Muhogo Safi wa Kuchemsha', 'Viazi Vitamu', 'Uji wa Mtama'],
    commonVegetables: ['Kisamvu Safi', 'Sombe', 'Mchicha', 'Majani ya Maboga', 'Bamia'],
    commonProteins: ['Migebuka Safi ya Ziwa Tanganyika', 'Mukeke', 'Dagaa wa Kigoma Wenye Macho', 'Maharage ya Kasulu'],
    localSpecialties: ['Migebuka ya Kuchemsha na Pilipili Manga', 'Dagaa wa Ziwa Tanganyika na Sombe', 'Kisamvu kisicho na mafuta mengi'],
    dietaryAdviceSummary: 'Kigoma ina samaki wa kipekee wa Ziwa Tanganyika (Migebuka na Dagaa). Samaki hawa hawana mafuta mabaya bali wana madini ya Calcium na Protini inayojenga misuli bila kuongeza sukari.',
  },
  {
    name: 'Iringa',
    zone: 'Nyanda za Juu Kusini',
    districts: ['Iringa Mjini', 'Iringa Vijijini', 'Kilolo', 'Mufindi'],
    commonStaples: ['Ugali wa Dona ya Mahindi Safi', 'Viazi Mviringo vya Kuchemsha', 'Uji wa Ulezi', 'Viazi Vitamu'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Majani ya Kunde', 'Kabichi ya Baridi', 'Mboga za Kienyeji'],
    commonProteins: ['Maharage ya Iringa (Soya, Nambale)', 'Kuku wa Kienyeji', 'Maziwa Konda', 'Dengu'],
    localSpecialties: ['Mchuzi wa Maharage Safi ya Kilolo', 'Dona ya Asili na Mboga za Majani', 'Parachichi la Asili'],
    dietaryAdviceSummary: 'Iringa ina nafaka na maharage ya ubora wa juu. Ugali wa dona na mboga za asili zenye nyuzinyuzi husaidia kuongeza hisia ya kushiba na kuzuia ongezeko la uzito na kisukari.',
  },
  {
    name: 'Ruvuma',
    zone: 'Kusini',
    districts: ['Songea Mjini', 'Songea Vijijini', 'Mbinga', 'Nyasa', 'Namtumbo', 'Tunduru'],
    commonStaples: ['Ugali wa Dona Safi', 'Mchele wa Nusu-Kobole', 'Muhogo wa Kuchemsha', 'Viazi Vitamu'],
    commonVegetables: ['Kisamvu cha Ruvuma', 'Matembele', 'Mchicha', 'Majani ya Maboga'],
    commonProteins: ['Samaki wa Ziwa Nyasa (Mbasi, Mbeleje)', 'Maharage ya Mbinga', 'Kuku wa Asili', 'Dagaa'],
    localSpecialties: ['Samaki wa Ziwa Nyasa wa Kuchemsha', 'Kisamvu cha Karanga za Tunduru', 'Dona na Maharage ya Mbinga'],
    dietaryAdviceSummary: 'Ruvuma ina samaki bora wa Ziwa Nyasa na maharage ya Mbinga. Pendelea samaki wa kuchemsha au kuoka badala ya kukaanga, na unywe maji mengi wakati wa siku.',
  },
  {
    name: 'Tabora',
    zone: 'Magharibi',
    districts: ['Tabora Mjini', 'Uyui', 'Nzega', 'Igunga', 'Sikonge', 'Urambo', 'Kaliua'],
    commonStaples: ['Ugali wa Mtama', 'Ugali wa Dona', 'Uji wa Ulezi', 'Viazi Vitamu'],
    commonVegetables: ['Mlenda wa Asili', 'Ilende', 'Majani ya Maboga', 'Kunde', 'Kisamvu'],
    commonProteins: ['Kuku wa Kienyeji wa Asili', 'Karanga Safi', 'Dengu za Nzega', 'Nyama Konda ya Ng’ombe/Mbuzi'],
    localSpecialties: ['Ugali wa Mtama na Mlenda Safi', 'Supu ya Kuku wa Kienyeji', 'Uji wa Mtama Asilia'],
    dietaryAdviceSummary: 'Tabora ina mazao thabiti ya mtama na dengu. Mtama una nyuzi nyingi sana zinazozuia kisukari kisipande na husaidia tumbo kusaga chakula polepole.',
  },
  {
    name: 'Shinyanga',
    zone: 'Ziwa',
    districts: ['Shinyanga Mjini', 'Shinyanga Vijijini', 'Kishapu', 'Kahama Mjini', 'Ushetu', 'Msalala'],
    commonStaples: ['Ugali wa Mtama', 'Ugali wa Dona', 'Viazi Lishe vya Orange', 'Uji wa Ulezi'],
    commonVegetables: ['Mlenda wa Kienyeji', 'Kunde', 'Mchicha', 'Majani ya Maboga'],
    commonProteins: ['Maziwa Mgando Asilia', 'Kuku wa Kienyeji', 'Dengu za Kishapu', 'Samaki Sato wa Kahama'],
    localSpecialties: ['Ugali wa Mtama na Maziwa Mgando Konda', 'Mlenda na Kuku wa Kienyeji', 'Dengu Safi'],
    dietaryAdviceSummary: 'Huko Shinyanga, mtama na viazi lishe vyenye Vitamin A vinapatikana kwa urahisi. Kula mboga za majani za asili ili kuimarisha mishipa ya damu na kuzuia presha.',
  },
  {
    name: 'Mara',
    zone: 'Ziwa',
    districts: ['Musoma Mjini', 'Musoma Vijijini', 'Bunda', 'Tarime', 'Rorya', 'Serengeti', 'Butiama'],
    commonStaples: ['Ugali wa Ulezi na Muhogo', 'Ugali wa Dona', 'Viazi Vitamu vya Tarime', 'Uji wa Ulezi Safi'],
    commonVegetables: ['Kisamvu', 'Mchicha wa Ziwa', 'Matembele', 'Mlenda wa Serengeti', 'Majani ya Kunde'],
    commonProteins: ['Samaki Sato na Sangara wa Musoma', 'Dagaa wa Ziwa Victoria', 'Maharage ya Tarime', 'Maziwa ya Kienyeji'],
    localSpecialties: ['Sato Fresh wa Kuchemsha na Ndimu', 'Ugali wa Dona na Dagaa wa Musoma', 'Supu ya Sangara'],
    dietaryAdviceSummary: 'Mkoa wa Mara una samaki bora na ulezi wenye madini chuma. Chagua samaki wa maji baridi na ulezi kwa ajili ya kudhibiti kiwango cha sukari na kuongeza damu.',
  },
  {
    name: 'Manyara',
    zone: 'Kaskazini',
    districts: ['Babati Mjini', 'Babati Vijijini', 'Hanang', 'Mbulu', 'Simanjiro', 'Kiteto'],
    commonStaples: ['Ugali wa Ngano Kamili', 'Ugali wa Dona Safi', 'Nafaka za Mtama', 'Viazi Mviringo'],
    commonVegetables: ['Mboga za Kienyeji za Mbulu', 'Mchicha', 'Kabichi', 'Majani ya Maboga'],
    commonProteins: ['Mbaazi Safi za Babati', 'Maharage ya Hanang', 'Maziwa ya Kienyeji', 'Nyama Konda'],
    localSpecialties: ['Mbaazi za Kuchemsha na Mboga za Majani', 'Ugali wa Dona na Maharage ya Hanang', 'Supu Safi'],
    dietaryAdviceSummary: 'Manyara inasifika kwa mbaazi na ngano kamili. Mbaazi zina protini safi ya mimea na nyuzinyuzi zisizopandisha sukari wala presha.',
  },
  {
    name: 'Singida',
    zone: 'Kati',
    districts: ['Singida Mjini', 'Singida Vijijini', 'Iramba', 'Ikungi', 'Manyoni', 'Mkalama', 'Itigi'],
    commonStaples: ['Ugali wa Mtama Safi', 'Uji wa Ulezi', 'Ugali wa Dona', 'Viazi Vitamu'],
    commonVegetables: ['Mlenda wa Singida', 'Ilende', 'Chisanji', 'Kunde za Majani', 'Mchicha'],
    commonProteins: ['Kuku wa Kienyeji wa Singida', 'Dengu Safi', 'Kunde Kavu', 'Karanga'],
    localSpecialties: ['Mlenda wa Kienyeji usio na Magadi', 'Kuku wa Kienyeji wa Kuchemsha na Tangawizi', 'Ugali wa Mtama'],
    dietaryAdviceSummary: 'Singida ina mafuta bora ya alizeti na mtama. Tumia kiasi kidogo sana cha mafuta safi ya alizeti katika upishi, na utumie mtama kama chakula kikuu cha wanga.',
  },
  {
    name: 'Njombe',
    zone: 'Nyanda za Juu Kusini',
    districts: ['Njombe Mjini', 'Njombe Vijijini', 'Makambako', 'Wanging\'ombe', 'Ludewa', 'Makete'],
    commonStaples: ['Ugali wa Dona Safi', 'Ngano Kamili', 'Viazi Mviringo vya Makete', 'Viazi Vitamu'],
    commonVegetables: ['Kabichi Safi ya Baridi', 'Mchicha', 'Kisamvu cha Njombe', 'Mboga za Majani za Kienyeji'],
    commonProteins: ['Maharage ya Njombe', 'Parachichi Kubwa Safi', 'Samaki wa Ziwa Nyasa (Ludewa)', 'Maziwa Freshi'],
    localSpecialties: ['Parachichi Safi na Maharage ya Njombe', 'Ugali wa Dona na Samaki wa Ludewa', 'Supu ya Mboga'],
    dietaryAdviceSummary: 'Njombe ina parachichi zenye ubora wa kimataifa zilizo na mafuta mazuri ya kusaidia moyo na presha. Kula nusu ya parachichi kila siku pamoja na mboga za majani.',
  },
  {
    name: 'Rukwa',
    zone: 'Nyanda za Juu Kusini',
    districts: ['Sumbawanga Mjini', 'Sumbawanga Vijijini', 'Kalambo', 'Nkasi'],
    commonStaples: ['Ugali wa Dona ya Mahindi Safi', 'Uji wa Ulezi', 'Viazi Vitamu', 'Muhogo wa Kuchemsha'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Majani ya Kunde', 'Bamia'],
    commonProteins: ['Maharage ya Sumbawanga', 'Samaki wa Ziwa Rukwa/Tanganyika', 'Kuku wa Kienyeji'],
    localSpecialties: ['Dona na Maharage ya Sumbawanga', 'Samaki wa Ziwa Rukwa wa Kuchemsha', 'Kisamvu Safi'],
    dietaryAdviceSummary: 'Rukwa ni ghala la nafaka na maharage. Epuka mahindi yaliyokobolewa sana, pendelea dona na maharage ya Sumbawanga yaliyojaa nyuzi.',
  },
  {
    name: 'Songwe',
    zone: 'Nyanda za Juu Kusini',
    districts: ['Vwawa', 'Mbozi', 'Momba', 'Ileje', 'Songwe'],
    commonStaples: ['Ugali wa Dona', 'Ndizi za Kupika', 'Viazi Vitamu vya Mbozi', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Kabichi', 'Majani ya Maboga'],
    commonProteins: ['Maharage ya Mbozi', 'Kuku wa Kienyeji', 'Maziwa ya Asili', 'Dengu'],
    localSpecialties: ['Ndizi za Kuchemsha na Maharage', 'Kisamvu cha Karanga', 'Dona Safi'],
    dietaryAdviceSummary: 'Songwe ina maharage bora ya Mbozi na viazi vitamu. Kula viazi vitamu vya kuchemsha badala ya kukaanga, na usiongeze sukari kwenye uji wa ulezi.',
  },
  {
    name: 'Pwani',
    zone: 'Pwani',
    districts: ['Kibaha Mjini', 'Kibaha Vijijini', 'Bagamoyo', 'Kisarawe', 'Mkuranga', 'Rufiji', 'Mafia', 'Kibiti'],
    commonStaples: ['Ugali wa Dona Safi', 'Uji wa Ulezi', 'Viazi Vitamu', 'Muhogo Mbichi wa Kuchemsha'],
    commonVegetables: ['Mchicha', 'Kisamvu Safi', 'Matembele', 'Bamia', 'Majani ya Maboga'],
    commonProteins: ['Samaki Wabichi wa Baharini (Mafia/Bagamoyo)', 'Dagaa Safi', 'Maharage', 'Kuku wa Kienyeji'],
    localSpecialties: ['Mchuzi wa Samaki wa Kuchemsha na Ndimu', 'Kisamvu chepesi kisicho na nazi nyingi', 'Supu ya Pweza bila mafuta'],
    dietaryAdviceSummary: 'Mkoa wa Pwani una samaki wengi wa bahari na dagaa. Punguza matumizi ya tui zito la nazi kila siku; tumia nazi kidogo sana au upishi wa kuchemsha na viungo asilia.',
  },
  {
    name: 'Lindi',
    zone: 'Kusini',
    districts: ['Lindi Mjini', 'Kilwa', 'Ruangwa', 'Nachingwea', 'Liwale'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha', 'Uji wa Mtama', 'Viazi Vitamu'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Matembele', 'Bamia', 'Majani ya Kunde'],
    commonProteins: ['Samaki wa Baharini (Kilwa/Lindi)', 'Korosho Asilia (Kiasi Kidogo)', 'Dagaa', 'Kunde Kavu'],
    localSpecialties: ['Samaki wa Kuchemsha na Tangawizi', 'Kisamvu cha Korosho zilizosagwa kidogo', 'Dagaa Safi'],
    dietaryAdviceSummary: 'Lindi ina samaki bora wa baharini na korosho. Korosho zina mafuta mazuri lakini tumia kiasi kidogo (punje 10-15) kwa siku, na pendelea samaki wa kuchemsha.',
  },
  {
    name: 'Mtwara',
    zone: 'Kusini',
    districts: ['Mtwara Mjini', 'Mtwara Vijijini', 'Masasi', 'Nanyumbu', 'Newala', 'Tandahimba'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha wa Newala', 'Uji wa Ulezi', 'Viazi Vitamu'],
    commonVegetables: ['Kisamvu Safi cha Mtwara', 'Mchicha', 'Matembele', 'Majani ya Maboga'],
    commonProteins: ['Samaki wa Baharini', 'Dagaa Safi', 'Kunde Kavu', 'Korosho za Asili', 'Kuku wa Kienyeji'],
    localSpecialties: ['Kisamvu cha Kienyeji na Samaki', 'Mchuzi wa Dagaa na Mboga za Majani', 'Muhogo wa Kuchemsha na Samaki'],
    dietaryAdviceSummary: 'Mtwara inasifika kwa kisamvu na samaki wabichi. Usikaange samaki kwa mafuta mengi; mchuzi wa samaki wa kuchemsha na ndimu unafaa sana kwa afya ya moyo na sukari.',
  },
  {
    name: 'Geita',
    zone: 'Ziwa',
    districts: ['Geita Mjini', 'Chato', 'Bukombe', 'Mbogwe', 'Nyang\'hwale'],
    commonStaples: ['Ugali wa Dona Safi', 'Viazi Lishe vya Orange', 'Muhogo wa Kuchemsha', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Matembele', 'Mlenda'],
    commonProteins: ['Samaki Sato na Sangara wa Chato/Geita', 'Dagaa wa Ziwa Victoria', 'Maharage', 'Dengu'],
    localSpecialties: ['Samaki Sato wa Kuchemsha', 'Ugali wa Dona na Mboga za Majani', 'Dagaa wa Maji na Nyanya'],
    dietaryAdviceSummary: 'Geita ina samaki wa Ziwa Victoria na viazi lishe. Viazi lishe vina virutubisho vingi vya kuzuia maradhi na havisababishi sukari kupanda kwa kasi kama viazi vyeupe.',
  },
  {
    name: 'Simiyu',
    zone: 'Ziwa',
    districts: ['Bariadi Mjini', 'Bariadi Vijijini', 'Busega', 'Itilima', 'Maswa', 'Meatu'],
    commonStaples: ['Ugali wa Mtama Safi', 'Ugali wa Dona', 'Viazi Vitamu', 'Uji wa Ulezi'],
    commonVegetables: ['Mlenda wa Asili', 'Kunde za Majani', 'Mchicha', 'Majani ya Maboga'],
    commonProteins: ['Maziwa Mgando Konda', 'Kuku wa Kienyeji', 'Samaki wa Ziwa (Busega)', 'Dengu za Meatu'],
    localSpecialties: ['Ugali wa Mtama na Mlenda', 'Kuku wa Kienyeji wa Supu', 'Samaki wa Ziwa na Mboga'],
    dietaryAdviceSummary: 'Simiyu ina mtama mzuri na mboga za asili. Epuka sukari kwenye uji wa mtama, na tumia samaki na kuku wa kienyeji kwa protini safi.',
  },
  {
    name: 'Katavi',
    zone: 'Magharibi',
    districts: ['Mpanda Mjini', 'Mpanda Vijijini', 'Mlele', 'Tanganyika'],
    commonStaples: ['Ugali wa Dona Safi', 'Mchele wa Nusu-Kobole', 'Viazi Vitamu', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Matembele', 'Majani ya Maboga'],
    commonProteins: ['Samaki wa Ziwa Tanganyika (Karema/Tanganyika)', 'Maharage ya Mpanda', 'Kuku wa Kienyeji'],
    localSpecialties: ['Samaki Fresh wa Kuchemsha', 'Ugali wa Dona na Maharage', 'Kisamvu Safi'],
    dietaryAdviceSummary: 'Katavi ina nafaka safi na samaki wa Ziwa Tanganyika. Pendelea ugali wa dona ya kusaga na nafaka nzima kuliko unga mweupe wa sembe.',
  },
  {
    name: 'Mjini Magharibi (Zanzibar)',
    zone: 'Zanzibar',
    districts: ['Mjini', 'Magharibi A', 'Magharibi B'],
    commonStaples: ['Uji wa Ulezi na Viungo vya Asili (Tangawizi, Mdalasini)', 'Ugali wa Dona', 'Ndizi za Kupika', 'Muhogo Mbichi wa Kuchemsha'],
    commonVegetables: ['Mchicha', 'Kisamvu chepesi', 'Matembele', 'Bamia za Zanzibar', 'Mchunga'],
    commonProteins: ['Pweza wa Kuchemsha (Bila kukaanga)', 'Samaki Wabichi (Kolekole, Changu, Tasi)', 'Dagaa Safi', 'Maharage ya Nazi Chache'],
    localSpecialties: ['Supu ya Pweza na Viungo Asilia', 'Samaki wa Kuchemsha na Limao/Tangawizi', 'Kisamvu cha Tangawizi na Kitunguu Swamu'],
    dietaryAdviceSummary: 'Zanzibar ina viungo asilia vyenye nguvu kubwa ya kupunguza sukari kama tangawizi na mdalasini, na samaki wengi wa bahari. Epuka vyakula vyenye sukari ya ziada au nazi nzito ya kila siku.',
  },
  {
    name: 'Kaskazini Unguja',
    zone: 'Zanzibar',
    districts: ['Kaskazini A', 'Kaskazini B'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha', 'Ndizi za Kupika', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu cha Asili', 'Mchicha', 'Matembele', 'Bamia'],
    commonProteins: ['Samaki Wabichi wa Baharini', 'Pweza wa Kuchemsha', 'Maharage', 'Kuku wa Kienyeji'],
    localSpecialties: ['Samaki wa Kuchemsha na Viungo', 'Mchuzi Mwepesi wa Pweza', 'Mboga za Majani na Tangawizi'],
    dietaryAdviceSummary: 'Zingatia samaki wa baharini na viungo vya asili. Tumia tangawizi na kitunguu swaumu badala ya chumvi nyingi ili kulinda shinikizo la damu.',
  },
  {
    name: 'Kusini Unguja',
    zone: 'Zanzibar',
    districts: ['Kusini', 'Kati'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha', 'Viazi Vitamu', 'Uji wa Ulezi'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Bamia', 'Matembele'],
    commonProteins: ['Samaki Wabichi wa Baharini', 'Dagaa', 'Maharage', 'Kunde'],
    localSpecialties: ['Supu ya Samaki wa Asili', 'Kisamvu Chepesi', 'Dagaa wa Kuchemsha'],
    dietaryAdviceSummary: 'Pika samaki kwa mvuke au mchuzi mwepesi wa limao na tangawizi, na punguza matumizi ya mafuta mengi ya kukaanga.',
  },
  {
    name: 'Kaskazini Pemba',
    zone: 'Zanzibar',
    districts: ['Wete', 'Micheweni'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha', 'Ndizi za Kupika', 'Uji wa Ulezi na Mdalasini'],
    commonVegetables: ['Kisamvu cha Pemba', 'Mchicha', 'Matembele', 'Bamia'],
    commonProteins: ['Samaki Wabichi wa Bahari Kuu', 'Dagaa', 'Maharage', 'Dengu'],
    localSpecialties: ['Samaki wa Kuchemsha na Karafuu/Tangawizi', 'Kisamvu Safi', 'Supu ya Pweza'],
    dietaryAdviceSummary: 'Pemba inasifika kwa karafuu na viungo vya asili vinavyosaidia mzunguko wa damu. Changanya viungo hivi na samaki safi wa baharini kwa lishe bora.',
  },
  {
    name: 'Kusini Pemba',
    zone: 'Zanzibar',
    districts: ['Chake Chake', 'Mkoani'],
    commonStaples: ['Ugali wa Dona', 'Muhogo wa Kuchemsha', 'Uji wa Ulezi', 'Viazi Vitamu'],
    commonVegetables: ['Kisamvu', 'Mchicha', 'Matembele', 'Bamia'],
    commonProteins: ['Samaki Wabichi wa Mkoani/Chake Chake', 'Pweza', 'Dagaa', 'Maharage'],
    localSpecialties: ['Samaki wa Kuchemsha na Viungo', 'Kisamvu cha Pemba', 'Supu ya Dagaa'],
    dietaryAdviceSummary: 'Chagua samaki wa maji ya chumvi na ulezi, epuka vyakula vyenye sukari na pika kwa mvuke au kuchemsha.',
  },
];

export function getDistrictsForRegion(regionName?: string): string[] {
  if (!regionName) return [];
  const found = TANZANIA_REGIONS.find(
    (r) => r.name.toLowerCase() === regionName.trim().toLowerCase()
  );
  return found ? found.districts : [];
}

export function getRegionInfo(regionName?: string): TanzaniaRegionData | undefined {
  if (!regionName) return undefined;
  return TANZANIA_REGIONS.find(
    (r) => r.name.toLowerCase() === regionName.trim().toLowerCase()
  );
}

export function getAvailableFoodsForRegion(regionName?: string, districtName?: string): {
  staples: string[];
  vegetables: string[];
  proteins: string[];
  specialties: string[];
  advice: string;
} {
  const reg = getRegionInfo(regionName) || TANZANIA_REGIONS[0]; // Default to Dar es Salaam if unknown
  return {
    staples: reg.commonStaples,
    vegetables: reg.commonVegetables,
    proteins: reg.commonProteins,
    specialties: reg.localSpecialties,
    advice: reg.dietaryAdviceSummary,
  };
}
