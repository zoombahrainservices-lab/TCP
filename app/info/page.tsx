import { redirect } from 'next/navigation'

/** Legacy URL: all content lives on `/about`. */
export default function InfoRedirectPage() {
  redirect('/about')
}
