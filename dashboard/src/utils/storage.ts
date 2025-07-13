import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export const getImgSrcFromPath = (refPath: string) => {
    if (!refPath) return Promise.resolve('');

    return getDownloadURL(ref(getStorage(), refPath));
};

export const uploadImageToStorage = async (file: File, path: string): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};
