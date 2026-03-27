export interface PhotoItem {
  id: string;
  file?: File;
  preview: string;
  included: boolean;
  exif: {
    latitude: number | null;
    longitude: number | null;
    date: string | null;
  } | null;
  customSceneId?: string;
  width?: number;
  height?: number;
}
