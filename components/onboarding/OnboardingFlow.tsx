'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import Image from 'next/image'

interface OnboardingData {
  entryCategory?: string
  specificIssue?: string
  dailyCommitment?: number
  startChoice?: string
}

const focusAreas = [
  { id: 'myself', image: '/slider-work-on-quizz/Myself.png', hoverImage: '/slider-work-on-quizz/Myself-hover.png', title: 'Myself', description: 'Focus, confidence, anxiety, honesty', gradient: 'from-[#0073ba] to-[#4bc4dc]' },
  { id: 'friends-family', image: '/slider-work-on-quizz/Friends-and-family.png', hoverImage: '/slider-work-on-quizz/Friends-and-family-hover.png', title: 'Friends & Family', description: 'Listening, boundaries, arguments', gradient: 'from-[#ff6a38] to-[#ff8c63]' },
  { id: 'school-work', image: '/slider-work-on-quizz/School-and-work.png', hoverImage: '/slider-work-on-quizz/School-and-work-hover.png', title: 'School or Work', description: 'Meetings, feedback, teams', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'influence-leadership', image: '/slider-work-on-quizz/influence-and-lidership.png', hoverImage: '/slider-work-on-quizz/influence-and-lidership-hover.png', title: 'Influence & Leadership', description: 'Persuasion, presence, impact', gradient: 'from-amber-500 to-orange-500' },
  { id: 'complex-situations', image: '/slider-work-on-quizz/complex-situations.png', hoverImage: '/slider-work-on-quizz/complex-situations-hover.png', title: 'Complex Situations', description: 'Culture, manipulation, power', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'exploring', image: '/slider-work-on-quizz/not-sure-just-exploring.png', hoverImage: '/slider-work-on-quizz/not-sure-just-exploring-hover.png', title: 'Not sure / Just exploring', description: 'Discover what fits you best', gradient: 'from-slate-500 to-gray-600' }
]

const specificIssues: Record<string, { question: string; options: string[] }> = {
  'myself': {
    question: 'What feels hardest for you right now?',
    options: ["I can't focus and get distracted easily", "I'm afraid to speak up", "I feel anxious in social situations", "I don't express what I really think", "I blame others instead of taking ownership", "I don't fit traditional learning styles", "I'm not sure yet"]
  },
  'friends-family': {
    question: 'What usually causes tension in your relationships?',
    options: ["People don't really listen to me", "I don't feel understood", "We argue a lot", "Boundaries get crossed", "Conversations get emotional fast", "There's a generational gap", "I'm often supporting someone in crisis"]
  },
  'school-work': {
    question: "What's the biggest communication problem at school or work?",
    options: ["Group projects don't work well", "Meetings feel uncomfortable", "Giving feedback is hard", "Receiving feedback is hard", "Team conflicts keep happening", "Logic creates distance with others", "Integrity or trust issues"]
  },
  'influence-leadership': {
    question: 'What kind of influence do you want to build?',
    options: ["Persuading people without manipulation", "Leading conversations better", "Organizing or mobilizing others", "Having stronger presence", "Choosing battles wisely", "Making ideas land clearly"]
  },
  'complex-situations': {
    question: 'Which situation feels most challenging?',
    options: ["Cross-cultural communication", "Power dynamics and authority", "Fear of being manipulated", "Reading body language", "Finding my unique voice", "High-stakes conversations"]
  },
  'exploring': {
    question: 'How do you want to approach TCP?',
    options: ["I want to build strong fundamentals", "I want practical tools", "I'm curious how this works", "I want to improve gradually"]
  }
}

// Step 3: Dynamic promises based on issue selection
interface IssuePack {
  issueKey: string
  issueLabel: string
  outcome: string
  techniques: string[]
  microLines: string[]
}

