/**
 * The reader's page on Final plays one sign-up on a loop: a reader types an email, presses the button, gets the
 * book – and the author gets a subscriber. A pure "time → frame" function, like the landing demos.
 */
export type ReaderFrame = {
  /** What the email field shows so far ("" shows the placeholder). */
  email: string;
  phase: "idle" | "typing" | "sending" | "unlocked";
  /** Which sample reader this loop is. */
  reader: number;
};

export const readers = ["maya@studio.co", "leo.park@gmail.com", "ana@lindhaus.de"];

const IDLE = 1200;
const PER_CHAR = 80;
const SENDING = 600;
const UNLOCKED = 3200;

export function loopLength(email: string): number {
  return IDLE + email.length * PER_CHAR + SENDING + UNLOCKED;
}

export function readerFrame(t: number): ReaderFrame {
  const cycle = readers.reduce((sum, email) => sum + loopLength(email), 0);
  let rest = Math.max(0, t) % cycle;
  for (let loop = 0; ; loop++) {
    const reader = loop % readers.length;
    const email = readers[reader];
    const length = loopLength(email);
    if (rest >= length) {
      rest -= length;
      continue;
    }
    if (rest < IDLE) return { email: "", phase: "idle", reader };
    rest -= IDLE;
    const typed = Math.floor(rest / PER_CHAR);
    if (typed < email.length) return { email: email.slice(0, typed + 1), phase: "typing", reader };
    rest -= email.length * PER_CHAR;
    return { email, phase: rest < SENDING ? "sending" : "unlocked", reader };
  }
}
