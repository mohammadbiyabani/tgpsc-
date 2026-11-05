import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Bookmark,
  Share2,
  Send,
  HelpCircle,
  BarChart3,
  ListOrdered,
  FileText,
  AlertCircle,
  Volume2,
  RefreshCw,
  Sun,
  Moon,
  Layers,
  GraduationCap,
  Calendar,
  X,
  ExternalLink,
  Zap,
  ShieldCheck,
  Compass,
  ArrowRight,
  ArrowLeft,
  Eye,
  Info
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type ExamTarget = 'group1' | 'group2' | 'group3' | 'group4';
type Language = 'en' | 'te';
type NavTab = 'dashboard' | 'syllabus' | 'videos' | 'practice' | 'flashcards' | 'ai';
type TopicStatus = 'not-started' | 'in-progress' | 'mastered';

interface Question {
  id: string;
  pillarId: string;
  topicTag: string;
  textEn: string;
  textTe: string;
  optionsEn: string[];
  optionsTe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationTe: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examReference?: string;
}

interface SyllabusTopic {
  id: string;
  pillarId: string;
  titleEn: string;
  titleTe: string;
  weightage: string;
  examTargetAvailability: ExamTarget[];
  summaryEn: string;
  summaryTe: string;
  keyPointsEn: string[];
  keyPointsTe: string[];
  mnemonicEn?: string;
  mnemonicTe?: string;
  committeesOrDates: { name: string; yearOrFact: string }[];
}

interface VideoLecture {
  id: string;
  titleEn: string;
  titleTe: string;
  faculty: string;
  channel: string;
  duration: string;
  pillarId: string;
  topicTag: string;
  youtubeId: string;
  summary: string;
  quizQuestionIds: string[];
}

interface Flashcard {
  id: string;
  category: 'committees' | 'dates' | 'articles' | 'dynasties' | 'schemes';
  frontEn: string;
  frontTe: string;
  backEn: string;
  backTe: string;
  tags: string[];
  yearOrKey?: string;
}

interface TestAttempt {
  id: string;
  date: string;
  examTarget: ExamTarget;
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  answers: Record<string, number>;
}

// --- EXAM SCHEMES DATA ---
const EXAM_DETAILS: Record<ExamTarget, { nameEn: string; nameTe: string; marks: number; papers: string; descEn: string; descTe: string }> = {
  group1: {
    nameEn: 'Group-I Services',
    nameTe: 'గ్రూప్-I సర్వీసెస్',
    marks: 900,
    papers: 'Prelims (150M) + Mains 6 Papers (900M)',
    descEn: 'Administrative posts (Deputy Collector, DSP, CTO) testing analytical depth & descriptive mastery.',
    descTe: 'డిప్యూటీ కలెక్టర్, డిఎస్పీ, సిటిఓ వంటి ఉన్నత పాలనా విభాగాల ఉద్యోగాలు.'
  },
  group2: {
    nameEn: 'Group-II Services',
    nameTe: 'గ్రూప్-II సర్వీసెస్',
    marks: 600,
    papers: '4 Papers × 150 Marks = 600M (CBRT/OMR)',
    descEn: 'Paper I (GS), Paper II (History/Polity/Society), Paper III (Economy/Dev), Paper IV (Telangana Movement).',
    descTe: 'పేపర్ 1 (జనరల్ స్టడీస్), పేపర్ 2 (చరిత్ర/పాలిటీ), పేపర్ 3 (ఆర్థికం), పేపర్ 4 (తెలంగాణ ఉద్యమం).'
  },
  group3: {
    nameEn: 'Group-III Services',
    nameTe: 'గ్రూప్-III సర్వీసెస్',
    marks: 450,
    papers: '3 Papers × 150 Marks = 450M (CBRT/OMR)',
    descEn: 'Paper I (GS), Paper II (History/Polity/Society), Paper III (Economy & Development).',
    descTe: 'పేపర్ 1 (జనరల్ స్టడీస్), పేపర్ 2 (చరిత్ర, పాలిటీ), పేపర్ 3 (భారత, తెలంగాణ ఆర్థిక వ్యవస్థ).'
  },
  group4: {
    nameEn: 'Group-IV Services',
    nameTe: 'గ్రూప్-IV సర్వీసెస్',
    marks: 300,
    papers: '2 Papers × 150 Marks = 300M (CBRT/OMR)',
    descEn: 'Paper I: General Studies (150M) + Paper II: Secretarial & Mental Abilities (150M).',
    descTe: 'పేపర్ 1: జనరల్ స్టడీస్ (150 మార్కులు) + పేపర్ 2: సెక్రటేరియల్ ఎబిలిటీస్ (150 మార్కులు).'
  }
};

const PILLARS = [
  { id: 'movement', nameEn: 'Telangana Movement & State Formation', nameTe: 'తెలంగాణ ఉద్యమం & రాష్ట్ర ఆవిర్భావం', icon: 'Flame', color: 'from-orange-500 to-amber-600', badge: 'High Yield' },
  { id: 'history', nameEn: 'History & Culture of Telangana & India', nameTe: 'తెలంగాణ & భారత చరిత్ర, సంస్కృతి', icon: 'BookOpen', color: 'from-blue-600 to-indigo-700', badge: 'Core Paper' },
  { id: 'polity', nameEn: 'Indian Constitution, Polity & Governance', nameTe: 'భారత రాజ్యాంగం, పాలన & చట్టాలు', icon: 'ShieldCheck', color: 'from-emerald-600 to-teal-700', badge: 'Essential' },
  { id: 'economy', nameEn: 'Economy & Telangana Development Schemes', nameTe: 'ఆర్థిక వ్యవస్థ & రాష్ట్ర అభివృద్ధి పథకాలు', icon: 'BarChart3', color: 'from-purple-600 to-pink-600', badge: 'Data Heavy' },
  { id: 'aptitude', nameEn: 'Secretarial & Mental Abilities', nameTe: 'సెక్రటేరియల్ & మెంటల్ ఎబిలిటీస్ (రీజనింగ్)', icon: 'Zap', color: 'from-cyan-600 to-blue-600', badge: 'Group-IV Special' }
];

