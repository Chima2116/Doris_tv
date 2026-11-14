import { redirect } from "next/navigation";

/** The waitlist has been retired. Old links go to account creation. */
export default function WaitlistPage() {
  redirect("/sign-up");
}
