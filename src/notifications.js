// @flow
import { entries, intoObject } from "./utils";
import {test, expect, is, debug} from "@benchristel/taste"

const tendToSend: Params = {
    channelMuted: false,
    threading: unthreaded(),
    doNotDisturb: false,
    doNotDisturbOverridden: true,
    broadcast: true,
    suppressBroadcast: false,
    channelNotificationPreference: "everything",
    threadsEverything: true,
    atMention: true,
    commentOnFileOwnedByUser: true,
}

const tendNotToSend: Params = {
    channelMuted: true,
    threading: {type: "Threaded", subscribed: false},
    doNotDisturb: true,
    doNotDisturbOverridden: false,
    broadcast: false,
    suppressBroadcast: true,
    channelNotificationPreference: "nothing",
    threadsEverything: false,
    atMention: false,
    commentOnFileOwnedByUser: false,
}

type Scenario = {|
    expectToSend: boolean,
    input: $Shape<Params>,
|}

const tests: {[string]: Scenario} = {
    "doesn't send if the channel is muted and the message is not in a thread": {
        expectToSend: false,
        input: {
            channelMuted: true,
            threading: unthreaded(),
        },
    },
    "sends a notification": {
        expectToSend: true,
        input: tendToSend,
    },
    "does NOT send a notification": {
        expectToSend: false,
        input: tendNotToSend,
    },
    "sends a notification when the channel is muted but the user is subscribed to the thread": {
        expectToSend: true,
        input: {
            channelMuted: true,
            threading: {type: "Threaded", subscribed: true},
            doNotDisturb: false,
            channelNotificationPreference: "everything",
        },
    },
    "does not send a notification when the sender wishes not to be obnoxious": {
        expectToSend: false,
        input: {
            doNotDisturb: true,
            doNotDisturbOverridden: false,
        },
    },
    "sends a notification when the sender wishes to be obnoxious": {
        expectToSend: true,
        input: {
            channelMuted: false,
            doNotDisturb: true,
            doNotDisturbOverridden: true,
            channelNotificationPreference: "everything",
        }
    },
    "sender cannot override a muted channel": {
        expectToSend: false,
        input: {
            channelMuted: true,
            doNotDisturbOverridden: true,
            doNotDisturb: true,
        }
    },
    "suppressed broadcast": {
        expectToSend: false,
        input:{
            suppressBroadcast: true,
        }
    },
    "broadcast when user wants no notifications for the channel": {
        expectToSend: false,
        input: {
            broadcast: true,
            channelNotificationPreference: "nothing",
        }
    },
    "subscribed thread with threads_everything on and channel notifications off": {
        expectToSend: false,
        input: {
            threading: {type: "Threaded", subscribed: true},
            threadsEverything: true,
            channelNotificationPreference: "nothing",
        }
    },
    "subscribed thread with threads_everything on when the user only wants mentions": {
        expectToSend: true,
        input: {
            threading: {type: "Threaded", subscribed: true},
            threadsEverything: true,
            doNotDisturb: false,
            channelNotificationPreference: "mentions",
        }
    },
    "subscribed thread with threads_everything off when the user only wants mentions": {
        expectToSend: false,
        input: {
            threading: {type: "Threaded", subscribed: true},
            threadsEverything: false,
            doNotDisturb: false,
            channelNotificationPreference: "mentions",
            atMention: false,
            commentOnFileOwnedByUser: false,
        }
    },
    "@mention when the user only wants mentions": {
        expectToSend: true,
        input: {
            doNotDisturb: false,
            channelNotificationPreference: "mentions",
            channelMuted: false,
            atMention: true,
        }
    },
}

test("notifications:", entries(tests)
    .map(scenarioToTasteTest)
    .reduce(intoObject, {}),
)

function scenarioToTasteTest([title, scenario]: [string, Scenario]) {
    return [title, () => {
        expect(shouldSend({
            ...(scenario.expectToSend ? tendNotToSend : tendToSend),
            ...scenario.input,
        }), is, scenario.expectToSend)
    }]
}

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
    channelNotificationPreference: "everything" | "nothing" | "mentions",
    threadsEverything: boolean,
    atMention: boolean,
    commentOnFileOwnedByUser: boolean,
|}

function shouldSend(params: Params): boolean {
    if (false
        || (params.broadcast && params.suppressBroadcast)
        || (params.doNotDisturb && !params.doNotDisturbOverridden)
        || (params.channelMuted && !params.threading.subscribed)
        || (!params.threadsEverything && params.channelNotificationPreference === "mentions") && !params.atMention
    ) return false

    return params.channelNotificationPreference !== "nothing"
}
