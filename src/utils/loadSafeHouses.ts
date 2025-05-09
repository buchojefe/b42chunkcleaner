import type { SafeHouse } from '../types';
import { BinaryReader } from './BinaryReader';

const loadFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (result instanceof ArrayBuffer) {
                resolve(result);
            }
            reject(new Error('Invalid return type!'));
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};

export const loadSafeHouses = async (directoryHandle: FileSystemDirectoryHandle): Promise<SafeHouse[]> => {
    const safeHouses: SafeHouse[] = [];

    const fileHandle = await directoryHandle.getFileHandle('map_meta.bin');
    const file = await fileHandle.getFile();
    const arrayBuffer = await loadFileAsArrayBuffer(file);

    const reader = new BinaryReader(arrayBuffer);

    reader.mark();

    const fileType = reader.readString(4);

    let version = 0;
    if (fileType === 'META') {
        version = reader.readInt32();
    } else {
        version = 33;
        reader.reset();
    }

    if (version < 194) {
        throw new Error(`File version ${version} not supported!`);
    }

    const minX = reader.readInt32();
    const minY = reader.readInt32();
    const maxX = reader.readInt32();
    const maxY = reader.readInt32();

    // Skip room and building definitions
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            // Read rooms
            const roomDefCount = reader.readInt32();
            for (let i = 0; i < roomDefCount; i++) {
                reader.skipBytes(8); // metaID (long)
                reader.skipBytes(2); // flags (short)
            }

            // Read buildings
            const buildingDefCount = reader.readInt32();
            for (let i = 0; i < buildingDefCount; i++) {
                reader.skipBytes(8); // metaID (long)
                reader.skipBytes(1); // bAlarmed (byte)
                reader.skipBytes(4); // keyId (int)
                reader.skipBytes(1); // seen (byte)
                reader.skipBytes(1); // hasBeenVisited (byte)
                reader.skipBytes(4); // lootRespawnHour (int)
                reader.skipBytes(4); // bAlarmDecay (int)
            }
        }
    }

    // Read safehouses
    const safeHouseCount = reader.readInt32();
    for (let i = 0; i < safeHouseCount; i++) {
        const x = reader.readInt32();
        const y = reader.readInt32();
        const w = reader.readInt32();
        const h = reader.readInt32();
        const owner = reader.readString();
        
        // New in version 216+
        if (version >= 216) {
            reader.skipBytes(4); // hitPoints (int)
        }
        
        const playerCount = reader.readInt32();
        const players: string[] = [];
        for (let j = 0; j < playerCount; j++) {
            const player = reader.readString();
            players.push(player);
        }
        
        reader.skipBytes(8); // lastVisited (long)
        let title = reader.readString();
        
        // New in version 223+
        if (version >= 223) {
            reader.skipBytes(8); // datetimeCreated (long)
            reader.skipBytes(reader.readInt16()); // location (string)
        }

        // Player respawns
        const playerRespawnCount = reader.readInt32();
        for (let j = 0; j < playerRespawnCount; j++) {
            reader.readString(); // player name
        }

        safeHouses.push({
            region: [
                { x: Math.floor(x / 8), y: Math.floor(y / 8) },
                { x: Math.ceil((x + w) / 8), y: Math.ceil((y + h) / 8) }
            ],
            owner,
            players,
            title
        });
    }

    return safeHouses;
};