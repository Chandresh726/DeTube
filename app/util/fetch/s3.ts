export const getPresignedUrl = async (fileType: String, id: String) => {
    const urlResponse = await fetch('/api/getPresignedUrl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, fileType }),
    });
    return await urlResponse.json();
}

export const hitPresignedurl = async (presignedUrl: any, file: any) => {
    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });
    return uploadResponse;
}

export const hitVideoPresignedurl = async (presignedUrl: string, file: File, onProgress: (progress: number) => void): Promise<XMLHttpRequest> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr);
            } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error'));

        xhr.send(file);
    });
};