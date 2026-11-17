import type { Client, ClientInput } from "@/types/client";

const avatarColorClasses = [
  "bg-play-blue",
  "bg-play-teal",
  "bg-play-purple",
  "bg-play-pink",
  "bg-play-amber",
  "bg-golden-harvest",
];

/** A stable pastel avatar tone per client, derived from its ID (same client, same colour everywhere). */
export const getClientAccentClass = (clientId: string) => {
  const characterTotal = Array.from(clientId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return avatarColorClasses[characterTotal % avatarColorClasses.length];
};

const normalise = (value = "") => value.trim().toLowerCase();

/**
 * Finds the saved client a document's recipient details already belong to: same email, or the
 * same company (or contact) name. Used to show a reopened document's client as selected, and to
 * skip the "save this client" prompt when they are already in My Clients.
 */
export const findMatchingClient = (
  clients: Client[],
  details: Partial<ClientInput>,
) => {
  const email = normalise(details.email);
  const name = normalise(details.companyName);

  if (!email && !name) {
    return undefined;
  }

  return clients.find(
    (client) =>
      (email && normalise(client.email) === email) ||
      (name &&
        (normalise(client.companyName) === name ||
          normalise(client.name) === name)),
  );
};
