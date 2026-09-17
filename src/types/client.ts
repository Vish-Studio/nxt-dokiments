/**
 * The details a user maintains for one of their clients, as captured by
 * `ClientForm`. Every field is always present — the optional ones (`address`,
 * `brn`, `nationalId`) are stored as `""` rather than omitted, so a client
 * record has one consistent shape everywhere it's read.
 */
export type ClientInput = {
  address: string;
  brn: string;
  companyName: string;
  email: string;
  name: string;
  nationalId: string;
  phone: string;
};

export type Client = ClientInput & {
  /** Epoch-ms creation time, parsed from the Firestore `createdAt` timestamp. */
  createdAt: number;
  /** Server-generated Firestore document ID (`client_…`). */
  id: string;
  /** Epoch-ms time of the last edit; equal to `createdAt` until the client is updated. */
  updatedAt: number;
};