// --- SAMPLE HIGH YIELD SYLLABUS DATA ---
const SYLLABUS_DATA: SyllabusTopic[] = [
  {
    id: 'tg-phase-1',
    pillarId: 'movement',
    titleEn: 'Phase 1: Idea of Telangana & 1952 Mulki Agitation (1948–1970)',
    titleTe: 'తొలిదశ: తెలంగాణ భావన & 1952 ముల్కీ ఉద్యమం (1948–1970)',
    weightage: '15-20 Questions in Paper IV',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Operation Polo (Sept 1948), Military Rule under J.N. Chaudhuri, Civil Administration under M.K. Vellodi, 1952 City College Mulki Agitation, Justice Pingali Jaganmohan Reddy Commission.',
    summaryTe: 'ఆపరేషన్ పోలో (సెప్టెంబర్ 1948), జె.ఎన్. చౌధురి సైనిక పాలన, ఎం.కె. వెల్లోడి పౌర ప్రభుత్వం, 1952 సిటీ కాలేజ్ ముల్కీ పోరాటం, జస్టిస్ పింగళి జగన్మోహన్ రెడ్డి విచారణ కమిషన్.',
    keyPointsEn: [
      '1919 Farman by Mir Osman Ali Khan: Defined "Mulki" as minimum 15 years continuous residence.',
      'September 3-4, 1952: Police firing on student protesters at City College & Afzalganj, Hyderabad.',
      'Justice Pingali Jaganmohan Reddy Committee was appointed to probe the 1952 police firings.',
      'Fazal Ali Commission (SRC 1953): Recommended keeping Telangana as a separate state initially for 5 years.'
    ],
    keyPointsTe: [
      '1919 నిజాం ఫర్మానా: ముల్కీగా గుర్తింపు పొందడానికి 15 సంవత్సరాల నిరంతర నివాసం నిబంధన విధించారు.',
      'సెప్టెంబర్ 3-4, 1952: సిటీ కాలేజీ మరియు అఫ్జల్‌గంజ్ వద్ద విద్యార్థులపై పోలీసు కాల్పులు.',
      'సిటీ కాలేజీ ఘటనపై విచారణకు జస్టిస్ పింగళి జగన్మోహన్ రెడ్డి ఏకసభ్య కమిషన్ ఏర్పాటు.',
      'ఫజల్ అలీ కమిషన్ (SRC 1953): తెలంగాణను స్వతంత్ర రాష్ట్రంగా కొనసాగించి 5 సంవత్సరాల తర్వాత పరిశీలించాలని సిఫార్సు.'
    ],
    mnemonicEn: 'M-U-L-K-I (Mir Osman 1919 Farman -> Unrest in City College 1952 -> Lalit Kumar & Jaganmohan Reddy Probe -> Kaloji Poetry -> Integration Resistance).',
    mnemonicTe: 'గుర్తుంచుకోండి: 1919 ఫర్మానా (15 ఏళ్లు) -> 1952 సిటీ కాలేజ్ ఘటన (పింగళి కమిషన్) -> 1956 పెద్దమనుషుల ఒప్పందం.',
    committeesOrDates: [
      { name: '1919 Farman', yearOrFact: '15 years domicile requirement' },
      { name: 'Pingali Jaganmohan Reddy Commission', yearOrFact: '1952 City College firing inquiry' },
      { name: 'Fazal Ali Commission (SRC)', yearOrFact: '1953 - Separate state recommendation' }
    ]
  },
  {
    id: 'tg-gentlemen',
    pillarId: 'movement',
    titleEn: "1956 Gentlemen's Agreement & Regional Committees",
    titleTe: '1956 పెద్దమనుషుల ఒప్పందం & ప్రాంతీయ సంఘం',
    weightage: '10-12 Questions in Group-II',
    examTargetAvailability: ['group1', 'group2', 'group3'],
    summaryEn: 'Signed on 20 February 1956 at Hyderabad House, New Delhi by 4 Andhra leaders and 4 Telangana leaders to protect Telangana interests in unified Andhra Pradesh.',
    summaryTe: '20 ఫిబ్రవరి 1956న న్యూఢిల్లీలోని హైదరాబాద్ హౌస్‌లో ఆంధ్ర నుండి నలుగురు, తెలంగాణ నుండి నలుగురు నాయకులు సంతకాలు చేసిన చారిత్రక ఒప్పందం.',
    keyPointsEn: [
      'Andhra Signatories: B. Gopala Reddy, Neelam Sanjeeva Reddy, G. Latchanna, Alluri Satyanarayana Raju.',
      'Telangana Signatories: Burgula Ramakrishna Rao, K.V. Ranga Reddy, Dr. M. Chenna Reddy, J.V. Narsing Rao.',
      '14 Safeguard Clauses: 40:60 ministerial ratio, Telangana Regional Committee, retaining Mulki residency rule.',
      'Breach occurred immediately when Deputy CM post was denied to Telangana by Sanjeeva Reddy calling it a "Sixth finger".'
    ],
    keyPointsTe: [
      'ఆంధ్ర ప్రతినిధులు: బెజవాడ గోపాలరెడ్డి, నీలం సంజీవరెడ్డి, గౌతు లచ్చన్న, అల్లూరి సత్యనారాయణ రాజు.',
      'తెలంగాణ ప్రతినిధులు: బూర్గుల రామకృష్ణారావు, కొండా వెంకట రంగారెడ్డి, డా. మర్రి చెన్నారెడ్డి, జె.వి. నర్సింగరావు.',
      'ముఖ్య అంశాలు: మంత్రివర్గంలో 60:40 నిష్పత్తి, తెలంగాణ ప్రాంతీయ కమిటీ ఏర్పాటు, స్థానిక నియామకాల్లో రక్షణలు.',
      'ఉల్లంఘన: నీలం సంజీవరెడ్డి ఉపముఖ్యమంత్రి పదవిని "ఆరో వేలు" అని ఎగతాళి చేస్తూ తెలంగాణకు నిరాకరించారు.'
    ],
    mnemonicEn: 'Telangana Signatories: "B-K-M-J" (Burgula, K.V. Ranga, Marri Chenna, J.V. Narsing). Andhra Signatories: "B-N-G-A" (Bezawada, Neelam, Gouthu, Alluri).',
    mnemonicTe: 'తెలంగాణ నాయకులు: బూర్గుల, రంగారెడ్డి, చెన్నారెడ్డి, నర్సింగరావు (బృ-రం-చె-న).',
    committeesOrDates: [
      { name: 'Hyderabad House Agreement Date', yearOrFact: '20 February 1956' },
      { name: 'Telangana Regional Committee (TRC)', yearOrFact: 'Article 371(1) established in 1958' }
    ]
  },
  {
    id: 'tg-1969-agitation',
    pillarId: 'movement',
    titleEn: '1969 Telangana Agitation, 8-Point Formula & Committees',
    titleTe: '1969 ప్రత్యేక తెలంగాణ ఉద్యమం, ఎనిమిది సూత్రాల పథకం',
    weightage: 'High-Yield Paper IV',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Triggered by student Ravindranath hunger strike in Palvancha (Khammam) on 8 Jan 1969. Formation of Telangana Praja Samithi (TPS) by Marri Chenna Reddy. 369 martyrs killed in police firings.',
    summaryTe: '1969 జనవరి 8న ఖమ్మం జిల్లా పాల్వంచలో విద్యార్థి రవీంద్రనాథ్ ఆమరణ నిరాహార దీక్షతో ఉద్యమం ప్రారంభమైంది. తెలంగాణ ప్రజా సమితి (TPS) ఆవిర్భావం, 369 మంది విద్యార్థి అమరవీరులు.',
    keyPointsEn: [
      'Ravindranath hunger strike demanded implementation of 1956 Safeguards and sending back non-mulkis.',
      'Justice Vasishta Bhargava Committee: Calculated Telangana surplus revenue was diverted to Andhra.',
      'Justice K.N. Wanchoo Committee: Examined constitutional validity of Mulki rules and public employment.',
      'Prime Minister Indira Gandhi announced the 8-Point Formula on 11 April 1969 to placate the agitation.'
    ],
    keyPointsTe: [
      'రవీంద్రనాథ్ దీక్ష: తెలంగాణ రక్షణల అమలు మరియు అక్రమ ఉద్యోగుల తొలగింపు కోసం పాల్వంచలో ఆరంభం.',
      'జస్టిస్ వశిష్ట భార్గవ కమిటీ: తెలంగాణ మిగులు నిధులను లెక్కించి ఆంధ్ర ప్రాంతానికి తరలించినట్లు నిర్ధారించింది.',
      'జస్టిస్ వాంచూ కమిటీ: ముల్కీ నిబంధనల రాజ్యాంగ బద్ధతపై పరిశీలన జరిపింది.',
      'ఇందిరా గాంధీ 8 సూత్రాల పథకం: 11 ఏప్రిల్ 1969న పార్లమెంట్‌లో ప్రకటించారు.'
    ],
    mnemonicEn: 'V-B-W (Vasishta Bhargava = Budget/Revenue surplus; Wanchoo = Work/Employment legalities).',
    mnemonicTe: 'గుర్తుంచుకోండి: భార్గవ కమిటీ = మిగులు నిధులు; వాంచూ కమిటీ = ఉద్యోగాల చట్టబద్ధత.',
    committeesOrDates: [
      { name: 'Kumar Lalit Committee', yearOrFact: 'Jan 1969 - Surplus calculation (Rs 34.10 Crore)' },
      { name: 'Vasishta Bhargava Committee', yearOrFact: 'April 1969 - Surplus calculation (Rs 28.34 Crore)' },
      { name: '8-Point Formula', yearOrFact: '11 April 1969' }
    ]
  },
  {
    id: 'tg-six-point-610',
    pillarId: 'movement',
    titleEn: 'Six-Point Formula (1973), Article 371D & G.O. Ms. No. 610 (1985)',
    titleTe: 'ఆరు సూత్రాల పథకం (1973), ఆర్టికల్ 371D & జి.ఓ. 610 (1985)',
    weightage: 'Guaranteed 8-10 Questions',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Six-Point Formula announced in Sept 1973 enacted via 32nd Constitutional Amendment adding Article 371D. Presidential Order 1975 created 6 zones. G.O. Ms 610 issued on 30 Dec 1985 to repatriate non-locals.',
    summaryTe: '1973 సెప్టెంబర్‌లో ప్రకటించిన ఆరు సూత్రాల పథకం 32వ రాజ్యాంగ సవరణ ద్వారా ఆర్టికల్ 371Dలో చేర్చబడింది. 1975 రాష్ట్రపతి ఉత్తర్వు 6 జోన్లను సృష్టించింది. జి.ఓ. 610 (1985) నాన్-లోకల్స్ బదిలీకి జారీ అయింది.',
    keyPointsEn: [
      '32nd Constitutional Amendment Act, 1973 inserted Articles 371D and 371E for equitable employment.',
      'Presidential Order 1975 divided AP into 6 zones (Zones V & VI in Telangana).',
      'Jayabharath Reddy Committee report revealed thousands of non-local appointments in Zones V & VI.',
      'G.O. Ms. 610 issued on 30 Dec 1985 by N.T. Rama Rao Government with March 31, 1986 deadline.',
      'J.M. Girglani One-Man Commission (2001-2004) proved massive non-compliance and violations of G.O. 610.'
    ],
    keyPointsTe: [
      '32వ రాజ్యాంగ సవరణ చట్టం (1973): ఆర్టికల్ 371D మరియు 371E ద్వారా స్థానికత రక్షణలు.',
      '1975 రాష్ట్రపతి ఉత్తర్వు: ఉమ్మడి రాష్ట్రాన్ని 6 జోన్లుగా విభజించారు (జోన్ 5 & 6 తెలంగాణ).',
      'జయభారత్ రెడ్డి కమిటీ: జోన్ 5 & 6లలో వేల సంఖ్యలో నిబంధనలకు విరుద్ధంగా జరిగిన నియామకాలను తేల్చింది.',
      'జి.ఓ. 610: ఎన్టీఆర్ ప్రభుత్వం 1985 డిసెంబర్ 30న జారీ చేసింది; మార్చి 31, 1986 నాటికి అమలు చేయాలని ఆదేశం.',
      'జె.ఎం. గిర్గలానీ కమిషన్ (2001-2004): జి.ఓ. 610 ఉల్లంఘనలను సమగ్రంగా పరిశీలించి 35 విభాగాలుగా నివేదిక సమర్పించింది.'
    ],
    mnemonicEn: '610 rule: Issued 1985 -> Probed by Girglani 2001 -> Zone V & VI protection.',
    mnemonicTe: 'ఆరు సూత్రాలు (1973, 32వ సవరణ) -> ప్రెసిడెన్షియల్ ఆర్డర్ (1975) -> జి.ఓ. 610 (1985) -> గిర్గలానీ (2001).',
    committeesOrDates: [
      { name: '32nd Amendment & Art 371D', yearOrFact: '1973' },
      { name: 'G.O. Ms. 610', yearOrFact: '30 December 1985' },
      { name: 'Girglani Commission', yearOrFact: '2001 - 2004' }
    ]
  },
  {
    id: 'tg-kakatiyas',
    pillarId: 'history',
    titleEn: 'Kakatiya Dynasty: Administration, Nayankara System & Architecture',
    titleTe: 'కాకతీయ రాజవంశం: పరిపాలన, నాయంకర విధానం & శిల్పకళ',
    weightage: 'Core History Pillar',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Golden era of Telangana history ruled from Orugallu (Warangal). Ganapatideva, Rani Rudrama Devi, Prataparudra II. Famous for tank irrigation network, Motupalli Abhaya Sasanam, Ramappa Temple.',
    summaryTe: 'ఓరుగల్లు రాజధానిగా పాలించిన కాకతీయుల స్వర్ణయుగం. గణపతిదేవుడు, రాణి రుద్రమదేవి, ప్రతాపరుద్రుడు. గొలుసుకట్టు చెరువులు, మోటుపల్లి అభయ శాసనం, రామప్ప దేవాలయం ప్రసిద్ధి.',
    keyPointsEn: [
      'Capital: shifted from Anumakonda (Hanamkonda) to Orugallu (Warangal) by Rudradeva / Ganapatideva.',
      'Nayankara System: Military feudal administrative structure; 77 Nayakas guarded the 77 bastions of Warangal fort.',
      'Motupalli Inscription (Abhaya Sasanam) issued by Ganapatideva in 1244 AD promoted maritime trade.',
      'Ramappa Temple (Palampet, Mulugu district) built by general Recharla Rudra in 1213 AD, UNESCO World Heritage site (floating bricks & sandbox technology).',
      'Italian traveler Marco Polo visited Motupalli during Rani Rudrama Devi reign and praised the kingdom.'
    ],
    keyPointsTe: [
      'రాజధాని మార్పు: అనుమకొండ నుండి ఓరుగల్లు కోటకు రాజధానిని మార్చారు.',
      'నాయంకర విధానం: సైనిక పాలనా వ్యవస్థ; ఓరుగల్లు కోట 77 బురుజులను 77 మంది నాయంకరులు రక్షించారు.',
      'మోటుపల్లి అభయ శాసనం: క్రీ.శ. 1244లో గణపతిదేవుడు విదేశీ వర్తకులకు రక్షణ కల్పిస్తూ వేయించిన శాసనం.',
      'రామప్ప దేవాలయం (పాలంపేట): క్రీ.శ. 1213లో సేనాని రేచర్ల రుద్రుడు నిర్మించాడు. యునెస్కో ప్రపంచ వారసత్వ సంపద.',
      'మార్కో పోలో: వెనిస్ యాత్రికుడు రుద్రమదేవి కాలంలో మోటుపల్లి రేవును సందర్శించి అద్భుత పాలనను ప్రశంసించాడు.'
    ],
    mnemonicEn: 'G-R-P (Ganapatideva -> Rudrama Devi -> Prataparudra II). Tank marvel: Ramappa, Pakhal, Laknavaram.',
    mnemonicTe: 'కాకతీయ త్రయం: గణపతిదేవుడు (మోటుపల్లి శాసనం) -> రుద్రమదేవి (మార్కో పోలో) -> ప్రతాపరుద్రుడు (లక్ష్మణ శాస్త్రం).',
    committeesOrDates: [
      { name: 'Motupalli Abhaya Sasanam', yearOrFact: '1244 AD (Maritime Charter)' },
      { name: 'Ramappa Temple Inscription', yearOrFact: '1213 AD (Recharla Rudra)' },
      { name: 'Fall of Warangal', yearOrFact: '1323 AD (Ulugh Khan / Muhammad bin Tughlaq)' }
    ]
  },
  {
    id: 'tg-satavahanas',
    pillarId: 'history',
    titleEn: 'Satavahana Dynasty: Origins, Coins & Literary Heritage',
    titleTe: 'శాతవాహన వంశం: ఆవిర్భావం, నాణేలు & సాహిత్య వైభవం',
    weightage: '6-8 Questions',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'First major imperial power of Deccan. Capital at Kotilingala (Jagtial/Karimnagar district) and later Dharanikota/Paithan. Simuka, Satakarni I, Hala, Gautamiputra Satakarni.',
    summaryTe: 'దక్షిణాపథాన్ని ఏలిన తొలి సామ్రాజ్యం. మొదటి రాజధాని కోటిలింగాల (జగిత్యాల జిల్లా), తర్వాత ప్రతిష్ఠానపురం/ధరణికోట. సిముఖుడు, శాతకర్ణి I, హాలుడు, గౌతమీపుత్ర శాతకర్ణి.',
    keyPointsEn: [
      'Kotilingala excavations unearthed coins with the legend "Rano Siri Chimuka Satavahana".',
      'King Hala composed "Gatha Saptashati" (700 Prakrit poems about rural Telangana life).',
      'Gunadhya composed "Brihatkatha" in Paisachi Prakrit at Kondapur.',
      'Gautamiputra Satakarni: Nasik Prasasti by mother Gautami Balasri refers to him as "Trisamudra Toya Pitavahana".'
    ],
    keyPointsTe: [
      'కోటిలింగాల తవ్వకాలు: "రణో సిరి చిముక శాతవాహన" పేరుతో ముద్రించిన నాణేలు లభించాయి.',
      'హాల చక్రవర్తి: ప్రాకృత భాషలో "గాథా సప్తశతి" (700 శృంగార, గ్రామీణ పద్యాలు) సంకలనం చేశాడు.',
      'గుణాఢ్యుడు: పైశాచీ ప్రాకృతంలో "బృహత్కథ"ను కొండాపూర్ వద్ద రచించాడు.',
      'గౌతమీపుత్ర శాతకర్ణి: నాసిక్ ప్రశస్తిలో తల్లి గౌతమీ బాలశ్రీ అతడిని "త్రిసముద్ర తోయ పీతవాహన"గా వర్ణించింది.'
    ],
    mnemonicEn: 'K-P-D capitals: Kotilingala -> Pratishthanapura -> Dhanyakataka.',
    mnemonicTe: 'గ్రంథాలు: హాలుడు = గాథా సప్తశతి; గుణాఢ్యుడు = బృహత్కథ; శర్వవర్మ = కాతంత్ర వ్యాకరణం.',
    committeesOrDates: [
      { name: 'Kotilingala Excavation', yearOrFact: 'Karimnagar - Simuka punch-marked coins' },
      { name: 'Nasik Prasasti', yearOrFact: 'Queen Balasri eulogy for Gautamiputra' }
    ]
  },
  {
    id: 'polity-preamble-art3',
    pillarId: 'polity',
    titleEn: 'Article 3, Preamble & Constitutional Evolution of New States',
    titleTe: 'ఆర్టికల్ 3, ప్రవేశిక & నూతన రాష్ట్రాల పునర్వ్యవస్థీకరణ',
    weightage: 'Direct TGPSC Polity Question',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Article 3 empowers Parliament to form new states, alter areas, boundaries, or names. Crucial role in AP Reorganisation Act 2014. Simple majority in Parliament without state veto power.',
    summaryTe: 'ఆర్టికల్ 3 పార్లమెంటుకు సరిహద్దులు మార్చే, కొత్త రాష్ట్రాన్ని ఏర్పాటు చేసే అధికారాన్ని ఇస్తుంది. 2014 ఏపీ పునర్వ్యవస్థీకరణ చట్టానికి ఆధారం. అసెంబ్లీ అభిప్రాయం కేవలం సలహా మాత్రమే.',
    keyPointsEn: [
      'Presidential Recommendation is required before introducing a bill altering state boundaries under Art 3.',
      'Reference to State Legislature has a time limit, but its opinion is NOT binding on Parliament.',
      'Passed by Simple Majority in both Houses of Parliament (not Art 368 special majority).',
      'AP Reorganisation Act 2014: 108 Sections, 12 Schedules; Hyderabad joint capital for max 10 years.'
    ],
    keyPointsTe: [
      'ఆర్టికల్ 3 బిల్లును రాష్ట్రపతి ముందస్తు సిఫార్సుతో మాత్రమే పార్లమెంటులో ప్రవేశపెట్టాలి.',
      'రాష్ట్ర అసెంబ్లీ అభిప్రాయం కోసం పంపినా, అసెంబ్లీ తిరస్కరించినా పార్లమెంటుకు ఎలాంటి అడ్డంకి ఉండదు.',
      'ఆర్టికల్ 3 బిల్లులకు సాధారణ మెజారిటీ సరిపోతుంది (ఆర్టికల్ 368 కింద రాజ్యాంగ సవరణగా పరిగణించరు).',
      '2014 ఆంధ్రప్రదేశ్ పునర్వ్యవస్థీకరణ చట్టం: 108 సెక్షన్లు, 12 షెడ్యూళ్ళు; హైదరాబాద్ 10 ఏళ్లు ఉమ్మడి రాజధాని.'
    ],
    mnemonicEn: 'F-A-B-N: Form new state, Alter Area, Alter Boundary, Alter Name (All under Article 3).',
    mnemonicTe: 'ఆర్టికల్ 3 కింద: కొత్త రాష్ట్రం, సరిహద్దు మార్పు, పేరు మార్పు. సాధారణ మెజారిటీ చాలు.',
    committeesOrDates: [
      { name: 'Lok Sabha Passed AP Reorganisation Act', yearOrFact: '18 February 2014' },
      { name: 'Rajya Sabha Passed', yearOrFact: '20 February 2014' },
      { name: 'Appointed Day (Telangana Formation)', yearOrFact: '2 June 2014' }
    ]
  },
  {
    id: 'economy-schemes',
    pillarId: 'economy',
    titleEn: 'Telangana Socio-Economic Outlook & Flagship Welfare Schemes',
    titleTe: 'తెలంగాణ సామాజిక-ఆర్థిక సర్వే & ప్రధాన సంక్షేమ పథకాలు',
    weightage: '12-15 Questions in GS & Paper III',
    examTargetAvailability: ['group1', 'group2', 'group3', 'group4'],
    summaryEn: 'Analysis of GSDP growth, Per Capita Income (PCI) comparison with National Average, Mission Bhagiratha, Kaleshwaram Project, Rythu Bharosa, Mahalakshmi, Gruha Jyothi & 6 Guarantees.',
    summaryTe: 'తెలంగాణ జీఎస్‌డీపీ వృద్ధి, జాతీయ సగటు కంటే అధిక తలసరి ఆదాయం, మిషన్ భగీరథ, కాళేశ్వరం ప్రాజెక్ట్, రైతు భరోసా, మహాలక్ష్మి, గృహజ్యోతి మరియు ఆరు గ్యారెంటీలు.',
    keyPointsEn: [
      'Per Capita Income of Telangana consistently ranks among top major states in India (~Rs 3.1+ Lakhs).',
      'Mahalakshmi Scheme: Free RTC bus travel for women, girls, and transgender persons across Telangana.',
      'Gruha Jyothi Scheme: 200 units of free domestic electricity for eligible white ration card households.',
      'Mission Bhagiratha: Piped drinking water supply to 100% rural households through Krishna and Godavari grid.',
      'Kaleshwaram Lift Irrigation: World\'s largest multi-stage lift irrigation system at Medigadda, Annaram, Sundilla.'
    ],
    keyPointsTe: [
      'తెలంగాణ తలసరి ఆదాయం జాతీయ సగటు కంటే దాదాపు 1.8 రెట్లు అధికంగా నమోదవుతోంది.',
      'మహాలక్ష్మి పథకం: మహిళలు, బాలికలు మరియు ట్రాన్స్‌జెండర్లకు ఆర్టీసీ పల్లెవెలుగు, ఎక్స్‌ప్రెస్ బస్సులలో ఉచిత ప్రయాణం.',
      'గృహజ్యోతి పథకం: అర్హులైన తెల్ల రేషన్ కార్డుదారులకు నెలకు 200 యూనిట్ల వరకు ఉచిత గృహ విద్యుత్ సరఫరా.',
      'మిషన్ భగీరథ: కృష్ణా, గోదావరి నదుల ఆధారంగా తెలంగాణలోని ప్రతి పల్లెకు సురక్షిత నల్లా తాగునీరు అందించే గ్రిడ్.',
      'కాళేశ్వరం ప్రాజెక్టు: మేడిగడ్డ, అన్నారం, సుందిళ్ల బ్యారేజీలతో నిర్మించిన భారీ ఎత్తిపోతల ప్రాజెక్టు.'
    ],
    mnemonicEn: '6 Guarantees: Mahalakshmi (Bus & Gas) + Rythu Bharosa + Gruha Jyothi + Indiramma Indlu + Yuva Vikasam + Cheyutha.',
    mnemonicTe: 'ఆరు గ్యారంటీలు: మహాలక్ష్మి, రైతు భరోసా, గృహజ్యోతి, ఇందిరమ్మ ఇండ్లు, యువ వికాసం, చేయూత.',
    committeesOrDates: [
      { name: 'Mahalakshmi Scheme Launch', yearOrFact: '9 December 2023' },
      { name: 'Gruha Jyothi Launch', yearOrFact: 'February 2024 (200 free units)' }
    ]
  },
  {
    id: 'aptitude-reasoning',
    pillarId: 'aptitude',
    titleEn: 'Secretarial Abilities: Coding-Decoding, Syllogisms & DI',
    titleTe: 'సెక్రటేరియల్ ఎబిలిటీస్: కోడింగ్-డీకోడింగ్, సిలాగిజమ్స్ & డేటా ఇంటర్‌ప్రిటేషన్',
    weightage: 'Paper II in Group-IV (150 Marks)',
    examTargetAvailability: ['group4', 'group1', 'group2', 'group3'],
    summaryEn: 'High-speed mental math, seating arrangements, statement & assumptions, syllogism Venn diagrams, and tabular/pie-chart data interpretation.',
    summaryTe: 'వేగవంతమైన రీజనింగ్ నైపుణ్యాలు, సీటింగ్ అరేంజ్‌మెంట్స్, ప్రకటనలు-తీర్మానాలు, వెన్ చిత్రాలు మరియు పై-చార్ట్ విశ్లేషణ.',
    keyPointsEn: [
      'Forward/Reverse Alphabet Position values: Memorize EJOTY (5, 10, 15, 20, 25).',
      'Syllogisms rule: Universal Affirmative (All A are B), Particular Affirmative (Some A are B), Never assume without Venn cross-validation.',
      'Blood Relations: Use + for male, - for female, = for married couple, single vertical line for generation gap.',
      'Data Interpretation: Calculate base ratio change = (New - Old) / Old × 100%.'
    ],
    keyPointsTe: [
      'ఆల్ఫాబెట్ కోడింగ్: EJOTY ఫార్ములా (5, 10, 15, 20, 25) గుర్తుంచుకోవాలి.',
      'సిలాగిజమ్స్: వెన్ చిత్రాల ఆధారంగా మాత్రమే తీర్మానాలను నిర్ధారించాలి.',
      'రక్త సంబంధాలు (Blood Relations): తరం అంతరాన్ని నిలువు గీతతో, వివాహ బంధాన్ని సమాంతర జంట గీతలతో (+) (-) గుర్తులు ఉపయోగించాలి.',
      'డేటా ఇంటర్‌ప్రిటేషన్: శాతంలో మార్పు = (నూతన విలువ - పాత విలువ) / పాత విలువ × 100% సూత్రం.'
    ],
    mnemonicEn: 'E-J-O-T-Y = 5, 10, 15, 20, 25. V-E-N-N for foolproof syllogism answers.',
    mnemonicTe: 'సులభ సూత్రం: EJOTY = 5, 10, 15, 20, 25. బోర్డ్‌మాస్ (BODMAS) క్రమం తప్పనిసరి.',
    committeesOrDates: [
      { name: 'Group-IV Paper II Weightage', yearOrFact: '150 Marks / 150 Questions' },
      { name: 'Target Speed', yearOrFact: '50-55 seconds per question' }
    ]
  }
];

