import { CloudUpload, FileSpreadsheet, Info, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useAddOutletCSVMutation, useComfirmCSVMutation, useCsvTamplateDemoQuery } from '../../../features/shop/shopApi';

const ALLOWED_EXTENSIONS = ['csv', 'xls', 'xlsx'];

const AdLocationByCSV = ({ onClose }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedBatchId, setUploadedBatchId] = useState('');
    const [isUploadSuccess, setIsUploadSuccess] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [addOutletCSV, { isLoading }] = useAddOutletCSVMutation();
    const { data: csvData, isLoading: csvLoading } = useCsvTamplateDemoQuery();
    const [comfirmCSV, { isLoading: comfirmLoading }] = useComfirmCSVMutation();

    if (csvLoading) {
        return <p>Loading.....</p>
    }

    const handleFile = (file) => {
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            setSelectedFile(null);
            setUploadedBatchId('');
            setIsUploadSuccess(false);
            setPreviewData(null);
            setError('Only CSV, XLS, or XLSX files are allowed.');
            return;
        }

        setError('');
        setSelectedFile(file);
        setUploadedBatchId('');
        setIsUploadSuccess(false);
        setPreviewData(null);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const res = await addOutletCSV(formData).unwrap();
            const errors = res?.data?.errors || [];

            const batchId = res?.data?.batchId
            setPreviewData(res?.data || null);

            if (!batchId) {
                setIsUploadSuccess(false);
                setError(errors?.[0]?.message || 'CSV upload failed. Please try again.');
                return;
            }

            setError('');
            setUploadedBatchId(batchId);
            setIsUploadSuccess(true);
        } catch (error) {
            setIsUploadSuccess(false);
            setUploadedBatchId('');
            setPreviewData(null);
            setError('CSV upload failed. Please try again.');
            console.log(error);
        }
    };

    const handleDownload = () => {
        if (!csvData) return;

        const url = window.URL.createObjectURL(csvData);
        const link = document.createElement("a");
        link.href = url;
        link.download = "location-upload-template.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const comfirmCSVFile = async () => {
        if (!uploadedBatchId) return;

        try {
            await comfirmCSV(uploadedBatchId).unwrap();
            setTimeout(() => {
                onClose();
            }, 400);
        } catch (err) {
            setError('CSV confirmation failed. Please try again.');
            console.log(err)
        }
    };

    const canConfirmCSV = isUploadSuccess && uploadedBatchId && !comfirmLoading;
    const csvErrors = previewData?.errors || [];
    const hasCsvErrors = csvErrors.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="custom-scroll max-h-[92vh] w-full max-w-200 overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex-1 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm text-gray-600 sm:text-base">
                        <div className="flex items-start gap-3">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <p className="leading-relaxed">
                                <span className="font-bold text-gray-700">Note:</span>{' '}
                                You can add your business locations in two ways. Use{' '}
                                <span className="font-bold text-primary">Bulk Upload</span>{' '}
                                to add multiple location at once via a CSV file, or choose the{' '}
                                <span className="font-bold text-primary"> Manual Process</span>{' '}
                                to add each Location individually.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full cursor-pointer p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close CSV upload modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Upload CSV
                    </h3>

                    <button onClick={handleDownload} className='bg-green-100 font-bold text-primary hover:text-[#79be7b] border border-green-300 cursor-pointer transition-all px-2 py-1.5 rounded'>Download Template</button>
                </div>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition sm:min-h-52 ${isDragging
                        ? 'border-primary bg-green-50'
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                        }`}>
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
                        onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                </button>

                {selectedFile && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-gray-700">
                        <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />
                        <p className="min-w-0 truncate font-medium">{selectedFile.name}</p>
                    </div>
                )}

                {error && (
                    <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                )}

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
                                            className="border-t border-gray-100 text-red-600">
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

                <div className='flex items-center justify-between gap-1'>
                    <button
                        type="button"
                        disabled={!selectedFile || isLoading}
                        onClick={handleUpload}
                        className={`mt-5 w-full rounded-full py-2.5 text-base font-semibold transition sm:text-base ${selectedFile
                            ? 'bg-primary text-white hover:bg-secondary cursor-pointer'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}>
                        {isLoading ? "Uploading..." : "Upload"}
                    </button>
                    <button
                        type='button'
                        disabled={!canConfirmCSV}
                        onClick={comfirmCSVFile}
                        className={`mt-5 w-full rounded-full py-2.5 text-base font-semibold transition sm:text-base ${canConfirmCSV
                            ? 'bg-primary text-white hover:bg-secondary cursor-pointer'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}>
                        {comfirmLoading ? "Confirming..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdLocationByCSV;
