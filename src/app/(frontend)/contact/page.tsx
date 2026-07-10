import { redirect } from 'next/navigation'

/**
 * Contact is a popup modal now, not a page — old links land here and get
 * bounced home where the ContactModalProvider sees ?contact=open and opens it.
 */
export default function ContactPage() {
  redirect('/?contact=open')
}