// --- SAMPLE VIDEO LECTURES DATA ---
const VIDEO_LECTURES: VideoLecture[] = [
  {
    id: 'vid-1',
    titleEn: '1952 Mulki Agitation & City College Firing Inquiry',
    titleTe: '1952 ముల్కీ ఉద్యమం & సిటీ కాలేజీ కాల్పుల నేపథ్యం',
    faculty: 'Prof. K. Satyanarayana',
    channel: 'Telangana Study Circle',
    duration: '28:45 min',
    pillarId: 'movement',
    topicTag: '1952 Mulki Agitation',
    youtubeId: 'dQw4w9WgXcQ', // fallback standard placeholder embed
    summary: 'Detailed timeline of Osmania student mobilization, Jaganmohan Reddy commission findings, and Nizam 1919 Farman interpretations.',
    quizQuestionIds: ['q1', 'q2', 'q3']
  },
  {
    id: 'vid-2',
    titleEn: "1956 Gentlemen's Agreement: Every Clause Explained",
    titleTe: '1956 పెద్దమనుషుల ఒప్పందం: 14 రక్షణ నిబంధనల విశ్లేషణ',
    faculty: 'Dr. Ramesh Goud',
    channel: 'TGPSC Mentors Academy',
    duration: '34:10 min',
    pillarId: 'movement',
    topicTag: 'Gentlemens Agreement',
    youtubeId: 'dQw4w9WgXcQ',
    summary: 'Step-by-step breakdown of Hyderabad House negotiations, 8 signatories, and the fate of Telangana Regional Committee.',
    quizQuestionIds: ['q4', 'q5', 'q6']
  },
  {
    id: 'vid-3',
    titleEn: 'Kakatiya Dynasty: Nayankara Administration & Temples',
    titleTe: 'కాకతీయుల పరిపాలన, నాయంకర విధానం & రామప్ప దేవాలయం',
    faculty: 'Smt. V. Anitha Devi',
    channel: 'Telangana History & Heritage',
    duration: '42:20 min',
    pillarId: 'history',
    topicTag: 'Kakatiyas',
    youtubeId: 'dQw4w9WgXcQ',
    summary: 'Focus on Motupalli inscription, Ganapatideva, Rani Rudrama Devi defense of Warangal fort, and sandbox tech in Ramappa.',
    quizQuestionIds: ['q7', 'q8', 'q9']
  },
  {
    id: 'vid-4',
    titleEn: 'Six-Point Formula (1973) & G.O. Ms. No. 610 Deep Dive',
    titleTe: 'ఆరు సూత్రాల పథకం (1973) & జి.ఓ. 610 సమగ్ర విశ్లేషణ',
    faculty: 'Sri B. Venkat Reddy',
    channel: 'Civils Edge Hyderabad',
    duration: '31:15 min',
    pillarId: 'movement',
    topicTag: 'GO 610 & Girglani',
    youtubeId: 'dQw4w9WgXcQ',
    summary: 'Jayabharath Reddy committee findings, 1985 G.O. 610, and Girglani Commission 35-chapter exhaustive report.',
    quizQuestionIds: ['q10', 'q11', 'q12']
  },
  {
    id: 'vid-5',
    titleEn: 'Telangana Socio-Economic Outlook & 6 Guarantees',
    titleTe: 'తెలంగాణ సామాజిక ఆర్థిక సర్వే & ఆరు గ్యారెంటీ పథకాలు',
    faculty: 'P. Narsimha Rao',
    channel: 'Telangana Economy Forum',
    duration: '38:50 min',
    pillarId: 'economy',
    topicTag: 'Telangana Economy',
    youtubeId: 'dQw4w9WgXcQ',
    summary: 'Latest macroeconomic trends, Per Capita Income statistics, Mahalakshmi, Gruha Jyothi, and Rythu Bharosa rollout.',
    quizQuestionIds: ['q13', 'q14']
  },
  {
    id: 'vid-6',
    titleEn: 'Secretarial Abilities: High-Speed Coding & Syllogisms',
    titleTe: 'గ్రూప్-IV సెక్రటేరియల్ ఎబిలిటీస్: షార్ట్‌కట్స్ & ట్రిక్స్',
    faculty: 'M. Srinivasulu Sir',
    channel: 'Aptitude Masterclass',
    duration: '45:00 min',
    pillarId: 'aptitude',
    topicTag: 'Secretarial Abilities',
    youtubeId: 'dQw4w9WgXcQ',
    summary: 'Speed calculation shortcuts for 150 marks Paper II in Group-IV exams with previous year questions.',
    quizQuestionIds: ['q15', 'q16']
  }
];

