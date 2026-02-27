import { error } from 'console';
import React, { useEffect, useState } from 'react'
import { maxSize, set } from 'zod';

interface ImageUpLoadProps {
    value: string;
    onChange: (base64: string) => void;
    disabled?: boolean;
}

const ImageUpLoad = ({ value, onChange, disabled }: ImageUpLoadProps) => {
    const [preview, setPreview] = useState<string | null>()

    useEffect(() => {
        if (value) {
            setPreview(value);
        }
    }, [value]);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error)
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxSize: 4000000,
        maxFiles: 1,
        disabled,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                try {
                    const base64 = await convertToBase64(acceptedFiles[0]);
                    onChange(base64);
                    setPreview(base64);
                } catch (error) {
                    console.error("Error converting file to base64:", error)
                }
            }
        },
    });
    return 
};

export default ImageUpLoad;