const issuePacks: Record<string, IssuePack> = {
  "attention": { issueKey: "attention", issueLabel: "focus issues", outcome: "sustained concentration and clarity", techniques: ["micro-reps", "focus blocks", "attention anchoring", "distraction protocols", "reset rituals"], microLines: ["No theory overload — just reps.", "Short sessions, real outcomes."] },
  "fear_of_speaking": { issueKey: "fear_of_speaking", issueLabel: "speaking confidence", outcome: "clear, steady speaking under pressure", techniques: ["micro-reps", "voice pacing drills", "low-stakes exposure", "prompted responses", "reflection loops"], microLines: ["Practice first, polish later.", "Short sessions, real outcomes."] },
  "social_anxiety": { issueKey: "social_anxiety", issueLabel: "social anxiety", outcome: "calm, grounded presence in social settings", techniques: ["exposure ladders", "grounding techniques", "body language control", "conversation starters", "exit strategies"], microLines: ["Small steps, big shifts.", "No theory overload — just reps."] },
  "not_heard": { issueKey: "not_heard", issueLabel: "being dismissed", outcome: "clear communication that lands", techniques: ["message framing", "vocal presence", "strategic repetition", "authority signals", "follow-up techniques"], microLines: ["Short sessions, real outcomes.", "Real practice, real progress."] },
  "misunderstanding": { issueKey: "misunderstanding", issueLabel: "being misunderstood", outcome: "structured, easy-to-follow communication", techniques: ["message framing", "chunking", "examples-first", "clarifying questions", "summary-back"], microLines: ["No theory overload — just reps.", "Practice first, polish later."] },
  "arguments": { issueKey: "arguments", issueLabel: "conflict in conversations", outcome: "calm, assertive responses with boundaries", techniques: ["de-escalation scripts", "non-violent phrasing", "boundary statements", "tone mirroring control", "repair attempts"], microLines: ["Short sessions, real outcomes.", "Small steps, big shifts."] },
  "group_dynamics": { issueKey: "group_dynamics", issueLabel: "group project friction", outcome: "smooth collaboration and team alignment", techniques: ["role clarity", "check-in protocols", "conflict resolution", "consensus building", "delegation scripts"], microLines: ["Real practice, real progress.", "Practice first, polish later."] },
  "meetings": { issueKey: "meetings", issueLabel: "meeting discomfort", outcome: "confident, valuable meeting participation", techniques: ["preparation templates", "speaking up scripts", "strategic silence", "follow-up techniques", "agenda control"], microLines: ["Short sessions, real outcomes.", "Small steps, big shifts."] },
  "giving_feedback": { issueKey: "giving_feedback", issueLabel: "feedback delivery anxiety", outcome: "clear, constructive feedback delivery", techniques: ["SBI framework", "sandwich method", "specific examples", "forward focus", "empathy bridges"], microLines: ["Practice first, polish later.", "No theory overload — just reps."] },
  "ethical_persuasion": { issueKey: "ethical_persuasion", issueLabel: "persuasion without manipulation", outcome: "authentic influence that respects others", techniques: ["value alignment", "story framing", "benefit focus", "reciprocity", "social proof"], microLines: ["No theory overload — just reps.", "Practice first, polish later."] },
  "presence": { issueKey: "presence", issueLabel: "weak presence", outcome: "strong, magnetic presence", techniques: ["body language", "vocal power", "eye contact", "spatial awareness", "energy projection"], microLines: ["Small steps, big shifts.", "Practice first, polish later."] },
  "power_dynamics": { issueKey: "power_dynamics", issueLabel: "power imbalances", outcome: "navigation of authority and hierarchy", techniques: ["upward communication", "influence without authority", "strategic deference", "authority signals", "political awareness"], microLines: ["Short sessions, real outcomes.", "Practice first, polish later."] },
  "fundamentals": { issueKey: "fundamentals", issueLabel: "communication basics", outcome: "strong foundational skills", techniques: ["core frameworks", "essential techniques", "universal principles", "practice loops", "progressive building"], microLines: ["No theory overload — just reps.", "Real practice, real progress."] }
}

const verbs = ["turn", "shift", "transform"]

