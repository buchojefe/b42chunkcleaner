import type { Coordinate, Region } from '../types';

import { isPointSelected } from './isPointSelected';
import { partition } from './partition';

export const deleteMapData = async (
    directoryHandle: FileSystemDirectoryHandle,
    mapData: Coordinate[],
    region: Region,
    isSelectionInverted: boolean,
    excludedRegions: Region[]
): Promise<[Coordinate[], Promise<void>]> => {
    const [pointsToDelete, pointsToKeep] = partition(mapData, (point) =>
        isPointSelected(point, region, isSelectionInverted, excludedRegions)
    );

    const filesToDelete = pointsToDelete.map(({ x, y }) => `map_${x}_${y}.bin`);

    try {
        const mapSubdirectoryHandle = await directoryHandle.getDirectoryHandle('map');
        const done = Promise.all(
            filesToDelete.map((file) => mapSubdirectoryHandle.removeEntry(file))
        );
        return [pointsToKeep, done];
    } catch (error) {
        console.error("Error al eliminar archivos:", error);
        return [pointsToKeep, Promise.resolve()];
    }
};