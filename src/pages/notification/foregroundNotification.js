import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase.messaging";

export const listenForForegroundMessages = () => {
    onMessage(messaging, (payload) => {
        console.log(`New Message: ${payload.notification.title}`);
    });
};