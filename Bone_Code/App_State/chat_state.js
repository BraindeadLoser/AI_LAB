import {
    createConversation,
    getAllConversations
} from "../js/conversations.js";

const allConvs =
    getAllConversations();

let currentConversation;

if (allConvs.length > 0) {
    currentConversation =
        allConvs[0];
} else {
    currentConversation =
        createConversation();
}

let messages =
    currentConversation.messages;

let messageSeq = 0;

let userColor =
    document.getElementById(
        "userColor"
    ).value;

let aiColor =
    document.getElementById(
        "aiColor"
    ).value;

let bgColor =
    document.getElementById(
        "bgColor"
    ).value;

export function getChatState() {
    return {
        currentConversation,
        messages,
        messageSeq,
        userColor,
        aiColor,
        bgColor
    };
}

export function setCurrentConversation(
    conv
) {
    currentConversation =
        conv;
}

export function setMessages(
    newMessages
) {
    messages =
        newMessages;
}

export function setMessageSeq(
    seq
) {
    messageSeq =
        seq;
}

export function setUserColor(
    color
) {
    userColor =
        color;
}

export function setAIColor(
    color
) {
    aiColor =
        color;
}

export function setBgColor(
    color
) {
    bgColor =
        color;
}