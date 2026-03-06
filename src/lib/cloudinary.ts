// Cloudinary configuration
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dk8e7zkrf',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "le'kiray",
};

/**
 * Upload image(s) to Cloudinary using unsigned upload
 * @param files - File or FileList to upload
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to upload result
 */
export async function uploadToCloudinary(
    files: File | FileList,
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult[]> {
    const fileArray = files instanceof FileList ? Array.from(files) : [files];
    const results: CloudinaryUploadResult[] = [];

    for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('folder', 'lekiray');

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Upload failed:', error);
                throw new Error(error.error?.message || 'Upload failed');
            }

            const result = await response.json();
            console.log('✅ Image uploaded:', result.public_id);
            results.push({
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
                resource_type: result.resource_type,
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    return results;
}

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns The transformed image URL
 */
export function getCloudinaryUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
): string {
    const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString = transformations.join(',');

    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Initialize Cloudinary Upload Widget by loading the script
 */
export async function initCloudinaryWidget(): Promise<void> {
    if ((window as any).cloudinary) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Cloudinary widget script'));
        document.body.appendChild(script);
    });
}

/**
 * Open the Cloudinary Upload Widget
 */
export async function openCloudinaryUploadWidget(
    callback: (error: any, result: any) => void
): Promise<void> {
    if (!(window as any).cloudinary) {
        await initCloudinaryWidget();
    }

    const widget = (window as any).cloudinary.createUploadWidget(
        {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            sources: ['local', 'url', 'camera'],
            multiple: true,
            defaultSource: 'local',
            styles: {
                palette: {
                    window: '#020617',
                    windowBorder: '#1e293b',
                    tabIcon: '#6366f1',
                    menuIcons: '#f1f5f9',
                    textDark: '#020617',
                    textLight: '#f1f5f9',
                    link: '#6366f1',
                    action: '#6366f1',
                    inactiveTabIcon: '#475569',
                    error: '#ef4444',
                    inProgress: '#6366f1',
                    complete: '#10b981',
                    sourceBg: '#0f172a'
                }
            }
        },
        callback
    );

    widget.open();
}

// Types
export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    created_at: string;
    resource_type: string;
}
