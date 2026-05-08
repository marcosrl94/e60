import { redirect } from 'next/navigation';

/**
 * Top-level /pillar-iii route is deprecated; the module now lives inside
 * the Disclosure Hub at /disclosure-hub/pillar-iii (its 10 TBLs consume
 * the same datapoint repository + engines as the rest of the hub).
 *
 * Kept here as a permanent server-side redirect so any deep links still
 * work.
 */
export default function PillarIiiRedirect() {
  redirect('/disclosure-hub/pillar-iii');
}
