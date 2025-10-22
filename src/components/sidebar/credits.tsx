// src/components/sidebar/credits.tsx

import { getUserCredits } from "~/actions/users";
import { CreditsDisplay } from "~/components/sidebar/credits-display";

export default async function Credits() {
  const credits = await getUserCredits();
  return <CreditsDisplay credits={credits} />;
}
