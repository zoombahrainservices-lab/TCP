import { redirect } from 'next/navigation'

// Chapter 2 reuses the Chapter 1 proof UI. Redirect on the server so we never
// mount a client component here—avoids hook count / useMemo race on fast nav (techniques → resolution).
export default function Chapter2ProofPage() {
  redirect('/chapter/1/proof')
}
