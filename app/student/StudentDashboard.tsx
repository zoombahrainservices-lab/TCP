'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';
import styles from './JourneyMap.module.css';
import XpBreakdown from '@/components/student/XpBreakdown';
import AnimatedRedDot from '@/components/student/AnimatedRedDot';
import AnimatedLightning from '@/components/student/AnimatedLightning';
import AnimatedSignalTower from '@/components/student/AnimatedSignalTower';

type ZoneStatus = 'locked' | 'current' | 'upcoming';

type Zone = {
  id: number;
  zoneNumber: number;
  title: string;
  subtitle: string;
  color: string; // hex for glow
  status: ZoneStatus;
  completionPercentage?: number; // 0-100 for progress bar
};

type LevelInfo = {
  level: number;
  xp: number;
  nextLevelXp: number;
};

type SystemStatus = {
  completedMissions: number;
  totalMissions: number;
};

type Props = {
  zones: Zone[];
  levelInfo: LevelInfo;
  xpBreakdown?: {
    phase: number;
    mission: number;
    zone: number;
    total: number;
  };
  systemStatus: SystemStatus;
  nextMissionUrl: string;
  nextMissionNumber?: number;
};

export function StudentDashboard({
  zones,
  levelInfo,
  xpBreakdown,
  systemStatus,
  nextMissionUrl,
  nextMissionNumber,
}: Props) {
  const overallProgress =
    systemStatus.totalMissions === 0
      ? 0
      : systemStatus.completedMissions / systemStatus.totalMissions;

  // For the little progress rectangles
  const progressBlocks = 10;
  const filledBlocks = Math.round(overallProgress * progressBlocks);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 overflow-x-hidden">
      {/* Top teal strip */}
      <div className="w-full bg-gradient-to-r from-[#00f2ff] via-[#4ef3ff] to-[#00e0ff] py-2 text-center text-xs font-semibold tracking-[0.25em] uppercase text-slate-900">
        THE COMMUNICATION CODE: LEVEL UP YOUR LIFE
      </div>

      <main className="w-full px-4 sm:px-6 py-10">
        {/* HERO */}
        <section className="mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] text-[#00c4ff] uppercase">
            Welcome to the path of the communicator, agent
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#e5a945] md:text-4xl">
            WELCOME TO THE PATH OF THE
            <br />
            COMMUNICATOR, AGENT
          </h1>
          <p className="mt-2 text-sm font-medium text-[#d1b97f]">
            TRANSFORM FROM AN INVISIBLE VOICE INTO AN INFLUENTIAL HERO
          </p>
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 md:grid-cols-[2.2fr,1fr]">
          {/* XP Breakdown */}
          {xpBreakdown && (
            <div className="col-span-full">
              <XpBreakdown
                {...xpBreakdown}
                levelInfo={levelInfo}
                systemStatus={systemStatus}
                nextMissionUrl={nextMissionUrl}
                nextMissionNumber={nextMissionNumber}
              />
            </div>
          )}
          {/* JOURNEY MAP CARD - Full Width */}
          <div className={`${styles.journeyWrapper} col-span-full`}>
            <h3 className={styles.journeyTitle}>JOURNEY MAP</h3>

            <div className={styles.journeyMap}>
              {/* Horizontal track behind zones */}
              <div className={styles.journeyTrack} />

              {zones.map((zone, index) => {
                const isCurrent = zone.status === 'current';
                const isLocked = zone.status === 'locked';
                const isLast = index === zones.length - 1;
                const nextZone = !isLast ? zones[index + 1] : null;

                // Get zone code
                const zoneCodes = ['SPINLITE', 'EMINUTE', 'GAMSTE', 'GRAWUTE', 'MASTER'];
                const zoneCode = zoneCodes[zone.zoneNumber - 1] || 'ZONE';

                // Zone colors for neon effects - exact neon color set
                const ZONE_NEON_COLORS: Record<number, { core: string; glow: string }> = {
                  1: { core: '#FF2D2D', glow: '#FF6C6C' }, // Red
                  2: { core: '#FFAA23', glow: '#FFD25B' }, // Orange
                  3: { core: '#F7DA0D', glow: '#FFF27A' }, // Yellow
                  4: { core: '#28D94D', glow: '#7BFF9B' }, // Green
                  5: { core: '#0DB7FF', glow: '#86E3FF' }, // Blue
                };

                // Determine color class based on zone number (always assign color, lock controls active state)
                const getColorClass = () => {
                  // Always assign color class, even for locked zones (for animation purposes)
                  switch (zone.zoneNumber) {
                    case 1:
                      return styles.zoneRed;
                    case 2:
                      return styles.zoneOrange;
                    case 3:
                      return styles.zoneYellow;
                    case 4:
                      return styles.zoneGreen;
                    case 5:
                      return styles.zoneBlue;
                    default:
                      return styles.zoneGrey;
                  }
                };

                // Get zone neon color
                const zoneNeonColor = isLocked
                  ? '#d8dff0'
                  : (ZONE_NEON_COLORS[zone.zoneNumber]?.core || '#d8dff0');

                const nextZoneNeonColor = nextZone
                  ? (nextZone.status === 'locked'
                    ? '#d8dff0'
                    : (ZONE_NEON_COLORS[nextZone.zoneNumber]?.core || '#d8dff0'))
                  : '#d8dff0';

                // Get icon for connector small circles
                const getConnectorIcon = () => {
                  if (isLocked || (nextZone && nextZone.status === 'locked')) return '🔒';
                  const icons = ['🎯', '⚡', '🌿', '🛡️', '⭐'];
                  return icons[zone.zoneNumber - 1] || '🎯';
                };

                // Zone 1 should be active by default if unlocked
                const isActive = isCurrent || (!isLocked && zone.zoneNumber === 1);

                // Check if previous zone is complete (for activating next zone)
                const prevZone = index > 0 ? zones[index - 1] : null;
                const prevZoneComplete = prevZone && prevZone.completionPercentage === 100;

                // Zone 2+ becomes active when previous zone completes (100% progress)
                const isActivatedByProgress = !isLocked && zone.zoneNumber > 1 && prevZoneComplete;

                return (
                  <React.Fragment key={zone.id}>
                    {/* Zone */}
                    {!isLocked ? (
                      <Link
                        href={`/student/zone/${zone.id}`}
                        className={`${styles.zone} ${getColorClass()} ${isCurrent ? styles.zoneCurrent : ''
                          } ${isActive || isActivatedByProgress ? styles.zoneActive : ''}`}
                        style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
                      >
                        {/* Big zone circle */}
                        <div className={styles.zoneCircle}>
                          <span className={styles.zoneLabelTop}>
                            ZONE {zone.zoneNumber}
                          </span>
                          <span className={styles.zoneName}>
                            {zone.title.toUpperCase()}
                          </span>
                          <span className={styles.zoneDays}>{zone.subtitle}</span>
                        </div>

                        {/* Badge below big circle */}
                        <div className={styles.zoneBadge}>{zoneCode}</div>

                        {/* Current mission button */}
                        {isCurrent && !isLocked && (
                          <button className={styles.currentMissionBtn}>
                            <span className={styles.lockDot} />
                            CURRENT MISSION
                          </button>
                        )}
                      </Link>
                    ) : (
                      <div
                        className={`${styles.zone} ${getColorClass()} ${isCurrent ? styles.zoneCurrent : ''
                          } ${isActive || isActivatedByProgress ? styles.zoneActive : ''}`}
                      >
                        {/* Big zone circle */}
                        <div className={styles.zoneCircle}>
                          <span className={styles.zoneLabelTop}>
                            ZONE {zone.zoneNumber}
                          </span>
                          <span className={styles.zoneName}>
                            {zone.title.toUpperCase()}
                          </span>
                          <span className={styles.zoneDays}>{zone.subtitle}</span>
                        </div>

                        {/* Badge below big circle */}
                        <div className={styles.zoneBadge}>{zoneCode}</div>

                        {/* Current mission button */}
                        {isCurrent && !isLocked && (
                          <button className={styles.currentMissionBtn}>
                            <span className={styles.lockDot} />
                            CURRENT MISSION
                          </button>
                        )}
                      </div>
                    )}

                    {/* Diamond connector between zones */}
                    {!isLast && nextZone && (
                      <div
                        className={styles.zoneConnector}
                        style={{
                          '--light-delay': `${index * 4}s`, /* 4s cycle per zone */
                          '--from-color': zoneNeonColor,
                          '--to-color': nextZoneNeonColor,
                          '--diamond-color': zoneNeonColor, /* Diamond border color */
                          '--progress': zone.completionPercentage ? (zone.completionPercentage / 100) : 0, /* Zone progress (0-1) */
                          '--next-zone-active': (zone.completionPercentage === 100) ? '1' : '0', /* Activate next zone when current reaches 100% */
                        } as React.CSSProperties}
                      >
                        {/* Diamond shape - colored and wider */}
                        <div className={styles.diamondConnector} />

                        {/* Progress line - connects Zone 1 to Zone 2, shows Zone 1 progress */}
                        <div className={styles.diamondProgress} />

                        {/* Running light overlay - travels from Zone 1 to bottom lock */}
                        <div className={styles.diamondLight} />

                        {/* Top small circle - red dot for first, lightning for second, signal tower for third, icon for others */}
                        <div className={styles.smallCircleTop}>
                          {index === 0 ? (
                            <AnimatedRedDot />
                          ) : index === 1 ? (
                            <AnimatedLightning />
                          ) : index === 2 ? (
                            <AnimatedSignalTower />
                          ) : (
                            <span className={styles.smallIcon}>{getConnectorIcon()}</span>
                          )}
                        </div>

                        {/* Bottom small circle with lock - light changes color here */}
                        <div className={styles.smallCircleBottom}>
                          <span className={styles.lockIcon}>🔒</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Overall progress under map */}
            <div className="mt-6 flex flex-col items-start gap-1 text-xs text-slate-500 px-[5vw]">
              <span>Overall Progress</span>
              <div className="h-2 w-full max-w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff5a5a] via-[#ffd15a] to-[#6bff9c]"
                  style={{ width: `${overallProgress * 100}%` }}
                />
              </div>
              <span className="text-[11px]">
                {systemStatus.completedMissions}/{systemStatus.totalMissions}{' '}
                missions completed
              </span>
            </div>
          </div>


        </section>
      </main>
    </div>
  );
}

