import banner from './config/banner.js';
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import { ethers } from 'ethers';

// Fake User-Agents
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0'
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function readPrivateKeys() {
    try {
        return fs.readFileSync('private_keys.txt', 'utf8')
            .split('\n')
            .map(key => key.trim())
            .filter(Boolean); // Hapus baris kosong
    } catch (error) {
        console.error(chalk.red(" Error reading private_keys.txt. Make sure the file exists."));
        return [];
    }
}

function getAddressesFromPrivateKeys(privateKeys) {
    return privateKeys.map(pk => {
        try {
            const wallet = new ethers.Wallet(pk);
            return wallet.address;
        } catch (error) {
            console.error(chalk.red(` Invalid private key: ${pk}`));
            return null;
        }
    }).filter(address => address !== null);
}

async function performScan(address) {
    console.log(chalk.yellow(` Scanning address ${address} `));

    await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);

    const url = `https://harpie.io/api/addresses/${address}/queue-health/`;
    const payload = {
        chainId: 1,
        manualScan: true
    };

    try {
        const headers = {
            'User-Agent': getRandomUserAgent(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://harpie.io/',
            'Origin': 'https://harpie.io',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const stats = data.stats || {};
        console.log(chalk.green(` Scan successful for address ${address}`));

        if (stats.percentImmune !== undefined) {
            console.log(chalk.cyan(` Percent Immune: ${stats.percentImmune}%`));
        }
        if (stats.percentVerified !== undefined) {
            console.log(chalk.cyan(` Percent Verified: ${stats.percentVerified}%`));
        }
        if (stats.activityScore !== undefined) {
            console.log(chalk.cyan(` Activity Score: ${stats.activityScore}`));
        }

        const alerts = data.alerts || "{}";
        if (alerts !== "{}") {
            console.log(chalk.yellow(` Alerts: ${JSON.stringify(alerts)}`));
        } else {
            console.log(chalk.green(` No alerts detected.`));
        }
    } catch (error) {
        console.error(chalk.red(` Error scanning address ${address}: ${error.message}`));
    }
}

async function startScanner(addresses, privateKeys) {
    console.log(chalk.yellow(`\n Starting scanner for ${addresses.length} addresses with ${privateKeys.length} accounts...`));

    for (let i = 0; i < addresses.length; i++) {
        const privateKey = privateKeys[i % privateKeys.length]; // Loop key jika jumlah address lebih banyak dari akun
        await performScan(addresses[i], privateKey);
        await delay(Math.floor(Math.random() * (10000 - 2000 + 1)) + 2000);
    }

    console.log(chalk.green("\n All scans completed."));
}

// Fungsi untuk menjalankan scanner setiap 24 jam
async function scheduleScanner() {
    let privateKeys = readPrivateKeys();
    let addresses = getAddressesFromPrivateKeys(privateKeys);

    if (privateKeys.length === 0) {
        console.log(chalk.red(" No private keys found. Please add them in 'private_keys.txt'."));
        return;
    }

    console.log(chalk.green(` Loaded ${privateKeys.length} private keys and extracted ${addresses.length} addresses.`));

    while (true) {
        const now = new Date();
        console.log(chalk.blue(`\n Scanner running at: ${now.toLocaleString()}`));

        await startScanner(addresses, privateKeys);

        // Hitung waktu untuk menjalankan ulang dalam 24 jam
        const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        console.log(chalk.magenta(`\n Next scan scheduled at: ${nextRun.toLocaleString()}`));

        await delay(24 * 60 * 60 * 1000); // Tunggu 24 jam sebelum scan berikutnya
    }
}

// Mulai scanner dengan jadwal otomatis 24 jam
scheduleScanner();
