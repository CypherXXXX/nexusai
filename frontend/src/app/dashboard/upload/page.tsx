"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Please upload a valid CSV file.");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/api/upload/csv", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
            setFile(null); // Clear file on success
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Import Data</h2>
                <p className="text-neutral-400">Bulk upload leads via CSV file.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload CSV</CardTitle>
                    <CardDescription>
                        Drag and drop your file here or click to browse.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div
                        className={cn(
                            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-800 bg-neutral-900/50 p-12 text-center transition-colors",
                            dragActive ? "border-yellow-500 bg-yellow-500/10" : "hover:border-neutral-700 hover:bg-neutral-900"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={handleChange}
                        />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="rounded-full bg-neutral-800 p-4 ring-1 ring-neutral-700">
                                <FileSpreadsheet className="h-8 w-8 text-neutral-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-white">
                                    {file ? file.name : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-sm text-neutral-500">CSV files only (max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-md bg-red-900/20 p-3 text-sm text-red-200">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="rounded-md bg-emerald-900/20 p-4 border border-emerald-900/50"
                        >
                            <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
                                <Check className="h-4 w-4" /> Import Successful
                            </div>
                            <div className="text-sm text-emerald-200/80 space-y-1">
                                <p>Created: {result.created_count}</p>
                                <p>Skipped: {result.skipped_count}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            isLoading={uploading}
                            variant="premium"
                            className="w-full sm:w-auto"
                        >
                            {uploading ? "Importing..." : "Start Import"}
                            {!uploading && <Upload className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-sm text-neutral-500 text-center">
                <p>Make sure your CSV has headers: company_name, company_website, contact_name, contact_email</p>
            </div>
        </div>
    );
}
