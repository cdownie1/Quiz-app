import {
    TIMEOUT_SECONDS
} from "./config.js";
import {
    async
} from "q";

const timeout = function (seconds) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(
                new Error(`DARN! Request took too long. Timed out after ${seconds}`)
            );
        }, seconds * 1000);
    });
};

export const AJAXCall = async function (url) {
    try {
        const fetchCall = fetch(url);

        const res = await Promise.race([fetchCall, timeout(TIMEOUT_SECONDS)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message}`);

        return data;
    } catch (error) {
        throw error;
    }
}