// --- AUTHENTIC BILINGUAL QUESTIONS BANK (20+ HIGH YIELD QUESTIONS) ---
const QUESTIONS_BANK: Question[] = [
  {
    id: 'q1',
    pillarId: 'movement',
    topicTag: '1952 Mulki Agitation',
    textEn: 'According to the 1919 Farman issued by Nizam Mir Osman Ali Khan, how many years of continuous residence in Hyderabad State was required to be recognized as a "Mulki"?',
    textTe: '1919లో నిజాం మీర్ ఉస్మాన్ అలీ ఖాన్ జారీ చేసిన ఫర్మానా ప్రకారం, హైదరాబాద్ రాజ్యంలో "ముల్కీ"గా గుర్తింపు పొందడానికి కనీసం ఎన్ని సంవత్సరాల నిరంతర నివాసం తప్పనిసరి?',
    optionsEn: ['10 Years', '12 Years', '15 Years', '20 Years'],
    optionsTe: ['10 సంవత్సరాలు', '12 సంవత్సరాలు', '15 సంవత్సరాలు', '20 సంవత్సరాలు'],
    correctIndex: 2,
    explanationEn: 'The 1919 Farman explicitly stated that a person must have continuously resided in Hyderabad State for at least 15 years and given an undertaking to abandon their original residency to be certified as a Mulki.',
    explanationTe: '1919 నిజాం ఫర్మానా ప్రకారం హైదరాబాద్ రాజ్యంలో కనీసం 15 సంవత్సరాల పాటు స్థిరనివాసం ఉండి, మునుపటి నివాసాన్ని వదులుకున్నట్లు ధ్రువీకరిస్తేనే ముల్కీ సర్టిఫికెట్ ఇచ్చేవారు.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q2',
    pillarId: 'movement',
    topicTag: '1952 Mulki Agitation',
    textEn: 'Which Judicial Commission was constituted by Chief Minister Burgula Ramakrishna Rao to investigate the police firings during the 1952 City College Mulki agitation?',
    textTe: '1952 సిటీ కాలేజీ ముల్కీ ఆందోళనలో జరిగిన పోలీసు కాల్పులపై విచారణ జరపడానికి ముఖ్యమంత్రి బూర్గుల రామకృష్ణారావు ప్రభుత్వం నియమించిన న్యాయ విచారణ కమిషన్ ఏది?',
    optionsEn: [
      'Justice Pingali Jaganmohan Reddy Commission',
      'Justice Vasishta Bhargava Committee',
      'Justice K.N. Wanchoo Committee',
      'Justice J.M. Girglani Commission'
    ],
    optionsTe: [
      'జస్టిస్ పింగళి జగన్మోహన్ రెడ్డి కమిషన్',
      'జస్టిస్ వశిష్ట భార్గవ కమిటీ',
      'జస్టిస్ కె.ఎన్. వాంచూ కమిటీ',
      'జస్టిస్ జె.ఎం. గిర్గలానీ కమిషన్'
    ],
    correctIndex: 0,
    explanationEn: 'Justice Pingali Jaganmohan Reddy was appointed as a one-man inquiry commission in Sept 1952 to probe the police firings at City College and Afzalganj that resulted in multiple student deaths.',
    explanationTe: 'సెప్టెంబర్ 1952లో సిటీ కాలేజీ మరియు అఫ్జల్‌గంజ్ వద్ద పోలీసు కాల్పుల ఘటనలపై నివేదిక సమర్పించడానికి జస్టిస్ పింగళి జగన్మోహన్ రెడ్డి కమిషన్‌ను బూర్గుల ప్రభుత్వం నియమించింది.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-I Prelims 2023'
  },
  {
    id: 'q3',
    pillarId: 'movement',
    topicTag: 'SRC 1953',
    textEn: 'What was the specific recommendation of the States Reorganisation Commission (Fazal Ali Commission) in 1955 regarding Telangana?',
    textTe: '1955లో స్టేట్స్ రీఆర్గనైజేషన్ కమిషన్ (ఫజల్ అలీ కమిషన్) తెలంగాణ విషయంలో చేసిన కీలక సిఫార్సు ఏమిటి?',
    optionsEn: [
      'Immediate unconditional merger with Andhra state',
      'Formation of Hyderabad State (Telangana) as a separate entity initially, with unification reconsidered after 5 years by its elected legislature',
      'Merger of Hyderabad State into Bombay and Mysore states permanently',
      'Creation of a Union Territory directly administered by Delhi'
    ],
    optionsTe: [
      'ఆంధ్ర రాష్ట్రంతో ఎటువంటి షరతులు లేకుండా వెనువెంటనే విలీనం చేయాలి',
      'తెలంగాణను ప్రత్యేక రాష్ట్రంగా కొనసాగించి, 5 సంవత్సరాల తర్వాత అక్కడ ఎన్నికైన అసెంబ్లీ 2/3 మెజారిటీతో కోరితేనే విలీనం చేయాలి',
      'హైదరాబాద్ రాష్ట్రాన్ని పూర్తిగా బొంబాయి మరియు మైసూర్ రాష్ట్రాల్లో కలపాలి',
      'కేంద్రపాలిత ప్రాంతంగా ప్రకటించి ఢిల్లీ నుండి పాలించాలి'
    ],
    correctIndex: 1,
    explanationEn: 'Para 386 of the Fazal Ali Commission report explicitly cautioned against immediate merger and recommended Telangana remain a separate Hyderabad state for 5 years until the 1961 elections.',
    explanationTe: 'ఫజల్ అలీ కమిషన్ రిపోర్ట్‌లోని 386వ పేరా ప్రకారం తెలంగాణను ముందుగా ప్రత్యేక రాష్ట్రంగా కొనసాగించి, 5 ఏళ్ల తర్వాత అసెంబ్లీ మూడింట రెండొంతుల మెజారిటీతో తీర్మానిస్తేనే కలపాలని స్పష్టం చేసింది.',
    difficulty: 'hard',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q4',
    pillarId: 'movement',
    topicTag: 'Gentlemens Agreement',
    textEn: "Who among the following was NOT one of the four signatories representing Telangana in the 1956 Gentlemen's Agreement?",
    textTe: '1956 పెద్దమనుషుల ఒప్పందంలో తెలంగాణ ప్రాంతం తరఫున సంతకం చేసిన నలుగురు ప్రతినిధులలో లేని నాయకుడు ఎవరు?',
    optionsEn: [
      'Burgula Ramakrishna Rao',
      'Konda Venkata Ranga Reddy',
      'Pulla Reddy',
      'Dr. Marri Chenna Reddy'
    ],
    optionsTe: [
      'బూర్గుల రామకృష్ణారావు',
      'కొండా వెంకట రంగారెడ్డి',
      'పుల్లా రెడ్డి',
      'డా. మర్రి చెన్నారెడ్డి'
    ],
    correctIndex: 2,
    explanationEn: "The 4 Telangana signatories were Burgula Ramakrishna Rao, K.V. Ranga Reddy, Dr. M. Chenna Reddy, and J.V. Narsing Rao. Pulla Reddy was not a signatory.",
    explanationTe: 'తెలంగాణ నుండి సంతకాలు చేసిన నలుగురు: బూర్గుల రామకృష్ణారావు, కొండా వెంకట రంగారెడ్డి, డా. మర్రి చెన్నారెడ్డి, జె.వి. నర్సింగరావు. పుల్లా రెడ్డి సంతకం చేయలేదు.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q5',
    pillarId: 'movement',
    topicTag: 'Gentlemens Agreement',
    textEn: "Under the Gentlemen's Agreement of 1956, what was the agreed distribution ratio of the Council of Ministers between Andhra and Telangana?",
    textTe: '1956 పెద్దమనుషుల ఒప్పందం ప్రకారం ఆంధ్ర మరియు తెలంగాణ ప్రాంతాల మధ్య మంత్రివర్గంలో నిర్ణయించబడిన నిష్పత్తి ఎంత?',
    optionsEn: ['50:50', '60:40', '70:30', '65:35'],
    optionsTe: ['50:50', '60:40', '70:30', '65:35'],
    correctIndex: 1,
    explanationEn: "Clause 10 of the agreement provided that the Cabinet should consist of 60% members from Andhra and 40% from Telangana, and if CM is from Andhra, Deputy CM must be from Telangana and vice versa.",
    explanationTe: 'ఒప్పందంలోని 10వ క్లాజు ప్రకారం మంత్రివర్గంలో 60:40 నిష్పత్తిని పాటించాలి. ముఖ్యమంత్రి ఆంధ్ర ప్రాంతం వాడైతే, ఉపముఖ్యమంత్రి తెలంగాణ ప్రాంతం వాడై ఉండాలి.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-III Model Paper'
  },
  {
    id: 'q6',
    pillarId: 'movement',
    topicTag: '1969 Agitation',
    textEn: 'In January 1969, student Ravindranath undertook an indefinite hunger strike demanding implementation of Telangana safeguards in which town?',
    textTe: '1969 జనవరిలో తెలంగాణ రక్షణల అమలు కోరుతూ విద్యార్థి రవీంద్రనాథ్ ఆమరణ నిరాహార దీక్ష చేపట్టిన ప్రాంతం ఏది?',
    optionsEn: ['Warangal', 'Palvancha (Khammam)', 'Nizamabad', 'Secunderabad'],
    optionsTe: ['వరంగల్', 'పాల్వంచ (ఖమ్మం జిల్లా)', 'నిజామాబాద్', 'సికింద్రాబాద్'],
    correctIndex: 1,
    explanationEn: 'On 8 January 1969, B.A. student Ravindranath started a hunger strike at Palvancha (Kothagudem thermal station area in Khammam) protesting illegal non-local recruitment in electricity board.',
    explanationTe: '1969 జనవరి 8న ఖమ్మం జిల్లా పాల్వంచలో విద్యుత్ శాఖలో నిబంధనలకు విరుద్ధంగా జరిగిన నాన్-ముల్కీల నియామకాలకు వ్యతిరేకంగా రవీంద్రనాథ్ దీక్ష ప్రారంభించారు.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-IV 2023'
  },
  {
    id: 'q7',
    pillarId: 'history',
    topicTag: 'Kakatiyas',
    textEn: 'The famous "Motupalli Abhaya Sasanam" (Charter of Security for Maritime Traders) was issued in 1244 AD by which Kakatiya ruler?',
    textTe: 'క్రీ.శ. 1244లో విదేశీ సముద్ర వర్తకులకు రక్షణ కల్పిస్తూ ప్రసిద్ధ "మోటుపల్లి అభయ శాసనం" జారీ చేసిన కాకతీయ చక్రవర్తి ఎవరు?',
    optionsEn: ['Ganapatideva', 'Rudrama Devi', 'Prola II', 'Prataparudra II'],
    optionsTe: ['గణపతిదేవుడు', 'రాణి రుద్రమదేవి', 'ప్రోలరాజు II', 'ప్రతాపరుద్రుడు II'],
    correctIndex: 0,
    explanationEn: 'Kakatiya Emperor Ganapatideva issued the Motupalli inscription in 1244 AD granting customs tax exemptions and personal security to merchant ships from foreign nations arriving at Motupalli port.',
    explanationTe: 'క్రీ.శ. 1244లో మోటుపల్లి రేవు వద్ద విదేశీ నావికులు, వ్యాపారులకు ఎగుమతి, దిగుమతి సుంకాల రాయితీలు ఇస్తూ గణపతిదేవుడు అభయ శాసనం వేయించాడు.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-I 2022'
  },
  {
    id: 'q8',
    pillarId: 'history',
    topicTag: 'Kakatiyas',
    textEn: 'The Ramappa Temple (Rudreswara Temple) at Palampet, designated as a UNESCO World Heritage Site, was built during the reign of which ruler by which general?',
    textTe: 'యునెస్కో ప్రపంచ వారసత్వ కట్టడంగా గుర్తింపు పొందిన పాలంపేట రామప్ప (రుద్రేశ్వర) దేవాలయాన్ని ఎవరి కాలంలో, ఏ సేనాని నిర్మించాడు?',
    optionsEn: [
      'Ganapatideva reign - built by Recharla Rudra',
      'Rudrama Devi reign - built by Gona Ganna Reddy',
      'Prataparudra II reign - built by Muppidi Nayaka',
      'Rudradeva reign - built by Beta I'
    ],
    optionsTe: [
      'గణపతిదేవుని పాలనలో - రేచర్ల రుద్రుడు నిర్మించాడు',
      'రుద్రమదేవి పాలనలో - గోన గన్నారెడ్డి నిర్మించాడు',
      'ప్రతాపరుద్రుని పాలనలో - ముప్పిడి నాయకుడు నిర్మించాడు',
      'రుద్రదేవుని పాలనలో - బేతరాజు I నిర్మించాడు'
    ],
    correctIndex: 0,
    explanationEn: 'Ramappa Temple was constructed in 1213 AD by Recharla Rudra, a general and commander-in-chief under Kakatiya ruler Ganapatideva. The sculptor was Ramappa.',
    explanationTe: 'క్రీ.శ. 1213లో కాకతీయ గణపతిదేవుని సేనాపతి రేచర్ల రుద్రుడు ఈ ఆలయాన్ని నిర్మించాడు. ప్రధాన శిల్పి రామప్ప పేరు మీదుగా ఈ గుడి ప్రసిద్ధి చెందింది.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q9',
    pillarId: 'history',
    topicTag: 'Satavahanas',
    textEn: 'Which literary work authored by Satavahana King Hala is an anthology of 700 erotic and pastoral Prakrit stanzas reflecting life in ancient Telangana?',
    textTe: 'ప్రాచీన తెలంగాణ గ్రామీణ జనజీవనం, శృంగారాన్ని ప్రతిబింబిస్తూ శాతవాహన రాజు హాలుడు సంకలనం చేసిన 700 ప్రాకృత పద్యాల సంకలనం ఏది?',
    optionsEn: ['Brihatkatha', 'Gatha Saptashati', 'Kavyamimamsa', 'Lilavati Parinayam'],
    optionsTe: ['బృహత్కథ', 'గాథా సప్తశతి', 'కావ్యమీమాంస', 'లీలావతీ పరిణయం'],
    correctIndex: 1,
    explanationEn: 'Gatha Saptashati (Gaha Sattasai) was compiled by King Hala (17th Satavahana ruler) in Maharashtri/Paisachi Prakrit language, containing references to Godavari river culture.',
    explanationTe: '17వ శాతవాహన రాజు హాలుడు క్రీ.శ. 1వ శతాబ్దంలో "గాథా సప్తశతి" గ్రంథాన్ని ప్రాకృతంలో రచించాడు.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-IV 2023'
  },
  {
    id: 'q10',
    pillarId: 'movement',
    topicTag: 'GO 610 & Girglani',
    textEn: 'Government Order (G.O.) Ms. No. 610 was issued on 30th December 1985 during the tenure of which Chief Minister of Andhra Pradesh?',
    textTe: '1985 డిసెంబర్ 30న జి.ఓ. నంబర్ 610 జారీ చేయబడినప్పుడు ఆంధ్రప్రదేశ్ ముఖ్యమంత్రిగా ఎవరున్నారు?',
    optionsEn: ['Marri Chenna Reddy', 'N. Janardhana Reddy', 'N.T. Rama Rao', 'Kotla Vijaya Bhaskara Reddy'],
    optionsTe: ['మర్రి చెన్నారెడ్డి', 'నేదురుమల్లి జనార్దనరెడ్డి', 'నందమూరి తారక రామారావు (ఎన్టీఆర్)', 'కోట్ల విజయభాస్కరరెడ్డి'],
    correctIndex: 2,
    explanationEn: 'N.T. Rama Rao government issued G.O. Ms 610 following the Jayabharath Reddy Committee report, ordering the repatriation of non-locals appointed in Zones V & VI back to their home zones by March 31, 1986.',
    explanationTe: 'జయభారత్ రెడ్డి కమిటీ సిఫార్సుల మేరకు ఎన్టీఆర్ ప్రభుత్వం 1985 డిసెంబర్ 30న జి.ఓ. 610ని జారీ చేసి, జోన్ 5 & 6లలోని అక్రమ నాన్-లోకల్స్‌ను వెనక్కి పంపాలని ఆదేశించింది.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q11',
    pillarId: 'movement',
    topicTag: 'GO 610 & Girglani',
    textEn: 'The One-Man Commission headed by J.M. Girglani appointed in 2001 was tasked with:',
    textTe: '2001లో నియమించబడిన జె.ఎం. గిర్గలానీ ఏకసభ్య కమిషన్ యొక్క ప్రధాన విధి ఏమిటి?',
    optionsEn: [
      'Determining Krishna and Godavari river water allocations',
      'Inquiring into the lapses and violations in the implementation of G.O. Ms. No. 610 and Presidential Order 1975',
      'Drafting the AP Reorganisation Bill 2014',
      'Fixing reservation quotas for BC communities in local bodies'
    ],
    optionsTe: [
      'కృష్ణా, గోదావరి నదీ జలాల కేటాయింపులను తేల్చడం',
      'రాష్ట్రపతి ఉత్తర్వు 1975 మరియు జి.ఓ. 610 అమలులో జరిగిన ఉల్లంఘనలు, లోపాలను సమగ్రంగా విచారించడం',
      'ఏపీ పునర్వ్యవస్థీకరణ బిల్లు 2014ను రూపొందించడం',
      'స్థానిక సంస్థల్లో బీసీ రిజర్వేషన్ల శాతాన్ని నిర్ణయించడం'
    ],
    correctIndex: 1,
    explanationEn: 'J.M. Girglani Commission was constituted in 2001 to investigate severe deviations in implementing G.O. 610 and submitted its final 35-chapter report in 2004 detailing massive non-local employment in Telangana.',
    explanationTe: 'గిర్గలానీ కమిషన్ 2001లో ఏర్పాటై, 2004 సెప్టెంబర్‌లో 35 అధ్యాయాల తుది నివేదికను సమర్పించి, వేలాది మంది స్థానికేతరులు తప్పుడు నియామకాల ద్వారా ఉద్యోగాలు పొందారని నిరూపించింది.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-I 2022'
  },
  {
    id: 'q12',
    pillarId: 'polity',
    topicTag: 'Constitution Article 371D',
    textEn: 'Which Constitutional Amendment Act inserted Article 371D and 371E into the Constitution of India to give effect to the Six-Point Formula?',
    textTe: 'ఆరు సూత్రాల పథకాన్ని అమలు చేయడానికి భారత రాజ్యాంగంలో ఆర్టికల్ 371D మరియు 371E లను చేర్చిన రాజ్యాంగ సవరణ చట్టం ఏది?',
    optionsEn: ['28th Amendment Act 1972', '32nd Amendment Act 1973', '42nd Amendment Act 1976', '44th Amendment Act 1978'],
    optionsTe: ['28వ రాజ్యాంగ సవరణ 1972', '32వ రాజ్యాంగ సవరణ చట్టం 1973', '42వ రాజ్యాంగ సవరణ 1976', '44వ రాజ్యాంగ సవరణ 1978'],
    correctIndex: 1,
    explanationEn: 'The 32nd Constitutional Amendment Act, 1973 inserted Article 371D (Special provisions regarding State of Andhra Pradesh - local cadres and educational admissions) and 371E (Central University).',
    explanationTe: '1973లో 32వ రాజ్యాంగ సవరణ ద్వారా ఆర్టికల్ 371D ని చేర్చారు. దీని ఆధారంగానే 1975 రాష్ట్రపతి ఉత్తర్వు జారీ చేయబడింది.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q13',
    pillarId: 'polity',
    topicTag: 'Article 3',
    textEn: 'Under Article 3 of the Indian Constitution, which condition is mandatory before introducing a bill for the formation of a new state?',
    textTe: 'భారత రాజ్యాంగంలోని ఆర్టికల్ 3 ప్రకారం నూతన రాష్ట్ర ఏర్పాటు బిల్లును పార్లమెంటులో ప్రవేశపెట్టడానికి ముందస్తుగా తప్పనిసరి నిబంధన ఏది?',
    optionsEn: [
      'Prior recommendation of the President of India',
      'Unanimous resolution passed by the concerned State Assembly',
      'Two-thirds majority approval by the Inter-State Council',
      'Approval by the Supreme Court Constitutional Bench'
    ],
    optionsTe: [
      'భారత రాష్ట్రపతి ముందస్తు సిఫార్సు తప్పనిసరి',
      'సంబంధిత రాష్ట్ర అసెంబ్లీ ఏకగ్రీవ తీర్మానం ఆమోదించాలి',
      'అంతర్రాష్ట్ర కౌన్సిల్ 2/3వ వంతు మెజారిటీతో ఆమోదించాలి',
      'సుప్రీంకోర్టు రాజ్యాంగ ధర్మాసనం అనుమతి పొందాలి'
    ],
    correctIndex: 0,
    explanationEn: 'Article 3 stipulates that no Bill for creating new states or altering boundaries shall be introduced in either House of Parliament except on the recommendation of the President.',
    explanationTe: 'ఆర్టికల్ 3 ప్రకారం రాష్ట్రపతి సిఫార్సు లేకుండా కొత్త రాష్ట్రాల ఏర్పాటు బిల్లును పార్లమెంటు ఉభయ సభల్లో ప్రవేశపెట్టడానికి వీలులేదు.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-I Prelims 2024'
  },
  {
    id: 'q14',
    pillarId: 'economy',
    topicTag: 'Telangana Schemes',
    textEn: 'Under the "Mahalakshmi" flagship scheme launched in Telangana, which of the following benefits is provided to eligible women?',
    textTe: 'తెలంగాణ ప్రభుత్వం ప్రారంభించిన "మహాలక్ష్మి" సంక్షేమ పథకం కింద అర్హులైన మహిళలకు కల్పిస్తున్న ప్రయోజనం ఏమిటి?',
    optionsEn: [
      'Free travel in TSRTC Palle Velugu & Express buses within Telangana state',
      'Free distribution of electric two-wheelers',
      '100% subsidy for commercial shop loans',
      'Free overseas air tickets for higher education'
    ],
    optionsTe: [
      'తెలంగాణ పరిధిలోని ఆర్టీసీ పల్లెవెలుగు మరియు ఎక్స్‌ప్రెస్ బస్సుల్లో ఉచిత ప్రయాణ సౌకర్యం',
      'ఉచితంగా ఎలక్ట్రిక్ ద్విచక్ర వాహనాల పంపిణీ',
      'వాణిజ్య దుకాణాల రుణాలపై 100% రాయితీ',
      'ఉన్నత చదువుల కోసం ఉచిత విదేశీ విమాన టిక్కెట్లు'
    ],
    correctIndex: 0,
    explanationEn: 'The Mahalakshmi scheme was launched on 9 Dec 2023 providing free bus travel for girl children, women of all age groups, and transgender persons in TSRTC Palle Velugu and Express buses.',
    explanationTe: 'మహాలక్ష్మి పథకం 2023 డిసెంబర్ 9న అమల్లోకి వచ్చింది. దీనిద్వారా రాష్ట్రంలో మహిళలు, బాలికలు మరియు ట్రాన్స్‌జెండర్లు పల్లెవెలుగు, ఎక్స్‌ప్రెస్ బస్సులలో ఉచితంగా ప్రయాణించవచ్చు.',
    difficulty: 'easy',
    examReference: 'TGPSC Current Affairs 2024'
  },
  {
    id: 'q15',
    pillarId: 'aptitude',
    topicTag: 'Coding-Decoding',
    textEn: 'In a certain code language, if "TELANGANA" is coded as "VGNCPICPC", then how will "HYDERABAD" be coded in the same pattern?',
    textTe: 'ఒక నిర్దిష్ట కోడ్ భాషలో "TELANGANA" ను "VGNCPICPC" గా కోడ్ చేస్తే, అదే పద్ధతిలో "HYDERABAD" ను ఏ విధంగా కోడ్ చేస్తారు?',
    optionsEn: ['JAFGTCDCF', 'KAFHTCDCF', 'JZGFSCBCF', 'IAEFSCADE'],
    optionsTe: ['JAFGTCDCF', 'KAFHTCDCF', 'JZGFSCBCF', 'IAEFSCADE'],
    correctIndex: 0,
    explanationEn: 'Each letter is shifted by +2 positions in the alphabetical order: H(+2)=J, Y(+2)=A, D(+2)=F, E(+2)=G, R(+2)=T, A(+2)=C, B(+2)=D, A(+2)=C, D(+2)=F => JAFGTCDCF.',
    explanationTe: 'ప్రతి అక్షరం వర్ణమాలలో 2 స్థానాలు ముందుకు కదులుతుంది (+2): H->J, Y->A, D->F, E->G, R->T, A->C, B->D, A->C, D->F => JAFGTCDCF.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-IV 2023'
  },
  {
    id: 'q16',
    pillarId: 'aptitude',
    topicTag: 'Number Series',
    textEn: 'Find the missing number in the sequence: 4, 18, 48, 100, 180, ?',
    textTe: 'కింది సంఖ్యా శ్రేణిలో తర్వాతి సంఖ్యను కనుగొనండి: 4, 18, 48, 100, 180, ?',
    optionsEn: ['252', '294', '312', '340'],
    optionsTe: ['252', '294', '312', '340'],
    correctIndex: 1,
    explanationEn: 'The pattern is n^3 - n^2 (or n^2 * (n-1)): For n=2: 8-4=4. n=3: 27-9=18. n=4: 64-16=48. n=5: 125-25=100. n=6: 216-36=180. For n=7: 7^3 - 7^2 = 343 - 49 = 294.',
    explanationTe: 'సూత్రం: n^3 - n^2. n=2 కి 4, n=3 కి 18, n=4 కి 48, n=5 కి 100, n=6 కి 180. కాబట్టి n=7 కి: 343 - 49 = 294.',
    difficulty: 'hard',
    examReference: 'TGPSC Group-I Prelims 2023'
  },
  {
    id: 'q17',
    pillarId: 'history',
    topicTag: 'Qutb Shahis',
    textEn: 'Who built the historic Charminar in Hyderabad in 1591 AD to commemorate the eradication of the plague epidemic?',
    textTe: 'క్రీ.శ. 1591లో ప్లేగు వ్యాధి నిర్మూలనకు గుర్తుగా హైదరాబాద్‌లో చారిత్రక చార్మినార్‌ను నిర్మించిన కుతుబ్‌షాహీ పాలకుడు ఎవరు?',
    optionsEn: ['Sultan Quli Qutb Shah', 'Ibrahim Qutb Shah', 'Muhammad Quli Qutb Shah', 'Abdullah Qutb Shah'],
    optionsTe: ['సుల్తాన్ కులీ కుతుబ్‌షా', 'ఇబ్రహీం కుతుబ్‌షా', 'మహమ్మద్ కులీ కుతుబ్‌షా', 'అబ్దుల్లా కుతుబ్‌షా'],
    correctIndex: 2,
    explanationEn: 'Muhammad Quli Qutb Shah (the 5th Sultan of the dynasty and founder of Hyderabad city) constructed Charminar in 1591 with four grand minarets designed by Iranian architects.',
    explanationTe: 'హైదరాబాద్ నగర నిర్మాత, 5వ సుల్తాన్ మహమ్మద్ కులీ కుతుబ్‌షా 1591లో ప్లేగు వ్యాధి అంతం అయినందుకు చిహ్నంగా చార్మినార్‌ను నిర్మించాడు.',
    difficulty: 'easy',
    examReference: 'TGPSC Group-IV 2023'
  },
  {
    id: 'q18',
    pillarId: 'movement',
    topicTag: 'Srikrishna Committee',
    textEn: 'The Justice B.N. Srikrishna Committee appointed by the Government of India in February 2010 presented how many options in its final report?',
    textTe: 'ఫిబ్రవరి 2010లో కేంద్ర ప్రభుత్వం నియమించిన జస్టిస్ బి.ఎన్. శ్రీకృష్ణ కమిటీ తన తుది నివేదికలో ఎన్ని ప్రత్యామ్నాయాలను (Options) ప్రతిపాదించింది?',
    optionsEn: ['4 Options', '5 Options', '6 Options', '8 Options'],
    optionsTe: ['4 ప్రత్యామ్నాయాలు', '5 ప్రత్యామ్నాయాలు', '6 ప్రత్యామ్నాయాలు', '8 ప్రత్యామ్నాయాలు'],
    correctIndex: 2,
    explanationEn: 'The Srikrishna Committee presented 6 options in Chapter 9, with Option 5 being separate Telangana with Hyderabad as capital and Option 6 being keeping the state united with statutory regional development councils.',
    explanationTe: 'శ్రీకృష్ణ కమిటీ మొత్తం 6 ఆప్షన్లను ఇచ్చింది. ఇందులో 5వ ఆప్షన్ హైదరాబాద్ రాజధానిగా ప్రత్యేక తెలంగాణ కాగా, 6వ ఆప్షన్ సమైక్యాంధ్రను కొనసాగిస్తూ ప్రాంతీయ మండళ్లను ఏర్పాటు చేయడం.',
    difficulty: 'medium',
    examReference: 'TGPSC Group-II 2016'
  },
  {
    id: 'q19',
    pillarId: 'polity',
    topicTag: 'Panchayati Raj',
    textEn: 'Which Schedule was added to the Constitution of India by the 73rd Constitutional Amendment Act, 1992 specifying 29 functional items for Panchayats?',
    textTe: '73వ రాజ్యాంగ సవరణ చట్టం 1992 ద్వారా పంచాయతీలకు 29 విధులను నిర్దేశిస్తూ భారత రాజ్యాంగంలో చేర్చబడిన షెడ్యూల్ ఏది?',
    optionsEn: ['10th Schedule', '11th Schedule', '12th Schedule', '9th Schedule'],
    optionsTe: ['10వ షెడ్యూల్', '11వ షెడ్యూల్', '12వ షెడ్యూల్', '9వ షెడ్యూల్'],
    correctIndex: 1,
    explanationEn: 'The 73rd Amendment added the 11th Schedule containing 29 functional matters for Gram Panchayats and Part IX (Articles 243 to 243-O).',
    explanationTe: '73వ సవరణ ద్వారా 11వ షెడ్యూల్‌ను చేర్చారు. ఇందులో గ్రామ పంచాయతీల కోసం 29 అధికార విధులను పేర్కొన్నారు (12వ షెడ్యూల్ మున్సిపాలిటీల 18 విధులు).',
    difficulty: 'easy',
    examReference: 'TGPSC Group-I 2023'
  },
  {
    id: 'q20',
    pillarId: 'movement',
    topicTag: 'AP Reorganisation Act 2014',
    textEn: 'Under Section 5 of the Andhra Pradesh Reorganisation Act, 2014, for what maximum period was the city of Hyderabad designated as the common capital of both Telangana and Andhra Pradesh?',
    textTe: 'ఆంధ్రప్రదేశ్ పునర్వ్యవస్థీకరణ చట్టం 2014లోని సెక్షన్ 5 ప్రకారం హైదరాబాద్ నగరం ఉమ్మడి రాజధానిగా గరిష్టంగా ఎన్ని సంవత్సరాలు కొనసాగేందుకు వెసులుబాటు కల్పించారు?',
    optionsEn: ['5 Years', '10 Years', '15 Years', '2 Years'],
    optionsTe: ['5 సంవత్సరాలు', '10 సంవత్సరాలు', '15 సంవత్సరాలు', '2 సంవత్సరాలు'],
    correctIndex: 1,
    explanationEn: 'Section 5(1) of the 2014 Act enacted that Hyderabad shall be the common capital for both successor states for an interim period not exceeding 10 years (which officially concluded on 2 June 2024).',
    explanationTe: 'సెక్షన్ 5(1) ప్రకారం హైదరాబాద్ నగరం గరిష్టంగా 10 సంవత్సరాల పాటు ఉమ్మడి రాజధానిగా ఉంటుంది (ఈ గడువు 2 జూన్ 2024తో అధికారికంగా ముగిసింది).',
    difficulty: 'easy',
    examReference: 'TGPSC Group-II Model'
  }
];

