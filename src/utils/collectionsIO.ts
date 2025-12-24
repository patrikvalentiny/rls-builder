import type { StoredPolicy } from "../types/storedPolicy";

export const exportPolicies = async (policies: StoredPolicy[], filename: string = 'policies') => {
    const data = JSON.stringify(policies, null, 2);

    // Force location file save dialog if supported
    try {
        // @ts-expect-error - showSaveFilePicker is not yet in all TS lib definitions
        if (window.showSaveFilePicker) {
            // @ts-expect-error - showSaveFilePicker is not yet in all TS lib definitions
            const handle = await window.showSaveFilePicker({
                suggestedName: filename + '.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(data);
            await writable.close();
            return;
        }
    } catch (err: unknown) {
        if (err instanceof DOMException && err.name !== 'AbortError') {
            console.error('Failed to save file:', err);
        } else {
            // User cancelled the picker
            return;
        }
    }

    // Fallback for browsers that don't support showSaveFilePicker
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importPolicies = (file: File): Promise<StoredPolicy[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') {
                    throw new Error('Failed to read file');
                }
                
                const parsed = JSON.parse(result);
                
                if (!Array.isArray(parsed)) {
                    throw new Error('Imported file must contain an array of policies');
                }
                
                // Basic validation to ensure items look like StoredPolicy
                const isValid = parsed.every(item => 
                    typeof item === 'object' && 
                    item !== null &&
                    'id' in item &&
                    'name' in item &&
                    'table' in item
                );
                
                if (!isValid) {
                    throw new Error('Invalid policy format in imported file');
                }
                
                resolve(parsed as StoredPolicy[]);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
    });
};