function generateDynamicPromises(issueSelection: string): { sentence1: string; sentence2: string; sentence3: string } {
  let pack: IssuePack | undefined
  
  // Try to find matching pack from issue keys
  Object.values(issuePacks).forEach(p => {
    if (issueSelection.toLowerCase().includes(p.issueLabel.toLowerCase())) {
      pack = p
    }
  })
  
  // Fallback to a default pack
  if (!pack) pack = issuePacks.fundamentals
  
  // Generate variations
  const verb = verbs[Math.floor(Math.random() * verbs.length)]
  const numTechniques = 2 + Math.floor(Math.random() * 3) // 2-4 techniques
  const selectedTechniques = pack.techniques
    .sort(() => Math.random() - 0.5)
    .slice(0, numTechniques)
  const microLine = pack.microLines[Math.floor(Math.random() * pack.microLines.length)]
  
  const sentence1 = `We'll help you ${verb} ${pack.issueLabel} into ${pack.outcome} with small, guided steps you can actually repeat.`
  const sentence2 = `You'll train with ${selectedTechniques.join(", ")} inside short missions, practice loops, and real scenarios. ${microLine}`
  const sentence3 = `We believe progress comes from consistency and a team that's built this method end-to-end.`
  
  return { sentence1, sentence2, sentence3 }
}

