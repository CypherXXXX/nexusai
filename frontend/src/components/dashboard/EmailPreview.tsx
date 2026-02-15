"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea"; // We'll create this next
import { Pencil, Send, Save, X } from "lucide-react";
import { useState } from "react";

interface EmailPreviewProps {
    subject?: string;
    body?: string;
    isEditable?: boolean;
    onSave?: (subject: string, body: string) => void;
}

export function EmailPreview({ subject = "", body = "", isEditable = false, onSave }: EmailPreviewProps) {
    const [editing, setEditing] = useState(false);
    const [editSubject, setEditSubject] = useState(subject);
    const [editBody, setEditBody] = useState(body);

    const handleSave = () => {
        if (onSave) onSave(editSubject, editBody);
        setEditing(false);
    };

    const handleCancel = () => {
        setEditSubject(subject);
        setEditBody(body);
        setEditing(false);
    };

    if (!subject && !body && !editing) {
        return (
            <div className="text-center text-neutral-500 py-8 italic border border-dashed border-neutral-800 rounded-lg">
                No email draft generated yet.
            </div>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                    Email Draft
                </CardTitle>
                {isEditable && !editing && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-8">
                        <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                )}
                {editing && (
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
                            <X className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 text-emerald-500">
                            <Save className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                {editing ? (
                    <div className="space-y-4">
                        <Input
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            placeholder="Subject line..."
                            className="font-medium bg-neutral-900 border-neutral-800"
                        />
                        <Textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            placeholder="Email body..."
                            className="min-h-[200px] font-sans text-sm bg-neutral-900 border-neutral-800"
                        />
                    </div>
                ) : (
                    <div className="bg-neutral-900/50 rounded-lg border border-neutral-800 p-4 space-y-4">
                        <div className="border-b border-neutral-800 pb-2">
                            <span className="text-neutral-500 text-xs uppercase font-bold mr-2">Subject:</span>
                            <span className="font-medium text-white">{subject}</span>
                        </div>
                        <div className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {body}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
