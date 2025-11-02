export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendPushToToken(token: string, payload: PushPayload) {
  const { messaging } = await import("./firebase-admin");

  try {
    const id = await messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: (payload.data && payload.data.url) || "/dashboard",
        action: payload.data?.action || "default",
        ...payload.data, // merge any other data
      },
      webpush: {
        notification: {
          icon: "/favicon.ico",
        },
        fcmOptions: {
          link: (payload.data && payload.data.url) || "/dashboard",
        },
      },
    });

    return !!id;
  } catch (err) {
    console.error("[FCM] Admin send failed:", err);
    return false;
  }
}


export async function sendPushToTopic(topic: string, payload: PushPayload) {
  const { messaging } = await import("./firebase-admin");
  try {
    const id = await messaging.send({
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data ?? {},
      webpush: {
        notification: {
          icon: "/favicon.ico",
        },
        fcmOptions: {
          link: (payload.data && payload.data.url) || "/dashboard",
        },
      },
    });
    return !!id;
  } catch (err) {
    console.error("[FCM] send to topic failed:", err);
    return false;
  }
}

export async function subscribeTokenToTopic(token: string, topic: string) {
  const { messaging } = await import("./firebase-admin");
  try {
    const res = await messaging.subscribeToTopic([token], topic);
    return res.successCount > 0;
  } catch (err) {
    console.error("[FCM] subscribe failed:", err);
    return false;
  }
}

export async function unsubscribeTokenFromTopic(token: string, topic: string) {
  const { messaging } = await import("./firebase-admin");
  try {
    const res = await messaging.unsubscribeFromTopic([token], topic);
    return res.successCount > 0;
  } catch (err) {
    console.error("[FCM] unsubscribe failed:", err);
    return false;
  }
}