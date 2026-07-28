import Cookies from 'js-cookie';
import { CheckCircle, CloudUpload, FileSpreadsheet, Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAddLocationUploadCSVEXCLMutation } from '../../../../features/location/locationApi';

const ALLOWED_EXTENSIONS = ['csv', 'xls', 'xlsx'];
const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddLocation = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const [addLocationUploadCSVEXCL, { isLoading: uploadLoading, error: apiError, isSuccess }] = useAddLocationUploadCSVEXCLMutation();

    const handleFile = (file) => {
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            setSelectedFile(null);
            setPreviewData(null);
            setLocalError('Only CSV, XLS, or XLSX files are allowed.');
            return;
        }

        setLocalError('');
        setSelectedFile(file);
        setPreviewData(null);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLocalError('');
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await addLocationUploadCSVEXCL(formData).unwrap();
            const batchId = res?.data?.batchId;

            setPreviewData(res?.data || null);

            if (!batchId) {
                return;
            }
        } catch (err) {
            setPreviewData(null);
            console.error(err);
        }
    };

    const handleDownload = async () => {
        try {
            setTemplateLoading(true);
            const token = Cookies.get('accessToken');
            const res = await fetch(`${BASE_URL}/dashboard/seed_cities/template`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'location-upload-template.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setLocalError('Template download failed. Please try again.');
        } finally {
            setTemplateLoading(false);
        }
    };

    const csvErrors = previewData?.errors || [];
    const hasCsvErrors = csvErrors.length > 0;

    // Resolve a displayable error message from either local or API error
    const displayError =
        localError ||
        (apiError?.data?.message ?? apiError?.error ?? '');

    return (
        <div className="p-4 sm:p-6 max-w-3xl">
            {/* Note Banner */}
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm text-gray-600 sm:text-base">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="leading-relaxed">
                    <span className="font-bold text-gray-700">Note:</span>{' '}
                    You can add your business locations in two ways. Use{' '}
                    <span className="font-bold text-primary">Bulk Upload</span>{' '}
                    to add multiple location at once via a CSV file, or choose the{' '}
                    <span className="font-bold text-primary">Manual Process</span>{' '}
                    to add each Location individually.
                </p>
            </div>

            {/* Title + Download Template */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">Upload CSV</h3>
                <button
                    onClick={handleDownload}
                    disabled={templateLoading}
                    className="bg-green-100 font-bold text-primary hover:text-[#79be7b] border border-green-300 cursor-pointer transition-all px-2 py-1.5 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {templateLoading ? 'Downloading...' : 'Download Template'}
                </button>
            </div>

            {/* Drop Zone */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition sm:min-h-52 ${
                    isDragging
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                }`}
            >
                <CloudUpload className="mb-5 h-10 w-10 text-primary" />
                <span className="text-lg font-semibold text-gray-600">
                    Select a CSV file to upload
                </span>
                <span className="mt-2 text-sm text-gray-400">
                    or drag and drop it here
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </button>

            {/* Selected File */}
            {selectedFile && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-gray-700">
                    <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />
                    <p className="min-w-0 truncate font-medium">{selectedFile.name}</p>
                </div>
            )}

            {/* Error */}
            {displayError && (
                <p className="mt-3 text-sm font-medium text-red-500">{displayError}</p>
            )}

            {/* CSV Error Table */}
            {hasCsvErrors && (
                <div className="mt-5 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 px-4 py-3">
                            <p className="text-sm font-semibold text-gray-500">Total rows</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {previewData?.summary?.totalRows ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-4 py-3">
                            <p className="text-sm font-semibold text-gray-500">Valid rows</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {previewData?.summary?.validRows ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-4 py-3">
                            <p className="text-sm font-semibold text-gray-500">Invalid rows</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                {previewData?.summary?.invalidRows ?? csvErrors.length}
                            </p>
                        </div>
                    </div>

                    {(previewData?.summary?.validRows ?? 0) === 0 && (
                        <p className="px-3 pb-4 text-sm font-medium text-red-500 sm:text-base">
                            No valid rows are available to import.
                        </p>
                    )}

                    <div className="custom-scroll max-h-80 overflow-auto">
                        <table className="w-full min-w-180 text-left text-sm text-gray-700">
                            <thead className="sticky top-0 z-10 bg-red-100 text-base font-bold text-gray-800">
                                <tr>
                                    <th className="px-4 py-3">Row</th>
                                    <th className="px-4 py-3">Field</th>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-4 py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvErrors.map((csvError, index) => (
                                    <tr
                                        key={`${csvError?.rowNumber}-${csvError?.field}-${index}`}
                                        className="border-t border-gray-100 text-red-600"
                                    >
                                        <td className="px-4 py-3">{csvError?.rowNumber}</td>
                                        <td className="px-4 py-3">{csvError?.field}</td>
                                        <td className="px-4 py-3">{csvError?.value}</td>
                                        <td className="px-4 py-3">{csvError?.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center justify-between gap-1">
                <button
                    type="button"
                    disabled={!selectedFile || uploadLoading }
                    onClick={handleUpload}
                    className={`mt-5 w-full rounded-full py-3 text-base font-semibold transition-all flex items-center justify-center gap-2 sm:text-base ${
                        isSuccess
                            ? 'bg-primary text-white cursor-default'
                            : selectedFile
                                ? 'bg-primary text-white hover:bg-secondary cursor-pointer'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {uploadLoading ? (
                        'Uploading...'
                    ) : isSuccess ? (
                        <>
                            <CheckCircle className="h-5 w-5" />
                            Uploaded
                        </>
                    ) : (
                        'Upload'
                    )}
                </button>
            </div>
        </div>
    );
};

export default AddLocation;
