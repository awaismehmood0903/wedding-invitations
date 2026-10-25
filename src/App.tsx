import { editionEvent } from './config/edition'
import { FullInvitation } from './editions/FullInvitation'
import { EventInvitation } from './editions/EventInvitation'

/** Picks the edition this build was made for (see src/config/edition.ts). */
export default function App() {
  return editionEvent ? <EventInvitation event={editionEvent} /> : <FullInvitation />
}
