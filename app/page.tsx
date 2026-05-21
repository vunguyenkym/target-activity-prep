import { redirect } from 'next/navigation';

// The root URL always lands users on the home page. Activity Overview now
// lives at /phase-1/overview alongside the other Phase 1 steps, so this
// redirect is a permanent piece of the IA — anyone deep-linking to / or
// the bare adobetarget.app domain sees the welcome / guided start, not a
// form mid-flow.
export default function RootPage(): never {
  redirect('/home');
}
