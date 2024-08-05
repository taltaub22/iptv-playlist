const playwright = require('playwright');
const { parseM3U, writeM3U } = require('@iptv/playlist');
const fs = require('fs')


async function getKesetURL() {
    const URL = 'https://www.mako.co.il/mako-vod-live-tv/VOD-6540b8dcb64fd31006.htm'
    const SEARCH_STRING = 'b-in-range=0-1800'
    const NEW_STRING = 'b-in-range=0-5000'
    
    const browser = await playwright.webkit.launch({
        headless: false // setting this to true will not run the UI
    });

    console.log("Browser opened")

    const page = await browser.newPage();
    await page.goto(URL);

	const liveURL = await page.locator('#videoPlayer_html5_api').getAttribute('src')
	console.log("Found URL in HTML")

	await browser.close();
    console.log("Browser closed")
	
	const HDLiveURL = liveURL.replace(SEARCH_STRING, NEW_STRING)
	
    return HDLiveURL
}

async function buildPlaylist() {
    const PLAYLIST_FILE = './playlist.m3u'
    
    const m3uRaw = fs.readFileSync(PLAYLIST_FILE, 'utf-8')
    const m3u = parseM3U(m3uRaw)
    
    const keshetURL = await getKesetURL()

    m3u.channels.find(x => x.name == 'Keshet 12').url = decodeURIComponent(keshetURL)
    
    console.log("Writing playlist file")
    const newm3u = writeM3U(m3u)
    fs.writeFileSync(PLAYLIST_FILE, newm3u)
    
}

buildPlaylist()