// --- SAMPLE FLASHCARDS DATA (20 FLASHCARDS) ---
const FLASHCARDS_DATA: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'committees',
    frontEn: 'Justice Pingali Jaganmohan Reddy Commission',
    frontTe: 'జస్టిస్ పింగళి జగన్మోహన్ రెడ్డి కమిషన్',
    backEn: 'Appointed in Sept 1952 to probe police firings on students during the City College Mulki agitation. Noted lack of administrative restraint.',
    backTe: '1952 సెప్టెంబర్‌లో సిటీ కాలేజీ ముల్కీ విద్యార్థులపై పోలీసు కాల్పుల విచారణకు నియమించబడింది. ప్రభుత్వ సంయమనం లోపించిందని పేర్కొంది.',
    tags: ['Mulki Rules', '1952'],
    yearOrKey: '1952'
  },
  {
    id: 'fc-2',
    category: 'dates',
    frontEn: "Gentlemen's Agreement Signing Date & Venue",
    frontTe: 'పెద్దమనుషుల ఒప్పందం సంతకం తేదీ & వేదిక',
    backEn: '20 February 1956 at Hyderabad House, New Delhi. 4 Andhra + 4 Telangana leaders signed 14 safeguard clauses.',
    backTe: '20 ఫిబ్రవరి 1956, హైదరాబాద్ హౌస్, న్యూఢిల్లీ. 14 రక్షణల ఒప్పందంపై 8 మంది సంతకాలు చేశారు.',
    tags: ['Safeguards', '1956'],
    yearOrKey: '20 Feb 1956'
  },
  {
    id: 'fc-3',
    category: 'committees',
    frontEn: 'Kumar Lalit Committee vs Vasishta Bhargava Committee',
    frontTe: 'కుమార్ లలిత్ కమిటీ vs వశిష్ట భార్గవ కమిటీ',
    backEn: 'Both calculated Telangana surplus revenue diverted to Andhra. Kumar Lalit estimated Rs 34.10 Cr (1956-68); Bhargava estimated Rs 28.34 Cr.',
    backTe: 'తెలంగాణ మిగులు నిధులను లెక్కించాయి. కుమార్ లలిత్ కమిటీ: రూ. 34.10 కోట్లు; వశిష్ట భార్గవ కమిటీ: రూ. 28.34 కోట్లు తరలించారని తేల్చింది.',
    tags: ['Surplus Revenue', '1969'],
    yearOrKey: '1969'
  },
  {
    id: 'fc-4',
    category: 'articles',
    frontEn: 'Article 371D & 32nd Constitutional Amendment',
    frontTe: 'ఆర్టికల్ 371D & 32వ రాజ్యాంగ సవరణ',
    backEn: 'Added in 1973 following Six-Point Formula. Enabled Presidential Order 1975 for local cadre organization and educational reservations across 6 zones.',
    backTe: 'ఆరు సూత్రాల పథకం తర్వాత 1973లో చేర్చబడింది. 6 జోన్లలో స్థానిక రిజర్వేషన్లు, అడ్మిషన్ల రక్షణకు చట్టబద్ధత కల్పించింది.',
    tags: ['Polity', 'Article 371D'],
    yearOrKey: '1973'
  },
  {
    id: 'fc-5',
    category: 'dates',
    frontEn: 'G.O. Ms. No. 610 Issue Date',
    frontTe: 'జి.ఓ. నంబర్ 610 జారీ తేదీ',
    backEn: '30 December 1985 by N.T. Rama Rao Government. Ordered repatriation of non-locals illegally appointed in Zones V & VI by 31 March 1986.',
    backTe: '30 డిసెంబర్ 1985, ఎన్టీఆర్ ప్రభుత్వం జారీ చేసింది. జోన్ 5 & 6లలోని స్థానికేతరులను మార్చి 31, 1986 నాటికి వెనక్కి పంపాలని ఆదేశం.',
    tags: ['Employment', 'GO 610'],
    yearOrKey: '30 Dec 1985'
  },
  {
    id: 'fc-6',
    category: 'committees',
    frontEn: 'J.M. Girglani One-Man Commission',
    frontTe: 'జె.ఎం. గిర్గలానీ ఏకసభ్య కమిషన్',
    backEn: 'Appointed in 2001; submitted final report on 30 Sept 2004 in 35 chapters highlighting 72 categories of violations of G.O. 610 in Telangana.',
    backTe: '2001లో నియమించబడి, సెప్టెంబర్ 30, 2004న 35 అధ్యాయాల నివేదిక ఇచ్చింది. జి.ఓ. 610 అమలులో 72 రకాల ఉల్లంఘనలను ఎత్తిచూపింది.',
    tags: ['GO 610', '2004'],
    yearOrKey: '2001 - 2004'
  },
  {
    id: 'fc-7',
    category: 'dynasties',
    frontEn: 'Motupalli Abhaya Sasanam (1244 AD)',
    frontTe: 'మోటుపల్లి అభయ శాసనం (క్రీ.శ. 1244)',
    backEn: 'Issued by Kakatiya Ganapatideva offering protection, fair customs duty rates, and immunity from confiscation of shipwrecked goods to sea traders.',
    backTe: 'కాకతీయ గణపతిదేవుడు వేయించాడు. ఓడరేవు వ్యాపారులకు దొంగల భయం లేకుండా రక్షణ, నిర్ణీత సుంకాలు హామీ ఇచ్చాడు.',
    tags: ['Kakatiyas', 'Trade'],
    yearOrKey: '1244 AD'
  },
  {
    id: 'fc-8',
    category: 'dynasties',
    frontEn: 'Ramappa Temple (Rudreswara Temple) - UNESCO Site',
    frontTe: 'రామప్ప దేవాలయం - యునెస్కో ప్రపంచ గుర్తింపు',
    backEn: 'Built in 1213 AD by General Recharla Rudra at Palampet. Renowned for floating light bricks, sandbox foundation, and black basalt dancing sculptures.',
    backTe: 'క్రీ.శ. 1213లో సేనాని రేచర్ల రుద్రుడు పాలంపేటలో నిర్మించాడు. నీటిపై తేలియాడే ఇటుకలు, శాండ్‌బాక్స్ పునాది టెక్నాలజీ దీని ప్రత్యేకత.',
    tags: ['Architecture', 'Kakatiya'],
    yearOrKey: '1213 AD'
  },
  {
    id: 'fc-9',
    category: 'schemes',
    frontEn: 'Mahalakshmi Scheme (2023)',
    frontTe: 'మహాలక్ష్మి పథకం (2023)',
    backEn: 'Flagship guarantee offering free travel to women, girls, and transgender persons in TSRTC Palle Velugu & Express buses + subsidised LPG cylinders.',
    backTe: 'డిసెంబర్ 9, 2023న ఆరంభమైంది. మహిళలకు ఆర్టీసీ పల్లెవెలుగు, ఎక్స్‌ప్రెస్ బస్సుల్లో జీరో టికెట్ ఉచిత ప్రయాణం.',
    tags: ['Welfare', 'Economy'],
    yearOrKey: '9 Dec 2023'
  },
  {
    id: 'fc-10',
    category: 'dates',
    frontEn: 'Telangana Appointed Day',
    frontTe: 'తెలంగాణ ఆవిర్భావ దినోత్సవం',
    backEn: '2 June 2014. Telangana was born as the 29th State of India under the Andhra Pradesh Reorganisation Act, 2014.',
    backTe: '2 జూన్ 2014. భారత 29వ రాష్ట్రంగా నూతన తెలంగాణ రాష్ట్రం అధికారికంగా అవతరించింది.',
    tags: ['State Formation', '2014'],
    yearOrKey: '2 June 2014'
  }
];

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  // --- PERSISTED STATE ---
  const [examTarget, setExamTarget] = useState<ExamTarget>(() => {
    return (localStorage.getItem('tgpsc_exam_target') as ExamTarget) || 'group2';
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('tgpsc_language') as Language) || 'en';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tgpsc_theme') === 'dark';
  });

  // Syllabus Topic Statuses
  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicStatus>>(() => {
    try {
      const saved = localStorage.getItem('tgpsc_topic_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Daily Streak
  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('tgpsc_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  // Flashcards Retention
  const [flashcardRetention, setFlashcardRetention] = useState<Record<string, 'mastered' | 'review'>>(() => {
    try {
      const saved = localStorage.getItem('tgpsc_fc_retention');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Test History
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('tgpsc_test_attempts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- LOCAL COMPONENT STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Video Vault Modal
  const [activeVideoModal, setActiveVideoModal] = useState<VideoLecture | null>(null);

  // Flashcard Deck State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState<string>('all');

  // Practice Engine State
  const [isMockRunning, setIsMockRunning] = useState(false);
  const [currentMockQuestions, setCurrentMockQuestions] = useState<Question[]>([]);
  const [mockActiveIndex, setMockActiveIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockMarked, setMockMarked] = useState<Set<number>>(new Set());
  const [mockVisited, setMockVisited] = useState<Set<number>>(new Set([0]));
  const [mockTimer, setMockTimer] = useState(1200); // 20 minutes countdown
  const [mockSummary, setMockSummary] = useState<TestAttempt | null>(null);
  const timerRef = useRef<any>(null);

  // AI Tutor State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: language === 'te'
        ? 'నమస్కారం! నేను మీ StudySphere TGPSC AI మెంటార్‌ని. తెలంగాణ ఉద్యమం, చరిత్ర, పాలిటీ లేదా ఎకానమీకి సంబంధించి ఎలాంటి సందేహమైనా నన్ను అడగండి.'
        : 'Welcome! I am your 24/7 StudySphere TGPSC AI Mentor. Ask any doubts on Telangana Movement, History, Polity, Economy, or practice MCQs.',
      time: 'Just now'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS FOR PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('tgpsc_exam_target', examTarget);
  }, [examTarget]);

  useEffect(() => {
    localStorage.setItem('tgpsc_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('tgpsc_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('tgpsc_topic_statuses', JSON.stringify(topicStatuses));
  }, [topicStatuses]);

  useEffect(() => {
    localStorage.setItem('tgpsc_fc_retention', JSON.stringify(flashcardRetention));
  }, [flashcardRetention]);

  useEffect(() => {
    localStorage.setItem('tgpsc_test_attempts', JSON.stringify(testAttempts));
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem('tgpsc_streak', streakDays.toString());
  }, [streakDays]);

  // Scroll AI messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Mock Test Timer
  useEffect(() => {
    if (isMockRunning && mockTimer > 0) {
      timerRef.current = setInterval(() => {
        setMockTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishMockTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isMockRunning, mockTimer]);

  // --- CALCULATED PROGRESS STATS ---
  const targetTopics = useMemo(() => {
    return SYLLABUS_DATA.filter((t) => t.examTargetAvailability.includes(examTarget));
  }, [examTarget]);

  const masteredCount = useMemo(() => {
    return targetTopics.filter((t) => topicStatuses[t.id] === 'mastered').length;
  }, [targetTopics, topicStatuses]);

  const inProgressCount = useMemo(() => {
    return targetTopics.filter((t) => topicStatuses[t.id] === 'in-progress').length;
  }, [targetTopics, topicStatuses]);

  const completionPercentage = useMemo(() => {
    if (!targetTopics.length) return 0;
    return Math.round((masteredCount / targetTopics.length) * 100);
  }, [masteredCount, targetTopics.length]);

  const filteredFlashcards = useMemo(() => {
    if (flashcardFilter === 'all') return FLASHCARDS_DATA;
    return FLASHCARDS_DATA.filter((fc) => fc.category === flashcardFilter);
  }, [flashcardFilter]);

  // --- HANDLERS ---
  const toggleTopicStatus = (topicId: string) => {
    setTopicStatuses((prev) => {
      const current = prev[topicId] || 'not-started';
      let next: TopicStatus = 'not-started';
      if (current === 'not-started') next = 'in-progress';
      else if (current === 'in-progress') next = 'mastered';
      else next = 'not-started';
      return { ...prev, [topicId]: next };
    });
  };

  const startMockEngine = (customQuestions?: Question[]) => {
    const qList = customQuestions || QUESTIONS_BANK;
    setCurrentMockQuestions(qList);
    setMockActiveIndex(0);
    setMockAnswers({});
    setMockMarked(new Set());
    setMockVisited(new Set([0]));
    setMockTimer(qList.length * 60); // 1 minute per question
    setMockSummary(null);
    setIsMockRunning(true);
    setActiveTab('practice');
  };

  const finishMockTest = () => {
    setIsMockRunning(false);
    clearInterval(timerRef.current);

    let correctCount = 0;
    currentMockQuestions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const accuracy = currentMockQuestions.length > 0 ? Math.round((correctCount / currentMockQuestions.length) * 100) : 0;
    const timeSpent = (currentMockQuestions.length * 60) - mockTimer;

    const attempt: TestAttempt = {
      id: 'attempt_' + Date.now(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      examTarget,
      totalQuestions: currentMockQuestions.length,
      score: correctCount,
      accuracy,
      timeSpentSeconds: timeSpent,
      answers: { ...mockAnswers }
    };

    setTestAttempts((prev) => [attempt, ...prev]);
    setMockSummary(attempt);
  };

  // AI Query Handler
  const handleSendAiPrompt = async (presetPrompt?: string) => {
    const textToSend = presetPrompt || aiPrompt;
    if (!textToSend.trim() || aiLoading) return;

    const userMessage = { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          examTarget: EXAM_DETAILS[examTarget].nameEn,
          language
        })
      });

      const data = await response.json();
      const aiReply = data.text || (language === 'te' ? 'సమాచారం సిద్ధం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'No response generated. Please try again.');

      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: language === 'te'
            ? 'క్షమించండి! సర్వర్ కనెక్ట్ కాలేదు. కానీ మీరు నోట్స్ మరియు మాక్ టెస్టులను నిరభ్యంతరంగా అభ్యసించవచ్చు.'
            : 'Notice: Network offline or server unreachable. You can continue accessing all notes, flashcards, and mock engines!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- TOP GLOBAL NAVBAR --- */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-amber-600 dark:from-indigo-400 dark:to-amber-400 bg-clip-text text-transparent">
                  StudySphere
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  TGPSC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {language === 'te' ? 'తెలంగాణ పబ్లిక్ సర్వీస్ కమిషన్ ప్రిపరేషన్ పోర్టల్' : 'Telangana Public Service Commission Exam Prep'}
              </p>
            </div>
          </div>

          {/* Center: Exam Target Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(['group1', 'group2', 'group3', 'group4'] as ExamTarget[]).map((grp) => {
              const isSelected = examTarget === grp;
              return (
                <button
                  key={grp}
                  onClick={() => setExamTarget(grp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {grp === 'group1' ? 'Group-I' : grp === 'group2' ? 'Group-II (600M)' : grp === 'group3' ? 'Group-III (450M)' : 'Group-IV (300M)'}
                </button>
              );
            })}
          </div>

          {/* Right: Controls & Toggles */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Toggle Telugu / English"
            >
              <span className={language === 'en' ? 'text-indigo-600 font-bold' : 'opacity-60'}>EN</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className={language === 'te' ? 'text-amber-500 font-bold' : 'opacity-60'}>తెలుగు</span>
            </button>

            {/* Streak Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streakDays} {language === 'te' ? 'రోజులు' : 'Days'}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Floating AI Drawer Trigger */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-amber-500 text-white shadow-sm shadow-indigo-500/30 hover:opacity-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{language === 'te' ? 'AI మెంటార్' : 'AI Companion'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* --- APP BODY WITH NAVIGATION --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'te' ? 'ప్రధాన విభాగాలు' : 'Navigation Menu'}
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'te' ? 'డాష్‌బోర్డ్' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'syllabus'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>{language === 'te' ? 'సిలబస్ & నోట్స్' : 'Syllabus & Notes'}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {targetTopics.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4" />
                <span>{language === 'te' ? 'వీడియో లెక్చర్లు' : 'Video Vault'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                MCQs
              </span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'practice'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4" />
                <span>{language === 'te' ? 'ప్రాక్టీస్ & మాక్' : 'Practice Engine'}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                CBRT
              </span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{language === 'te' ? 'మెమరీ ఫ్లాష్‌కార్డులు' : 'Flashcard Deck'}</span>
            </button>

            <button
              onClick={() => setIsAiOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all border border-amber-500/20"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'te' ? 'AI స్టడీ మెంటార్' : 'AI Study Tutor'}</span>
            </button>
          </nav>

          {/* Quick Target Info Widget */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-amber-900/10 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {language === 'te' ? 'ఎంపికైన పరీక్ష లక్ష్యం' : 'Selected Target'}
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {language === 'te' ? EXAM_DETAILS[examTarget].nameTe : EXAM_DETAILS[examTarget].nameEn}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {EXAM_DETAILS[examTarget].papers}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {language === 'te' ? EXAM_DETAILS[examTarget].descTe : EXAM_DETAILS[examTarget].descEn}
            </p>
          </div>
        </aside>

        {/* --- MAIN CONTENT PANELS --- */}
        <main className="flex-1 min-w-0">

          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Hero Banner */}
              <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/10">
                    <Flame className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{streakDays} Day Study Streak Active! Keep Pushing!</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {language === 'te' 
                      ? `${EXAM_DETAILS[examTarget].nameTe} ప్రిపరేషన్ హబ్` 
                      : `Master ${EXAM_DETAILS[examTarget].nameEn} with Confidence`}
                  </h1>
                  <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
                    {language === 'te'
                      ? 'తెలంగాణ ఉద్యమం, శాతవాహనులు, కాకతీయులు, రాజ్యాంగ ఆర్టికల్స్ మరియు సంక్షేమ పథకాలపై సంపూర్ణ పట్టు సాధించండి.'
                      : 'Structured syllabus tracker, instant CBRT-style mock drills, high-yield revision flashcards, and Gemini-powered exam mentor.'}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('practice')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>{language === 'te' ? 'మాక్ టెస్ట్ ప్రారంభించండి' : 'Start Mock Drill'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('syllabus')}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{language === 'te' ? 'సిలబస్ చదవండి' : 'Resume Syllabus'}</span>
                    </button>
                  </div>
                </div>

                {/* Decorative Abstract Glow */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-24 top-0 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Progress & Readiness Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Syllabus Completion */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <span>{language === 'te' ? 'సిలబస్ పూర్తి' : 'Syllabus Progress'}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">
                    {completionPercentage}%
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    {masteredCount} {language === 'te' ? 'టాపిక్స్ పూర్తి అయ్యాయి' : 'of'} {targetTopics.length} {language === 'te' ? '' : 'topics mastered'}
                  </p>
                </div>

                {/* 2. Mock Test Count */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <span>{language === 'te' ? 'మాక్ టెస్టుల అటెంప్ట్స్' : 'Tests Attempted'}</span>
                    <Award className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">
                    {testAttempts.length}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                    {testAttempts.length > 0
                      ? `${language === 'te' ? 'సగటు ఖచ్చితత్వం' : 'Avg Accuracy'}: ${Math.round(testAttempts.reduce((acc, t) => acc + t.accuracy, 0) / testAttempts.length)}%`
                      : language === 'te' ? 'మొదటి టెస్ట్ రాయండి' : 'Take first mock'}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    CBRT / OMR Practice Drills
                  </p>
                </div>

                {/* 3. Flashcards Memorized */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <span>{language === 'te' ? 'గుర్తుంచుకున్న కార్డులు' : 'Flashcards Mastered'}</span>
                    <Layers className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">
                    {Object.values(flashcardRetention).filter((v) => v === 'mastered').length}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
                    {FLASHCARDS_DATA.length} {language === 'te' ? 'మొత్తం కార్డులలో' : 'Total cards available'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Dates, Committees & Articles
                  </p>
                </div>

                {/* 4. Target Exam Blueprint */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <span>{language === 'te' ? 'పరీక్ష మార్కుల వెయిటేజీ' : 'Target Marks'}</span>
                    <Zap className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">
                    {EXAM_DETAILS[examTarget].marks}M
                  </div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-2 truncate">
                    {EXAM_DETAILS[examTarget].papers}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Negative marking: 1/3 (if applicable)
                  </p>
                </div>

              </div>

              {/* 5 Master Pillars Quick Status Grid */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {language === 'te' ? '5 ప్రధాన సిలబస్ విభాగాలు' : 'The 5 Master Pillars of TGPSC'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'te' ? 'ప్రతి విభాగం యొక్క ప్రిపరేషన్ స్థితిని పరిశీలించండి' : 'Track your readiness across each major syllabus section'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('syllabus')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{language === 'te' ? 'మొత్తం సిలబస్' : 'View Full Syllabus'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PILLARS.map((p) => {
                    const pillarTopics = targetTopics.filter((t) => t.pillarId === p.id);
                    const completed = pillarTopics.filter((t) => topicStatuses[t.id] === 'mastered').length;
                    const percent = pillarTopics.length > 0 ? Math.round((completed / pillarTopics.length) * 100) : 0;

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPillar(p.id);
                          setActiveTab('syllabus');
                        }}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {p.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {percent}%
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mt-2 text-slate-900 dark:text-slate-100">
                          {language === 'te' ? p.nameTe : p.nameEn}
                        </h3>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between items-center">
                          <span>{completed} / {pillarTopics.length} topics</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Test History Card */}
              {testAttempts.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {language === 'te' ? 'ఇటీవలి టెస్ట్ ఫలితాలు' : 'Recent Test Performance Diagnostic'}
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {testAttempts.slice(0, 3).map((test) => (
                      <div key={test.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            test.accuracy >= 70 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {test.score}/{test.totalQuestions}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {EXAM_DETAILS[test.examTarget].nameEn} Practice Drill
                            </div>
                            <div className="text-slate-400">{test.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{test.accuracy}%</span>
                          <div className="text-slate-400">{Math.round(test.timeSpentSeconds)}s spent</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 2. SYLLABUS & SMART NOTES VIEW */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              
              {/* Header with Search and Pillar Filters */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {language === 'te' ? 'సిలబస్ & 3-నిమిషాల స్మార్ట్ నోట్స్' : 'Interactive Syllabus & High-Yield Revision Notes'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'te' 
                        ? `${EXAM_DETAILS[examTarget].nameTe} పరీక్ష సిలబస్ అంశాలు, ముఖ్యమైన తేదీలు, మరియు కీ పాయింట్లు`
                        : `Targeting ${EXAM_DETAILS[examTarget].nameEn}. Click any topic to open comprehensive 3-minute exam revision notes.`}
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder={language === 'te' ? 'టాపిక్ లేదా కీవర్డ్ వెతకండి...' : 'Search topics, acts, dates...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Pillar Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedPillar('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedPillar === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {language === 'te' ? 'అన్ని విభాగాలు' : 'All Pillars'} ({targetTopics.length})
                  </button>
                  {PILLARS.map((p) => {
                    const count = targetTopics.filter((t) => t.pillarId === p.id).length;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPillar(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedPillar === p.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {language === 'te' ? p.nameTe : p.nameEn} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topics List with 3-State Toggle & Collapsible Notes */}
              <div className="space-y-4">
                {targetTopics
                  .filter((topic) => {
                    const matchesPillar = selectedPillar === 'all' || topic.pillarId === selectedPillar;
                    const matchesSearch =
                      topic.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      topic.titleTe.includes(searchQuery) ||
                      topic.summaryEn.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesPillar && matchesSearch;
                  })
                  .map((topic) => {
                    const status = topicStatuses[topic.id] || 'not-started';
                    const isExpanded = expandedTopicId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className="rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        {/* Topic Header Row */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          <div className="flex-1 cursor-pointer" onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                {topic.weightage}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {PILLARS.find((p) => p.id === topic.pillarId)?.[language === 'te' ? 'nameTe' : 'nameEn']}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {language === 'te' ? topic.titleTe : topic.titleEn}
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {language === 'te' ? topic.summaryTe : topic.summaryEn}
                            </p>
                          </div>

                          {/* 3-State Progress Button */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleTopicStatus(topic.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                status === 'mastered'
                                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                                  : status === 'in-progress'
                                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                              title="Click to cycle: Not Started -> In Progress -> Mastered"
                            >
                              {status === 'mastered' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              {status === 'in-progress' && <Clock className="w-3.5 h-3.5" />}
                              <span>
                                {status === 'mastered'
                                  ? (language === 'te' ? 'పూర్తయింది' : 'Mastered')
                                  : status === 'in-progress'
                                  ? (language === 'te' ? 'చదువుతున్నారు' : 'In Progress')
                                  : (language === 'te' ? 'ప్రారంభించలేదు' : 'Not Started')}
                              </span>
                            </button>

                            {/* Expand Drawer Button */}
                            <button
                              onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible 3-Minute Revision Drawer */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
                            
                            {/* Key Revision Points */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-2.5">
                                <FileText className="w-4 h-4" />
                                <span>{language === 'te' ? 'పరీక్ష ముఖ్య పాయింట్లు (High-Yield Facts)' : 'High-Yield Exam Points'}</span>
                              </h4>
                              <ul className="space-y-2">
                                {(language === 'te' ? topic.keyPointsTe : topic.keyPointsEn).map((pt, i) => (
                                  <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Committees or Key Dates Grid */}
                            {topic.committeesOrDates.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
                                  <Calendar className="w-4 h-4" />
                                  <span>{language === 'te' ? 'కమిటీలు & కీలక తేదీలు' : 'Key Committees & Landmark Dates'}</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {topic.committeesOrDates.map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{item.yearOrFact}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Exam Memory Mnemonic */}
                            {(topic.mnemonicEn || topic.mnemonicTe) && (
                              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                                    {language === 'te' ? 'మెమరీ టిప్ & నిమోనిక్' : 'Memory Mnemonic & Exam Tip'}
                                  </div>
                                  <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                                    {language === 'te' ? topic.mnemonicTe : topic.mnemonicEn}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Bar for this topic */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              <button
                                onClick={() => {
                                  const topicQuestions = QUESTIONS_BANK.filter((q) => q.pillarId === topic.pillarId);
                                  startMockEngine(topicQuestions.length > 0 ? topicQuestions : QUESTIONS_BANK);
                                }}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>{language === 'te' ? 'ఈ అంశంపై ప్రశ్నలు ప్రాక్టీస్ చేయండి' : 'Practice Topic Questions'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setIsAiOpen(true);
                                  handleSendAiPrompt(
                                    language === 'te'
                                      ? `దయచేసి "${topic.titleTe}" అంశంపై 5 ముఖ్యమైన పరీక్ష ప్రశ్నలు మరియు సమాధానాలు వివరించండి.`
                                      : `Please generate a 5-question high-yield revision quiz with explanations on: "${topic.titleEn}".`
                                  );
                                }}
                                className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{language === 'te' ? 'AI తో రివిజన్ చేయండి' : 'Ask AI to Test Me on This'}</span>
                              </button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* 3. CURATED VIDEO LECTURE VAULT VIEW */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Play className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                      <span>{language === 'te' ? 'క్యూరేటెడ్ వీడియో లెక్చర్ వాల్ట్' : 'Curated Video Lecture Vault'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {language === 'te'
                        ? 'సిలబస్ మ్యాప్ చేసిన ఉత్తమ ఫ్యాకల్టీ లెక్చర్లు + వీడియో ముగియగానే ఇన్‌స్టాంట్ 5-MCQ టెస్ట్'
                        : 'Topic-mapped masterclasses with Instant 5-MCQ comprehension test for each lecture.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {VIDEO_LECTURES.length} Masterclasses
                  </span>
                </div>
              </div>

              {/* Video Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VIDEO_LECTURES.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail / Mock Player Header */}
                      <div
                        onClick={() => setActiveVideoModal(video)}
                        className="relative h-44 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center group cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-indigo-950/40 group-hover:bg-indigo-950/20 transition-all" />
                        
                        {/* Play Button */}
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-indigo-600 shadow-xl transition-all">
                          <Play className="w-6 h-6 fill-white ml-1" />
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{video.duration}</span>
                        </div>

                        {/* Subject Tag */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
                          {video.topicTag}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{video.faculty}</span>
                          <span>{video.channel}</span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {language === 'te' ? video.titleTe : video.titleEn}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {video.summary}
                        </p>
                      </div>
                    </div>

                    {/* Instant 5-MCQ Quiz Button */}
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setActiveVideoModal(video)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>{language === 'te' ? 'వీడియో చూడండి' : 'Watch Lecture'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const matchedQuestions = QUESTIONS_BANK.filter((q) => video.quizQuestionIds.includes(q.id));
                          startMockEngine(matchedQuestions.length > 0 ? matchedQuestions : QUESTIONS_BANK.slice(0, 5));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold hover:brightness-105 shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{language === 'te' ? 'ఇన్‌స్టాంట్ 5-MCQ టెస్ట్' : 'Instant 5-MCQ Drill'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Video Player Modal */}
              {activeVideoModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="font-bold text-sm text-white truncate max-w-lg">
                        {language === 'te' ? activeVideoModal.titleTe : activeVideoModal.titleEn}
                      </div>
                      <button
                        onClick={() => setActiveVideoModal(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Embedded Player or Interactive Simulation */}
                    <div className="relative aspect-video bg-black flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 mb-3">
                        <Play className="w-8 h-8 fill-indigo-400 ml-1" />
                      </div>
                      <h4 className="text-base font-bold text-white max-w-md">
                        {language === 'te' ? activeVideoModal.titleTe : activeVideoModal.titleEn}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Faculty: {activeVideoModal.faculty} • {activeVideoModal.duration}
                      </p>
                      
                      <div className="mt-6 flex flex-wrap gap-3 justify-center">
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideoModal.titleEn + ' TGPSC')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open on YouTube</span>
                        </a>

                        <button
                          onClick={() => {
                            const matchedQuestions = QUESTIONS_BANK.filter((q) => activeVideoModal.quizQuestionIds.includes(q.id));
                            setActiveVideoModal(null);
                            startMockEngine(matchedQuestions.length > 0 ? matchedQuestions : QUESTIONS_BANK.slice(0, 5));
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Take 5-MCQ Drill Now</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
                      <span>Mapped to: {activeVideoModal.topicTag}</span>
                      <span>TGPSC Verified Content</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 4. PRACTICE & MOCK ENGINE (CBRT/OMR SIMULATOR) */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              
              {!isMockRunning && !mockSummary && (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {language === 'te' ? 'TGPSC అథెంటిక్ CBRT / OMR మాక్ టెస్ట్' : 'Authentic TGPSC CBRT / OMR Mock Engine'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {language === 'te'
                        ? 'ప్రత్యేక తెలంగాణ ఉద్యమం, చరిత్ర, పాలిటీ, ఎకానమీ మరియు రీజనింగ్‌పై అసలైన TGPSC పరీక్షా సరళిని అనుసరించే ప్రశ్నల పరీక్ష.'
                        : 'Real-time countdown timer, question palette grid, bilingual question toggling, and instant detailed diagnostic analytics.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-left grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-400 block">{language === 'te' ? 'మొత్తం ప్రశ్నలు' : 'Questions'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{QUESTIONS_BANK.length} MCQs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{language === 'te' ? 'వ్యవధి' : 'Duration'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">20 Mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{language === 'te' ? 'భాష' : 'Language'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Bilingual (EN+TE)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{language === 'te' ? 'నెగెటివ్ మార్కింగ్' : 'Marking'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">+1 / -0.33</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startMockEngine()}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{language === 'te' ? 'టెస్ట్ ప్రారంభించండి (Start Exam)' : 'Launch Full-Length Mock Exam'}</span>
                  </button>
                </div>
              )}

              {/* ACTIVE MOCK TEST SCREEN */}
              {isMockRunning && (
                <div className="space-y-4">
                  
                  {/* Top Bar: Paper Info, Timer, Language Toggle, and Submit */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                        {EXAM_DETAILS[examTarget].nameEn}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        General Studies & Telangana Movement High-Yield Drill
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Timer Display */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                        mockTimer < 180
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span>
                          {Math.floor(mockTimer / 60)}:{(mockTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Question Language Switcher */}
                      <button
                        onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                        title="Translate Active Question"
                      >
                        {language === 'en' ? 'తెలుగులోకి మార్చండి' : 'Switch to English'}
                      </button>

                      {/* Submit Exam Button */}
                      <button
                        onClick={finishMockTest}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        {language === 'te' ? 'సమర్పించండి (Submit)' : 'Submit Exam'}
                      </button>
                    </div>
                  </div>

                  {/* Main Exam Interface: Question Card + Question Palette */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    
                    {/* Left 3 Columns: Active Question Card */}
                    <div className="lg:col-span-3 space-y-4">
                      {currentMockQuestions[mockActiveIndex] && (
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[420px]">
                          <div>
                            {/* Question Meta */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                Question {mockActiveIndex + 1} of {currentMockQuestions.length}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                  {currentMockQuestions[mockActiveIndex].topicTag}
                                </span>
                                {currentMockQuestions[mockActiveIndex].examReference && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {currentMockQuestions[mockActiveIndex].examReference}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Question Text */}
                            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 leading-relaxed">
                              {language === 'te'
                                ? currentMockQuestions[mockActiveIndex].textTe
                                : currentMockQuestions[mockActiveIndex].textEn}
                            </h4>

                            {/* 4 Options Radio List */}
                            <div className="mt-6 space-y-3">
                              {(language === 'te'
                                ? currentMockQuestions[mockActiveIndex].optionsTe
                                : currentMockQuestions[mockActiveIndex].optionsEn
                              ).map((opt, optIdx) => {
                                const isSelected = mockAnswers[mockActiveIndex] === optIdx;
                                return (
                                  <label
                                    key={optIdx}
                                    onClick={() => {
                                      setMockAnswers((prev) => ({ ...prev, [mockActiveIndex]: optIdx }));
                                    }}
                                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                                      isSelected
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-slate-300 dark:border-slate-600 text-slate-400'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </div>
                                    <span className="text-sm font-medium leading-relaxed">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Navigation & Action Buttons */}
                          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-6">
                            
                            <div className="flex items-center gap-2">
                              {/* Clear Response */}
                              <button
                                onClick={() => {
                                  setMockAnswers((prev) => {
                                    const next = { ...prev };
                                    delete next[mockActiveIndex];
                                    return next;
                                  });
                                }}
                                disabled={mockAnswers[mockActiveIndex] === undefined}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 disabled:opacity-40 transition-colors"
                              >
                                {language === 'te' ? 'సమాధానం తొలగించు' : 'Clear Response'}
                              </button>

                              {/* Mark for Review */}
                              <button
                                onClick={() => {
                                  setMockMarked((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(mockActiveIndex)) next.delete(mockActiveIndex);
                                    else next.add(mockActiveIndex);
                                    return next;
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                  mockMarked.has(mockActiveIndex)
                                    ? 'bg-purple-500 text-white border-purple-500'
                                    : 'border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                                }`}
                              >
                                {mockMarked.has(mockActiveIndex)
                                  ? (language === 'te' ? 'రివ్యూలో ఉంది' : 'Marked for Review')
                                  : (language === 'te' ? 'రివ్యూ కొరకు గుర్తించు' : 'Mark for Review')}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Previous */}
                              <button
                                onClick={() => {
                                  if (mockActiveIndex > 0) {
                                    setMockActiveIndex(mockActiveIndex - 1);
                                  }
                                }}
                                disabled={mockActiveIndex === 0}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {language === 'te' ? 'మునుపటిది' : 'Previous'}
                              </button>

                              {/* Save & Next */}
                              <button
                                onClick={() => {
                                  if (mockActiveIndex < currentMockQuestions.length - 1) {
                                    const nextIdx = mockActiveIndex + 1;
                                    setMockVisited((prev) => new Set(prev).add(nextIdx));
                                    setMockActiveIndex(nextIdx);
                                  } else {
                                    finishMockTest();
                                  }
                                }}
                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                              >
                                {mockActiveIndex < currentMockQuestions.length - 1
                                  ? (language === 'te' ? 'సేవ్ చేసి ముందుకు వెళ్లు' : 'Save & Next')
                                  : (language === 'te' ? 'టెస్ట్ ముగించండి' : 'Finish & Submit')}
                              </button>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right 1 Column: Authentic TGPSC Question Palette Grid */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                        {language === 'te' ? 'ప్రశ్నల ప్యాలెట్ (Question Palette)' : 'Question Palette'}
                      </div>

                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0" />
                          <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-red-500 shrink-0" />
                          <span>Unanswered</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-purple-500 shrink-0" />
                          <span>Marked</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
                          <span>Not Visited</span>
                        </div>
                      </div>

                      {/* Numbers Grid */}
                      <div className="grid grid-cols-5 gap-2 pt-2">
                        {currentMockQuestions.map((_, idx) => {
                          const isAnswered = mockAnswers[idx] !== undefined;
                          const isMarked = mockMarked.has(idx);
                          const isCurrent = mockActiveIndex === idx;
                          const isVisited = mockVisited.has(idx);

                          let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                          if (isMarked) badgeColor = 'bg-purple-500 text-white';
                          else if (isAnswered) badgeColor = 'bg-emerald-500 text-white';
                          else if (isVisited) badgeColor = 'bg-red-500 text-white';

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setMockVisited((prev) => new Set(prev).add(idx));
                                setMockActiveIndex(idx);
                              }}
                              className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${badgeColor} ${
                                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Summary Counts */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Answered:</span>
                          <span className="font-bold text-emerald-600">{Object.keys(mockAnswers).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Marked for Review:</span>
                          <span className="font-bold text-purple-600">{mockMarked.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unanswered:</span>
                          <span className="font-bold text-red-500">{currentMockQuestions.length - Object.keys(mockAnswers).length}</span>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* POST-TEST PERFORMANCE ANALYTICS MODAL */}
              {mockSummary && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Test Submitted Successfully</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {language === 'te' ? 'పరీక్ష విశ్లేషణ & సమాధానాలు' : 'Performance Diagnostic & Answer Explanations'}
                      </h2>
                    </div>

                    <button
                      onClick={() => {
                        setMockSummary(null);
                        startMockEngine();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'మళ్లీ ప్రాక్టీస్ చేయండి' : 'Retake Drill'}</span>
                    </button>
                  </div>

                  {/* Score Highlight Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold block">{language === 'te' ? 'స్కోర్' : 'Raw Score'}</span>
                      <span className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1 block">
                        {mockSummary.score} / {mockSummary.totalQuestions}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">{language === 'te' ? 'ఖచ్చితత్వం' : 'Accuracy'}</span>
                      <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1 block">
                        {mockSummary.accuracy}%
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">{language === 'te' ? 'సమయం' : 'Time Spent'}</span>
                      <span className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1 block">
                        {Math.floor(mockSummary.timeSpentSeconds / 60)}m {mockSummary.timeSpentSeconds % 60}s
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                      <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold block">{language === 'te' ? 'లక్ష్యం' : 'Target Exam'}</span>
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-200 mt-1 block">
                        {EXAM_DETAILS[mockSummary.examTarget].nameEn}
                      </span>
                    </div>
                  </div>

                  {/* Question by Question Detailed Bilingual Explanations */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {language === 'te' ? 'ప్రతి ప్రశ్నకు సమగ్ర వివరణలు' : 'Question Breakdown & Comprehensive Explanations'}
                    </h3>

                    {currentMockQuestions.map((q, idx) => {
                      const userAnswer = mockSummary.answers[idx];
                      const isCorrect = userAnswer === q.correctIndex;
                      const isUnanswered = userAnswer === undefined;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isCorrect
                              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                              : isUnanswered
                              ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                              : 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-slate-500">Q{idx + 1}. {q.topicTag}</span>
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              isCorrect
                                ? 'bg-emerald-500 text-white'
                                : isUnanswered
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                : 'bg-red-500 text-white'
                            }`}>
                              {isCorrect ? 'Correct (+1)' : isUnanswered ? 'Not Answered (0)' : 'Incorrect (-0.33)'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {language === 'te' ? q.textTe : q.textEn}
                          </h4>

                          {/* Options Review */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {(language === 'te' ? q.optionsTe : q.optionsEn).map((opt, optIdx) => {
                              const isRightOption = optIdx === q.correctIndex;
                              const isUserPick = optIdx === userAnswer;

                              let optBorder = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                              if (isRightOption) optBorder = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                              else if (isUserPick) optBorder = 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200 line-through';

                              return (
                                <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${optBorder}`}>
                                  <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-mono">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box */}
                          <div className="mt-3.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700/60">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                              {language === 'te' ? 'వివరణ:' : 'Official TGPSC Exam Explanation:'}
                            </span>
                            <span>{language === 'te' ? q.explanationTe : q.explanationEn}</span>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* 5. FLASHCARD MEMORY DECK VIEW */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" />
                      <span>{language === 'te' ? 'స్పేస్డ్ రిపిటీషన్ మెమరీ ఫ్లాష్‌కార్డులు' : 'Spaced Repetition Memory Deck'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'te'
                        ? 'కమిటీలు, ముఖ్యమైన తేదీలు, రాజ్యాంగ నిబంధనలు మరియు కాకతీయ చరిత్రపై వేగవంతమైన స్మరణ'
                        : 'Active recall flashcards for Telangana Movement committees, historical signatories, and constitutional articles.'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {['all', 'committees', 'dates', 'articles', 'dynasties', 'schemes'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setFlashcardFilter(cat);
                          setActiveCardIndex(0);
                          setIsCardFlipped(false);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                          flashcardFilter === cat
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              {filteredFlashcards.length > 0 && (
                <div className="max-w-xl mx-auto space-y-6">
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
                    <span>Card {activeCardIndex + 1} of {filteredFlashcards.length}</span>
                    <span>
                      {Object.values(flashcardRetention).filter((v) => v === 'mastered').length} Mastered
                    </span>
                  </div>

                  {/* Card Element with Click-to-Flip */}
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="relative h-80 rounded-3xl cursor-pointer perspective-1000 transition-all transform hover:scale-[1.01]"
                  >
                    <div
                      className={`w-full h-full rounded-3xl p-8 flex flex-col justify-between border shadow-lg transition-all duration-300 ${
                        isCardFlipped
                          ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-indigo-700 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {filteredFlashcards[activeCardIndex].category}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {isCardFlipped ? (language === 'te' ? 'సమాధానం (Back)' : 'Detailed Fact (Back)') : (language === 'te' ? 'ప్రశ్న (Front)' : 'Prompt (Front)')}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="my-auto text-center">
                        {isCardFlipped ? (
                          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            {filteredFlashcards[activeCardIndex].yearOrKey && (
                              <div className="text-xs font-mono font-bold text-amber-400">
                                {filteredFlashcards[activeCardIndex].yearOrKey}
                              </div>
                            )}
                            <p className="text-base sm:text-lg font-medium leading-relaxed">
                              {language === 'te'
                                ? filteredFlashcards[activeCardIndex].backTe
                                : filteredFlashcards[activeCardIndex].backEn}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                              {language === 'te'
                                ? filteredFlashcards[activeCardIndex].frontTe
                                : filteredFlashcards[activeCardIndex].frontEn}
                            </h3>
                            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'te' ? 'వివరణ కోసం క్లిక్ చేయండి' : 'Click card to flip & reveal'}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bottom Tags */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-1.5">
                          {filteredFlashcards[activeCardIndex].tags.map((tg, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              #{tg}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">Space to flip</span>
                      </div>
                    </div>
                  </div>

                  {/* Self Assessment Controls: Needs Review vs Got It */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setFlashcardRetention((prev) => ({ ...prev, [filteredFlashcards[activeCardIndex].id]: 'review' }));
                        setIsCardFlipped(false);
                        if (activeCardIndex < filteredFlashcards.length - 1) setActiveCardIndex(activeCardIndex + 1);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'మళ్లీ రివిజన్ కావాలి' : 'Needs Review'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setFlashcardRetention((prev) => ({ ...prev, [filteredFlashcards[activeCardIndex].id]: 'mastered' }));
                        setIsCardFlipped(false);
                        if (activeCardIndex < filteredFlashcards.length - 1) setActiveCardIndex(activeCardIndex + 1);
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'te' ? 'బాగా గుర్తుంది (Got It!)' : 'Got It! (Mastered)'}</span>
                    </button>
                  </div>

                  {/* Navigation Prev/Next */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        if (activeCardIndex > 0) {
                          setActiveCardIndex(activeCardIndex - 1);
                          setIsCardFlipped(false);
                        }
                      }}
                      disabled={activeCardIndex === 0}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <span className="text-xs text-slate-400">
                      {activeCardIndex + 1} / {filteredFlashcards.length}
                    </span>

                    <button
                      onClick={() => {
                        if (activeCardIndex < filteredFlashcards.length - 1) {
                          setActiveCardIndex(activeCardIndex + 1);
                          setIsCardFlipped(false);
                        }
                      }}
                      disabled={activeCardIndex === filteredFlashcards.length - 1}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* --- AI STUDY COMPANION FLOATING DRAWER (POWERED BY GEMINI 2.5 FLASH) --- */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      StudySphere AI Tutor
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                      gemini-3.8-flash
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'te' ? '24/7 TGPSC వ్యక్తిగత మెంటార్' : '24/7 TGPSC Subject Specialist'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAiOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pre-built Quick Prompt Chips */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto flex gap-2">
              {[
                { en: '1952 Mulki Agitation 3 Bullets', te: '1952 ముల్కీ ఉద్యమం సారాంశం' },
                { en: 'G.O. 610 & Girglani Report', te: 'జి.ఓ. 610 & గిర్గలానీ నివేదిక' },
                { en: 'Kakatiya Nayankara System', te: 'కాకతీయుల నాయంకర విధానం' },
                { en: '1956 8 Signatories List', te: '1956 పెద్దమనుషుల ఒప్పందం సంతకాలు' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiPrompt(language === 'te' ? chip.te : chip.en)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-400 transition-all"
                >
                  {language === 'te' ? chip.te : chip.en}
                </button>
              ))}
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60 whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'te' ? 'AI సమాధానం ఆలోచిస్తోంది...' : 'AI Tutor is preparing response...'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiPrompt();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ అడగండి...' : 'Ask syllabus question, doubt, or quiz request...'}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Empowered by Google Gemini 2.5 Flash • TGPSC Syllabus Aligned
              </p>
            </div>

          </div>
        </div>
      )}

      {/* --- BOTTOM COMPACT FOOTER --- */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            StudySphere TGPSC — Dedicated to aspirants of Group-I, Group-II, Group-III & Group-IV examinations.
          </div>
          <div className="flex items-center gap-3">
            <span>Telangana Movement (1948–2014)</span>
            <span>•</span>
            <span>CBRT Engine</span>
            <span>•</span>
            <span>Gemini AI Tutor</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
