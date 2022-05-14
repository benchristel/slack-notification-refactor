// @flow
import {test, expect, is} from "@benchristel/taste"

const tendToSend = {
    channelMuted: false,
    threading: unthreaded(),
    doNotDisturb: false,
    doNotDisturbOverridden: true,
    broadcast: true,
    suppressBroadcast: false,
    channelNotificationPreference: "everything",
}

const tendNotToSend = {
    channelMuted: true,
    threading: {type: "Threaded", subscribed: false},
    doNotDisturb: true,
    doNotDisturbOverridden: false,
    broadcast: false,
    suppressBroadcast: true,
    channelNotificationPreference: "nothing",
}

test("notifications:", {
    "returns false if the channel is muted and the message is not in a thread"() {
        expect(shouldSend({
            ...tendToSend,
            channelMuted: true,
            threading: unthreaded(),
        }), is, false)
    },

    "sends a notification"() {
        expect(shouldSend(tendToSend), is, true)
    },

    "does not send a notification"() {
        expect(shouldSend(tendNotToSend), is, false)
    },

    "sends a notification when the channel is muted but the user is subscribed to the thread"() {
        expect(shouldSend({
            ...tendNotToSend,
            channelMuted: true,
            threading: {type: "Threaded", subscribed: true},
            doNotDisturb: false,
            channelNotificationPreference: "everything",
        }), is, true)
    },

    "does not send a notification when the sender wishes not to be obnoxious"() {
        expect(shouldSend({
            ...tendToSend,
            doNotDisturb: true,
            doNotDisturbOverridden: false,
        }), is, false)
    },

    "sends a notification when the sender wishes to be obnoxious"() {
        expect(shouldSend({
            ...tendNotToSend,
            channelMuted: false,
            doNotDisturb: true,
            doNotDisturbOverridden: true,
            channelNotificationPreference: "everything",
        }), is, true)
    },

    "sender cannot override a muted channel"() {
        expect(shouldSend({
            ...tendToSend,
            channelMuted: true,
            doNotDisturbOverridden: true,
            doNotDisturb: true,
        }), is, false)
    },

    "suppressed broadcast"() {
        expect(shouldSend({
            ...tendToSend,
            suppressBroadcast: true,
        }), is, false)
    },

    "broadcast when user wants no notifications for the channel"() {
        expect(shouldSend({
            ...tendToSend,
            broadcast: true,
            channelNotificationPreference: "nothing",
        }), is, false)
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
    if (false
        || (params.broadcast && params.suppressBroadcast)
        || (params.doNotDisturb && !params.doNotDisturbOverridden)
        || (params.channelMuted && !params.threading.subscribed)
    ) return false

    return params.channelNotificationPreference === "everything"
}
