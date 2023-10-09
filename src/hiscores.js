import axios from 'axios';
import {JSDOM} from 'jsdom';
import {stats} from './keys.js';

export async function getGroupUsernames(groupName) {
    let responseHtml = await JSDOM.fromURL(
        `https://secure.runescape.com/m=hiscore_oldschool_ironman/a=135/group-ironman/view-group?name=${groupName}`
    );
    const gimUsernames = responseHtml.window.document.querySelectorAll('.uc-scroll__link');
    const usernames = [...gimUsernames].map((username) => 
        username.textContent).map((username) =>
        username.replace(/\s/g, ' ')
);
    return usernames;
}

export async function getUserStats(username) {
    let response = await axios
        .get(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${username}`)
        .catch(() => {throw new Error('Invalid username.');});
    let obj = toStatsObject(await response.data.split(/\n/));
    return obj;
}

export function toStatsObject(rawData) {
    // Turn raw CSV data to a usable JSON structure
    let userData = {};
    for (let i = 0; i < stats.length; i++) {
        const currRow = rawData[i].split(/,/);
        if (currRow.length === 3) {
            // Skills
            userData[stats[i]] = {
                rank: currRow[0],
                level: currRow[1],
                experience: currRow[2],
            };
        } else if (currRow.length === 2) {
            // Minigames and bosses
            userData[stats[i]] = {
                rank: currRow[0],
                score: currRow[1],
            };
        }
    }
    return userData;
}
