import type { Coordinate } from '../types';

export const loadMapData = async (directoryHandle: FileSystemDirectoryHandle): Promise<Coordinate[]> => {
    const mapData: Coordinate[] = [];
    const regex = new RegExp(/map_(\d+)_(\d+).bin/);

    try {
        // Get the 'map' subdirectory handle
        const mapDirectoryHandle = await directoryHandle.getDirectoryHandle('map');
        
        // Iterate through files in the map subdirectory
        for await (const fileName of mapDirectoryHandle.keys()) {
            const match = regex.exec(fileName);

            if (match) {
                const [_, x, y] = match;
                mapData.push({ x: parseInt(x), y: parseInt(y) });
            }
        }
    } catch (error) {
        console.error('Error accessing map subdirectory:', error);
        // You might want to handle this error differently depending on your needs
    }

    return mapData;
};