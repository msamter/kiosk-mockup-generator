export interface UploadedAsset {
  id: string;
  name: string;
  objectUrl: string;
  width: number;
  height: number;
}

export interface FrameOverride {
  assetId: string;
  objectUrl: string;
  name: string;
  fit: 'cover' | 'contain';
}
