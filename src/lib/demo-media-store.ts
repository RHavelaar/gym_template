export type GymAsset = {
  name: string;
  displayName: string;
  path: string;
  url: string;
  folder: string;
  createdAt: string | null;
  size: number | null;
};

const demoAssets: GymAsset[] = [];

export const listDemoAssets = (search?: string): GymAsset[] => {
  const query = search?.trim().toLowerCase();
  if (!query) return [...demoAssets];
  return demoAssets.filter(
    (asset) =>
      asset.displayName.includes(query) || asset.name.toLowerCase().includes(query) || asset.folder.includes(query),
  );
};

export const addDemoAsset = (asset: GymAsset) => {
  demoAssets.unshift(asset);
};

export const renameDemoAssetByUrl = (url: string, displayName: string, ext: string): GymAsset | null => {
  const asset = demoAssets.find((entry) => entry.url === url);
  if (!asset) return null;
  asset.displayName = displayName;
  asset.name = `${displayName}.${ext}`;
  return asset;
};
