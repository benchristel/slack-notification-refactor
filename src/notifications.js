// @flow
import {test, expect, is} from "@benchristel/taste"

test("notifications:", {
    "returns false if the channel is muted and the message is not in a thread"() {
        expect(shouldSend({
            channelMuted: true,
            threading: unthreaded(),
            doNotDisturb: false,
            doNotDisturbOverridden: false,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, false)
    },

    "sends a notification"() {
        expect(shouldSend({
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturb: false,
            doNotDisturbOverridden: false,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, true)
    },

    "sends a notification when the channel is muted but the user is subscribed to the thread"() {
        expect(shouldSend({
            channelMuted: true,
            threading: {type: "Threaded", subscribed: true},
            doNotDisturb: false,
            doNotDisturbOverridden: false,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, true)
    },

    "does not send a notification when the sender wishes not to be obnoxious"() {
        expect(shouldSend({
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturb: true,
            doNotDisturbOverridden: false,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, false)
    },

    "does not send a notification when the sender wishes not to be obnoxious in a thread"() {
        expect(shouldSend({
            channelMuted: true,
            threading: {type: "Threaded", subscribed: true},
            doNotDisturb: true,
            doNotDisturbOverridden: false,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, false)
    },

    "sends a notification when the sender wishes to be obnoxious"() {
        expect(shouldSend({
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturb: true,
            doNotDisturbOverridden: true,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, true)
    },

    "sender cannot override a muted channel"() {
        expect(shouldSend({
            //
            channelMuted: true,
            threading: unthreaded(),
            doNotDisturbOverridden: true,
            doNotDisturb: true,
            broadcast: false,
            suppressBroadcast: false,
            channelNotificationPreference: "everything",
        }), is, false)
    },

    "suppressed broadcast"() {
        expect(shouldSend({
            broadcast: true,
            suppressBroadcast: true,
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturbOverridden: false,
            doNotDisturb: false,
            channelNotificationPreference: "everything",
        }), is, false)
    },

    "broadcast when user wants no notifications for the channel"() {
        expect(shouldSend({
            broadcast: true,
            channelNotificationPreference: "nothing",
            suppressBroadcast: false,
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturbOverridden: false,
            doNotDisturb: false,
        }), is, false)
    },

    "non-broadcast when broadcasts are suppressed"() {
        expect(shouldSend({
            broadcast: false,
            suppressBroadcast: true,
            channelMuted: false,
            threading: unthreaded(),
            doNotDisturbOverridden: false,
            doNotDisturb: false,
            channelNotificationPreference: "everything",
        }), is, true)
    },
})

type Threading =
    | {type: "Threaded", subscribed: boolean}
    | {type: "Unthreaded", subscribed: false}

function unthreaded() {
    return {type: "Unthreaded", subscribed: false}
}

type Params = {|
    channelMuted: boolean,
    threading: Threading,
    doNotDisturb: boolean,
    doNotDisturbOverridden: boolean,
    broadcast: boolean,
    suppressBroadcast: boolean,
    channelNotificationPreference: "everything" | "nothing",
|}

function shouldSend(params: Params): boolean {
    if (params.channelMuted && !params.threading.subscribed) {
        return false
    }
    if (params.doNotDisturb && !params.doNotDisturbOverridden) {
        return false
    }
    if (params.broadcast && params.suppressBroadcast) {
        return false
    }
    return params.channelNotificationPreference === "everything"
}
