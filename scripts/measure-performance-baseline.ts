/**
 * Performance baseline measurement script.
 * Run this before and after performance changes to validate improvements.
 * 
 * Usage:
 *   node --loader ts-node/esm scripts/measure-performance-baseline.ts
 * 
 * Or manually test these routes and record metrics.
 */

console.log('='.repeat(80))
console.log('TCP PLATFORM - PERFORMANCE BASELINE MEASUREMENT')
console.log('='.repeat(80))
console.log()

console.log('CRITICAL ROUTES TO MEASURE:')
console.log('─'.repeat(80))
console.log()

const routes = [
  {
    name: 'Landing Page',
    url: '/',
    focus: 'LCP (hero image), FCP, bundle size, animation cost',
  },
  {
    name: 'Dashboard',
    url: '/dashboard',
    focus: 'TTFB, data loading, auth resolution',
  },
  {
    name: 'Reading Hub',
    url: '/read',
    focus: 'chapter list loading, image prefetch',
  },
  {
    name: 'Chapter 1 - Reading',
    url: '/read/stage-star-silent-struggles',
    focus: 'route transition, image delivery, shell hydration',
  },
  {
    name: 'Chapter 1 - Self-Check',
    url: '/read/stage-star-silent-struggles/assessment',
    focus: 'post-mount copy fetch, assessment rendering',
  },
  {
    name: 'Chapter 1 - Framework',
    url: '/read/stage-star-silent-struggles/framework',
    focus: 'framework strip, page navigation, image-heavy content',
  },
  {
    name: 'Chapter 1 - Resolution',
    url: '/chapter/1/proof',
    focus: 'client-side complexity, media recording setup',
  },
  {
    name: 'Chapter 2 - Reading',
    url: '/read/genius-who-couldnt-speak',
    focus: 'multi-chapter consistency, cache behavior',
  },
  {
    name: 'Chapter 2 - Framework',
    url: '/read/genius-who-couldnt-speak/framework',
    focus: 'long framework navigation (VOICE vs SPARK)',
  },
  {
    name: 'Map',
    url: '/map',
    focus: 'aggregation queries, many markers',
  },
]

routes.forEach((route, i) => {
  console.log(`${i + 1}. ${route.name}`)
  console.log(`   URL: ${route.url}`)
  console.log(`   Focus: ${route.focus}`)
  console.log()
})

console.log('METRICS TO RECORD:')
console.log('─'.repeat(80))
console.log()
console.log('Web Vitals (Chrome DevTools / Lighthouse):')
console.log('  • TTFB (Time to First Byte)')
console.log('  • FCP (First Contentful Paint)')
console.log('  • LCP (Largest Contentful Paint)')
console.log('  • INP (Interaction to Next Paint)')
console.log('  • CLS (Cumulative Layout Shift)')
console.log('  • Lighthouse Performance Score')
console.log()
console.log('Network:')
console.log('  • Total request count')
console.log('  • Image payload (MB)')
console.log('  • JS bundle size (KB)')
console.log('  • Supabase auth.getUser() call count')
console.log('  • Duplicate content requests')
console.log()
console.log('Route Transitions (measure manually):')
console.log('  • Dashboard → Reading entry')
console.log('  • Reading → Self-Check')
console.log('  • Self-Check → Framework')
console.log('  • Framework → Techniques')
console.log('  • Techniques → Resolution')
console.log('  • Resolution → Follow-Through')
console.log()

console.log('HOW TO MEASURE:')
console.log('─'.repeat(80))
console.log()
console.log('1. Lighthouse (Chrome DevTools):')
console.log('   • Open DevTools → Lighthouse tab')
console.log('   • Select "Mobile" + "Performance"')
console.log('   • Run on each critical route')
console.log('   • Record score + core vitals')
console.log()
console.log('2. Network waterfall (Chrome DevTools):')
console.log('   • Open DevTools → Network tab')
console.log('   • Navigate through chapter flow')
console.log('   • Filter by "Fetch/XHR" to see Supabase calls')
console.log('   • Count duplicate auth.getUser() requests')
console.log('   • Check for duplicate content fetches')
console.log()
console.log('3. Bundle size (Chrome DevTools):')
console.log('   • Open DevTools → Coverage tab')
console.log('   • Record total JS bytes for each route')
console.log('   • Note unused code percentage')
console.log()
console.log('4. Perceived transition speed (stopwatch):')
console.log('   • Click "Continue" at end of Reading')
console.log('   • Measure time until Self-Check is interactive')
console.log('   • Repeat for all section transitions')
console.log()

console.log('BASELINE RECORDING TEMPLATE:')
console.log('─'.repeat(80))
console.log()
console.log('Date: _______________')
console.log('Git commit: _______________')
console.log('Branch: _______________')
console.log()
console.log('Route: _______________')
console.log('  TTFB: _______ ms')
console.log('  FCP: _______ ms')
console.log('  LCP: _______ ms')
console.log('  INP: _______ ms')
console.log('  CLS: _______')
console.log('  Lighthouse: _______ / 100')
console.log('  Image payload: _______ MB')
console.log('  JS bundle: _______ KB')
console.log('  Supabase auth calls: _______')
console.log()

console.log('='.repeat(80))
console.log('READY TO MEASURE')
console.log('Open your browser, run the dev server, and record metrics for each route.')
console.log('Save results in: scripts/baseline-results.txt')
console.log('='.repeat(80))
