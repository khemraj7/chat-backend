import {
  DocumentSnapshot,
  FieldPath,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";
import { db } from "../../config/firebase";

interface StoredMessage {
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
  editedAt?: Timestamp | null;
  deletedAt?: Timestamp | null;
  readBy: Record<string, Timestamp>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string | null;
  createdAt: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  readBy: Record<string, string>;
}

export interface LastSeen {
  chatId: string;
  userId: string;
  lastSeenMessageId: string;
  lastSeenAt: string | null;
}

const memberRef = (chatId: string, userId: string) =>
  db.collection("chats").doc(chatId).collection("members").doc(userId);

const messagesRef = (chatId: string) =>
  db.collection("chats").doc(chatId).collection("messages");

const iso = (ts?: Timestamp | null): string | null =>
  ts ? ts.toDate().toISOString() : null;

const toMessage = (chatId: string, doc: DocumentSnapshot): Message => {
  const data = doc.data() as StoredMessage;

  const readBy: Record<string, string> = {};
  for (const [userId, ts] of Object.entries(data.readBy ?? {})) {
    readBy[userId] = ts.toDate().toISOString();
  }

  return {
    id: doc.id,
    chatId,
    senderId: data.senderId,
    text: data.deletedAt ? null : data.text,
    createdAt: iso(data.createdAt),
    editedAt: iso(data.editedAt),
    deletedAt: iso(data.deletedAt),
    readBy,
  };
};

export const messageRepository = {
  async create(
    chatId: string,
    senderId: string,
    text: string,
  ): Promise<Message> {
    const ref = messagesRef(chatId).doc();
    await ref.set({
      senderId,
      text,
      createdAt: FieldValue.serverTimestamp(),
      readBy: {},
    });
    const snap = await ref.get();
    return toMessage(chatId, snap);
  },

  async list(chatId: string, limit: number): Promise<Message[]> {
    const snap = await messagesRef(chatId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    // Latest N lekar oldest to newest order me return
    return snap.docs.map((doc) => toMessage(chatId, doc)).reverse();
  },

  async getById(chatId: string, messageId: string): Promise<Message | null> {
    const snap = await messagesRef(chatId).doc(messageId).get();
    return snap.exists ? toMessage(chatId, snap) : null;
  },

  async markRead(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<Message | null> {
    const ref = messagesRef(chatId).doc(messageId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;

      const data = snap.data() as StoredMessage;
      if (data.readBy?.[userId]) return; // already read, kuch nahi badlega

      tx.update(
        ref,
        new FieldPath("readBy", userId),
        FieldValue.serverTimestamp(),
      );
    });

    const snap = await ref.get();
    return snap.exists ? toMessage(chatId, snap) : null;
  },

  async setLastSeen(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<LastSeen> {
    const ref = memberRef(chatId, userId);

    await ref.set(
      {
        lastSeenMessageId: messageId,
        lastSeenAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const snap = await ref.get();
    const data = snap.data() as {
      lastSeenMessageId: string;
      lastSeenAt: Timestamp | null;
    };

    return {
      chatId,
      userId,
      lastSeenMessageId: data.lastSeenMessageId,
      lastSeenAt: data.lastSeenAt
        ? data.lastSeenAt.toDate().toISOString()
        : null,
    };
  },

    async edit(chatId: string, messageId: string, text: string): Promise<Message | null> {
    const ref = messagesRef(chatId).doc(messageId);
    await ref.update({ text, editedAt: FieldValue.serverTimestamp() });
    const snap = await ref.get();
    return snap.exists ? toMessage(chatId, snap) : null;
  },

  async softDelete(chatId: string, messageId: string): Promise<Message | null> {
    const ref = messagesRef(chatId).doc(messageId);
    await ref.update({ deletedAt: FieldValue.serverTimestamp() });
    const snap = await ref.get();
    return snap.exists ? toMessage(chatId, snap) : null;
  },
};
