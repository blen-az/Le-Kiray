// Firebase exports
export { auth, db, storage } from './firebase';
export type { User } from 'firebase/auth';

// Cloudinary exports
export {
 cloudinaryConfig,
 uploadToCloudinary as uploadImage,
 getCloudinaryUrl,
} from './cloudinary';
export type { CloudinaryUploadResult } from './cloudinary';
