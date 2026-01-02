import * as fs from 'fs';
import * as path from 'path';

export interface Config {
    api_key: string;
    secret: string;
}

export function initConfig(): void {
    const dataDir = path.join(process.cwd(), 'data');
    const configPath = path.join(dataDir, 'config.json');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create config.json if it doesn't exist
    if (!fs.existsSync(configPath)) {
        const defaultConfig: Config = {
            api_key: '',
            secret: ''
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
}

export function getConfig(): Config {
    const dataDir = path.join(process.cwd(), 'data');
    const configPath = path.join(dataDir, 'config.json');

    try {
        const data = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Return empty config if file doesn't exist or is invalid
        return {
            api_key: '',
            secret: ''
        };
    }
}

export function hasValidConfig(): boolean {
    const config = getConfig();
    return config.api_key !== '' && config.secret !== '';
}