const commitmentOptions = [
  { id: 15, label: '15 min / day', subtitle: 'Casual' },
  { id: 20, label: '20 min / day', subtitle: 'Regular' },
  { id: 25, label: '25 min / day', subtitle: 'Serious' },
  { id: 30, label: '30 min / day', subtitle: 'Intense' }
]

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showShake, setShowShake] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [generatedPromises, setGeneratedPromises] = useState<{ sentence1: string; sentence2: string; sentence3: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Shake animation after 10 seconds if option is selected
  useEffect(() => {
    if (selectedOption || currentStep === 2) {
      setShowShake(false)
      const timer = setTimeout(() => {
        setShowShake(true)
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      setShowShake(false)
    }
  }, [selectedOption, currentStep])

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleClose = () => {
    router.push('/')
    setTimeout(() => {
      document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleContinue = () => {
    setShowShake(false)
    if (currentStep === 0 && selectedOption) {
      setData({ ...data, entryCategory: selectedOption })
      localStorage.setItem('onboarding_category', selectedOption)
      setCurrentStep(1)
      setSelectedOption(null)
    } else if (currentStep === 1 && selectedOption) {
      setData({ ...data, specificIssue: selectedOption })
      localStorage.setItem('onboarding_issue', selectedOption)
      // Generate promises once when moving to step 2
      const promises = generateDynamicPromises(selectedOption)
      setGeneratedPromises(promises)
      setCurrentStep(2)
      setSelectedOption(null)
    } else if (currentStep === 2) {
      setCurrentStep(3)
      setSelectedOption(null)
    } else if (currentStep === 3 && selectedOption) {
      setData({ ...data, dailyCommitment: parseInt(selectedOption) })
      localStorage.setItem('onboarding_commitment', selectedOption)
      setCurrentStep(4)
      setSelectedOption(null)
    } else if (currentStep === 4 && selectedOption) {
      setData({ ...data, startChoice: selectedOption })
      localStorage.setItem('onboarding_complete', 'true')
      localStorage.setItem('onboarding_timestamp', new Date().toISOString())
      
      if (selectedOption === 'chapter-1') {
        // Send to public Chapter 1 demo reader that does NOT require login.
        // After finishing the reading there, user is sent to login.
        router.push('/onboarding/chapter-1')
      } else if (selectedOption === 'full-access') {
        router.push('/auth/register')
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedOption(null)
    }
  }

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : focusAreas.length - 1))
  }

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev < focusAreas.length - 1 ? prev + 1 : 0))
  }

  if (!mounted) return null

  const currentIssues = data.entryCategory ? specificIssues[data.entryCategory] : null

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-[#0a1628] dark:via-[#142A4A] dark:to-[#0a1628] overflow-hidden flex flex-col">
      {/* Navbar - Logo and Close */}
      <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="relative h-10 sm:h-12 w-auto">
            <Image
              src="/TCP-logo.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 sm:h-12 w-auto dark:hidden"
              priority
            />
            <Image
              src="/TCP-logo-white.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-10 sm:h-12 w-auto hidden dark:block"
              priority
            />
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Progress bar - below navbar */}
      <div className="flex-shrink-0 h-3 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-full bg-[var(--color-blue)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main content - scrollable, aligned to top for mobile */}
      <div className="flex-1 w-full flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {/* STEP 0: Focus Area - ORIGINAL DESIGN */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex flex-col items-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)] dark:text-white mb-2">
                    I want to work on...
                  </h1>
                  <p className="text-sm text-[var(--color-gray)]">
                    Choose your focus area
                  </p>
                </div>

                {/* Grid layout - mobile: 2 columns (Duolingo-style), desktop: 3 columns */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                  {focusAreas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedOption(area.id)}
                      className={`relative group rounded-xl p-2 lg:p-3 transition-all cursor-pointer ${
                        selectedOption === area.id
                          ? `bg-gradient-to-br ${area.gradient} text-white shadow-2xl scale-105`
                          : 'bg-white dark:bg-[#1a3456] border-2 border-gray-200 dark:border-gray-700 hover:border-[#0073ba] dark:hover:border-[#4bc4dc] shadow-lg hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      <div className={`w-full aspect-square rounded-lg mb-1 lg:mb-2 flex items-center justify-center overflow-hidden relative ${
                        selectedOption === area.id ? 'bg-white/15' : 'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        {/* Default image - hidden on hover or when selected */}
                        <Image 
                          src={area.image} 
                          alt={area.title}
                          width={300}
                          height={300}
                          quality={100}
                          priority
                          className={`w-full h-full object-contain transition-opacity duration-300 ${
                            selectedOption === area.id ? 'opacity-0' : 'group-hover:opacity-0'
                          }`}
                        />
                        {/* Hover image - shown on hover or when selected */}
                        <Image 
                          src={area.hoverImage} 
                          alt={`${area.title} hover`}
                          width={300}
                          height={300}
                          quality={100}
                          priority
                          className={`w-full h-full object-contain absolute inset-0 transition-opacity duration-300 ${
                            selectedOption === area.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                      <h3 className={`text-xs lg:text-sm font-bold mb-0.5 lg:mb-1 ${
                        selectedOption === area.id ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {area.title}
                      </h3>
                      <p className={`text-[10px] lg:text-xs leading-tight line-clamp-2 ${
                        selectedOption === area.id ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {area.description}
                      </p>
                      {selectedOption === area.id && (
                        <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 1: Specific Issue */}
            {currentStep === 1 && currentIssues && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto relative"
              >
                {/* Background images - HUGE faded behind content */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-visible">
                  {/* Normal image - left side, HUGE */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-96 w-[600px] h-[600px] opacity-12">
                    <Image 
                      src={focusAreas.find(area => area.id === data.entryCategory)?.image || ''} 
                      alt="Background"
                      width={600}
                      height={600}
                      quality={100}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Hover image - right side, HUGE */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-96 w-[600px] h-[600px] opacity-8">
                    <Image 
                      src={focusAreas.find(area => area.id === data.entryCategory)?.hoverImage || ''} 
                      alt="Background hover"
                      width={600}
                      height={600}
                      quality={100}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Centered content with background */}
                <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-center text-[var(--color-charcoal)] dark:text-white mb-4">
                    {currentIssues.question}
                  </h2>
                  
                  <div className="bg-[var(--color-blue)]/10 border-l-4 border-[var(--color-blue)] p-4 mb-6 rounded">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <strong>Why focus on one?</strong> Concentrating on a single area allows for faster, more meaningful improvement. Don't worry - you can work on other areas later. This is just your starting point!
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentIssues.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                          selectedOption === option
                            ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/10 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[var(--color-blue)]/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {selectedOption === option && (
                          <div className="flex-shrink-0 w-5 h-5 bg-[var(--color-blue)] rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {selectedOption !== option && (
                          <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white flex-1">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Dynamic Promises - Image above text, full-width cards */}
            {currentStep === 2 && generatedPromises && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--color-charcoal)] dark:text-white mb-8">
                  Here's what you'll build with TCP:
                </h2>
                
                <div className="flex flex-col gap-4 sm:gap-6">
                  {/* Sentence 1: Issue → Solution */}
                  <div className="w-full flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden lg:overflow-visible">
                    {/* Image section - Top on mobile, Left icon on desktop */}
                    <div className="w-full lg:w-auto aspect-[2/1] sm:aspect-[3/1] lg:aspect-auto flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-0 lg:pt-6 lg:pl-6 lg:pb-6 lg:bg-transparent">
                      <Image 
                        src="/slider-work-on-quizz/1.png" 
                        alt="Solution"
                        width={160}
                        height={120}
                        quality={100}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-20 lg:h-20 object-contain"
                      />
                    </div>
                    {/* Text section */}
                    <div className="p-5 sm:p-6 lg:flex-1">
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                        {generatedPromises.sentence1}
                      </p>
                    </div>
                  </div>

                  {/* Sentence 2: Techniques */}
                  <div className="w-full flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden lg:overflow-visible">
                    {/* Image section - Top on mobile, Left icon on desktop */}
                    <div className="w-full lg:w-auto aspect-[2/1] sm:aspect-[3/1] lg:aspect-auto flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-0 lg:pt-6 lg:pl-6 lg:pb-6 lg:bg-transparent">
                      <Image 
                        src="/slider-work-on-quizz/2.png" 
                        alt="Training"
                        width={160}
                        height={120}
                        quality={100}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-20 lg:h-20 object-contain"
                      />
                    </div>
                    {/* Text section */}
                    <div className="p-5 sm:p-6 lg:flex-1">
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                        {generatedPromises.sentence2}
                      </p>
                    </div>
                  </div>

                  {/* Sentence 3: Consistency + Team */}
                  <div className="w-full flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden lg:overflow-visible">
                    {/* Image section - Top on mobile, Left icon on desktop */}
                    <div className="w-full lg:w-auto aspect-[2/1] sm:aspect-[3/1] lg:aspect-auto flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-0 lg:pt-6 lg:pl-6 lg:pb-6 lg:bg-transparent">
                      <Image 
                        src="/slider-work-on-quizz/3.png" 
                        alt="Progress"
                        width={160}
                        height={120}
                        quality={100}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-20 lg:h-20 object-contain"
                      />
                    </div>
                    {/* Text section */}
                    <div className="p-5 sm:p-6 lg:flex-1">
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                        {generatedPromises.sentence3}{" "}
                        <a 
                          href="/about-project" 
                          target="_blank"
                          className="text-[var(--color-blue)] hover:underline font-semibold"
                        >
                          Learn about our project →
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Daily Commitment */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                <h2 className="text-3xl font-bold text-center text-[var(--color-charcoal)] dark:text-white mb-8">
                  How much time can you give per day?
                </h2>
                <div className="space-y-2">
                  {commitmentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id.toString())}
                      className={`w-full p-3 rounded-xl border-2 transition-all ${
                        selectedOption === option.id.toString()
                          ? 'border-[#0073ba] dark:border-[#4bc4dc] bg-[#0073ba]/5 dark:bg-[#4bc4dc]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{option.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{option.subtitle}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Start Choice */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto flex flex-col gap-8"
                style={{ '--step4-gap': '2rem' } as React.CSSProperties}
              >
                <h2 className="text-3xl font-bold text-center text-[var(--color-charcoal)] dark:text-white">
                  Ready to start?
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
                  {/* Start Chapter 1 - Free Demo */}
                  <button
                    onClick={() => setSelectedOption('chapter-1')}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedOption === 'chapter-1'
                        ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/5 shadow-2xl'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[var(--color-blue)]/50 shadow-lg'
                    }`}
                  >
                    {/* Illustration - top section */}
                    <div className="h-64 sm:h-72 bg-gradient-to-br from-[var(--color-blue)]/10 to-[var(--color-blue)]/5 flex overflow-hidden">
                      <Image 
                        src="/slider-work-on-quizz/free.png" 
                        alt="Start Chapter 1"
                        width={512}
                        height={512}
                        quality={100}
                        priority
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    
                    {/* Content section */}
                    <div className="p-6 pt-4 text-left bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-[var(--color-charcoal)] dark:text-white">
                          Start Chapter 1
                        </h3>
                        {selectedOption === 'chapter-1' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-blue)] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Free Demo - Start reading immediately
                      </p>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-blue)] mt-0.5">✓</span>
                          <span>Instant access to Chapter 1</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-blue)] mt-0.5">✓</span>
                          <span>Learn the fundamentals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-blue)] mt-0.5">✓</span>
                          <span>No registration required</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-blue)] mt-0.5">✓</span>
                          <span>Try before you commit</span>
                        </li>
                      </ul>
                    </div>
                  </button>

                  {/* Register First - Full Access */}
                  <button
                    onClick={() => setSelectedOption('full-access')}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedOption === 'full-access'
                        ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/5 shadow-2xl'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[var(--color-amber)]/50 shadow-lg'
                    }`}
                  >
                    {/* Illustration - top section */}
                    <div className="h-64 sm:h-72 bg-gradient-to-br from-[var(--color-amber)]/10 to-[var(--color-amber)]/5 flex overflow-hidden relative">
                      {/* Badge */}
                      <div className="absolute top-3 right-3 bg-[var(--color-amber)] text-[var(--color-charcoal)] px-3 py-1 rounded-full text-xs font-bold uppercase z-10">
                        Best Value
                      </div>
                      <Image 
                        src="/slider-work-on-quizz/payed.png" 
                        alt="Register First"
                        width={512}
                        height={512}
                        quality={100}
                        priority
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    
                    {/* Content section */}
                    <div className="p-6 pt-4 text-left bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-[var(--color-charcoal)] dark:text-white">
                          Register First
                        </h3>
                        {selectedOption === 'full-access' && (
                          <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-amber)] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Get full access - All chapters unlocked
                      </p>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-amber)] mt-0.5">✓</span>
                          <span>All 30 chapters unlocked</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-amber)] mt-0.5">✓</span>
                          <span>Complete training program</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-amber)] mt-0.5">✓</span>
                          <span>Lifetime access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[var(--color-amber)] mt-0.5">✓</span>
                          <span>One-time payment</span>
                        </li>
                      </ul>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons - high z-index so never overlayed by logo */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-4">
          {/* Info icon with compact tooltip card above button - centered */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
            </button>
            
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: "spring", duration: 0.2 }}
                  className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {/* Heading above card */}
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 px-1">
                    Data Collection Notice
                  </h4>
                  
                  {/* Compact card */}
                  <div 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-blue)]/10 flex items-center justify-center mt-0.5">
                        <Info className="w-4 h-4 text-[var(--color-blue)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          The information you provide is collected solely to personalize your learning experience. This data enables our platform to recommend tailored activities and learning paths that align with your specific communication development goals.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowTooltip(false)}
                        className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors -mt-0.5"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-white dark:bg-gray-800 text-[var(--color-gray)] border-2 border-[var(--color-gray)] hover:border-[var(--color-charcoal)] shadow-md hover:shadow-lg"
            >
              Back
            </button>
          )}
          <motion.button
            onClick={handleContinue}
            disabled={currentStep !== 2 && !selectedOption}
            animate={showShake && (currentStep === 2 || selectedOption) ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
            } : {}}
            className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all ${
              currentStep !== 2 && !selectedOption
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg'
            }`}
          >
            Continue
          </motion.button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#0073ba]/10 via-[#4bc4dc]/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-[#ff6a38]/10 via-[#ff8c63]/5 to-transparent rounded-full blur-3xl"
        />
      </div>
    </div>
  )
}
