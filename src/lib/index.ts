// Firebase exports
export { auth, db, storage } from './firebase';
export type { User } from 'firebase/auth';

// Cloudinary exports
export {
    cloudinaryConfig,
    uploadImage,
    getCloudinaryUrl,
    CLOUDINARY_UPLOAD_URL,
} from './cloudinary';
export type { CloudinaryUploadResult } from './cloudinary';
