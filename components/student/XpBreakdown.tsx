'use client'

import Link from 'next/link'
import { Trophy, Star, Lock, Shield, MessageCircle, Zap, CheckCircle } from 'lucide-react'
import './XpBreakdown.css'

export default function XpBreakdown(props: {
  phase: number
  mission: number
  zone: number
  total: number
  levelInfo: {
    level: number
    xp: number
  }
  systemStatus: {
    completedMissions: number
    totalMissions: number
  }
  nextMissionUrl: string
  nextMissionNumber?: number
}) {
  // Mock data for badges - replace with actual data from props later
  const badges = [
    { id: 1, name: 'THE FIRST STEP', icon: '🎯', earned: true, color: 'bg-red-500' },
    { id: 2, name: 'FEAR ALCHEMIST', icon: '🔥', earned: true, color: 'bg-orange-500' },
    { id: 3, name: 'ENERGY BUILDER', icon: '⚡', earned: true, color: 'bg-red-500' },
    { id: 4, name: 'TEAM LEADER BUILDER', icon: '👥', earned: true, color: 'bg-yellow-500' },
    { id: 5, name: 'MISSION #1: THE FIRST FRAME', icon: '🎬', earned: false, color: 'bg-gray-400' },
    { id: 6, name: 'MISSION #2: THE DECISIVE HAMMER', icon: '🔨', earned: false, color: 'bg-gray-400' },
    { id: 7, name: 'MISSION #3: THE COLLECTOR HAMMER', icon: '💎', earned: false, color: 'bg-gray-400' },
    { id: 8, name: 'MISSION #4: THE FIRST SHIELD', icon: '🛡️', earned: false, color: 'bg-gray-400' },
    { id: 9, name: 'MISSION #5: THE FIRST QUEST', icon: '📜', earned: false, color: 'bg-gray-400' },
    { id: 10, name: 'MISSION #7: AIR\nTHE FIRST TOWER', icon: '🗼', earned: false, color: 'bg-gray-400' },
    { id: 11, name: 'MISSION #8: THE FIRST LEVER', icon: '🎚️', earned: false, color: 'bg-gray-400' },
    { id: 12, name: 'MISSION #8: FIRST FRAME', icon: '🖼️', earned: false, color: 'bg-gray-400' },
  ]

  const superpowers = [
    { id: 1, name: 'The Attention Shield', icon: Shield, status: 'Active' },
    { id: 2, name: 'The Voice Shield', icon: MessageCircle, status: 'Active' },
    { id: 3, name: 'The Brave Framework', icon: Zap, status: 'Active' },
  ]

  const overallProgress = props.systemStatus.totalMissions === 0 ? 0 : props.systemStatus.completedMissions / props.systemStatus.totalMissions
  const progressBlocks = 10
  const filledBlocks = Math.round(overallProgress * progressBlocks)

  return (
    <div className="xp-breakdown-container">
      <div className="space-y-6 relative z-10">
        {/* Header Banner (Restored to Top) */}
        <div className="neon-header-banner">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="text-sm md:text-base font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              ✨ THE COMMUNICATION CODE: LEVEL UP YOUR LIFE ✨
            </span>
            <Star className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center space-y-2 py-4">
          <div className="flex items-center justify-center gap-4">
            <Trophy className="w-12 h-12 md:w-16 md:h-16 text-[#F5B301] drop-shadow-[0_0_15px_rgba(245,179,1,0.6)]" />
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
              TROPHY CASE OF TRANSFORMATION
            </h1>
          </div>
          <p className="text-sm md:text-base tracking-widest text-[#F5B301]">
            TRANSFORM FROM INVISIBLE INTO AN INFLUENTIAL HERO
          </p>
        </div>

        {/* Badges Earned Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-slate-900 tracking-wide section-header">BADGES EARNED</h2>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`badge-card relative rounded-lg p-3 flex flex-col items-center justify-center text-center ${badge.earned
                    ? `earned ${badge.color} text-white`
                    : 'locked bg-gray-300 text-gray-600'
                  }`}
              >
                <div className="badge-icon text-2xl mb-2">{badge.icon}</div>
                <p className="text-[10px] font-semibold leading-tight line-clamp-2">
                  {badge.name}
                </p>
                {badge.earned && (
                  <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-white" />
                )}
                {!badge.earned && (
                  <Lock className="absolute top-1 right-1 w-4 h-4 text-gray-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked Superpowers Library Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg md:text-xl font-bold mb-6 text-slate-900 tracking-wide section-header">UNLOCKED SUPERPOWERS LIBRARY</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {superpowers.map((power) => {
              const Icon = power.icon
              return (
                <div
                  key={power.id}
                  className="superpower-card bg-white rounded-lg p-6 flex flex-col items-center text-center shadow-sm"
                >
                  <div className="icon-wrapper">
                    <Icon className="w-16 h-16 text-gray-400 mb-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{power.name}</h3>
                  <p className="text-sm text-gray-600">({power.status})</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* BOTTOM ROW: XP Leaderboard & System Status Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

          {/* XP Leaderboard Section (Left Column) */}
          <div className="neon-card-wrapper h-full">
            <div className="neon-card h-full flex flex-col justify-between">
              <h2 className="text-lg md:text-xl font-bold mb-6 text-slate-900 tracking-wide">XP LEADERBOARD</h2>

              <div className="space-y-6 flex-grow flex flex-col justify-center">
                <div className="text-center py-4">
                  <div className="total-xp-wrapper" data-text={`TOTAL XP: ${props.total.toLocaleString()}`}>
                    <span className="total-xp-text">
                      TOTAL XP: {props.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-cyan-200 pt-6 mt-auto">
                  <div className="flex items-center justify-center gap-3">
                    <Lock className="w-5 h-5 text-cyan-500" />
                    <span className="text-sm md:text-base tracking-wider text-gray-600">
                      GLOBAL RANK: <span className="rank-badge font-bold text-slate-900">#1234</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card (Right Column) */}
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 tracking-wide">
                  SYSTEM STATUS
                </h3>

                {/* Agent Level */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#5BC0DE]" />
                    <span className="text-sm text-gray-600">AGENT LEVEL:</span>
                    <span className="font-bold text-gray-800">{props.levelInfo.level}</span>
                  </div>
                  <span className="font-bold text-gray-800">{props.levelInfo.xp}</span>
                </div>

                {/* XP Earned */}
                <div className="mb-3">
                  <span className="text-sm text-gray-600">XP EARNED</span>
                </div>

                {/* Overall Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">OVERALL PROGRESS:</span>
                    <span className="font-bold text-gray-800">
                      {props.systemStatus.completedMissions}/{props.systemStatus.totalMissions}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: progressBlocks }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${i < filledBlocks ? 'bg-gray-800' : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-auto pt-4">
                <Link href={props.nextMissionUrl} className="block">
                  <button
                    className="w-full bg-[#5BC0DE] hover:bg-[#4AB0CE] text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-sm">START TODAY&apos;S MISSION</div>
                      {props.nextMissionNumber && (
                        <div className="text-xs opacity-80">(MISSION #{props.nextMissionNumber})</div>
                      )}
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
