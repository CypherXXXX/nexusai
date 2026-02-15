"use client";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";

export function CreateLeadModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { mutate } = useSWRConfig();
    const [formData, setFormData] = useState({
        company_name: "",
        company_website: "",
        contact_name: "",
        contact_email: "",
        contact_title: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/leads", formData);
            setOpen(false);
            setFormData({
                company_name: "",
                company_website: "",
                contact_name: "",
                contact_email: "",
                contact_title: "",
            });
            mutate((key: string) => key.startsWith("/api/leads")); // Refresh leads list
        } catch (error) {
            console.error("Failed to create lead", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="premium">
                    <Plus className="mr-2 h-4 w-4" /> New Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                    <DialogDescription>
                        Manually add a prospect to your pipeline.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="company_name" className="text-sm font-medium text-white">
                            Company Name
                        </label>
                        <Input
                            id="company_name"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="company_website" className="text-sm font-medium text-white">
                            Website
                        </label>
                        <Input
                            id="company_website"
                            name="company_website"
                            value={formData.company_website}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="contact_name" className="text-sm font-medium text-white">
                                Contact Name
                            </label>
                            <Input
                                id="contact_name"
                                name="contact_name"
                                value={formData.contact_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="contact_title" className="text-sm font-medium text-white">
                                Job Title
                            </label>
                            <Input
                                id="contact_title"
                                name="contact_title"
                                value={formData.contact_title}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="contact_email" className="text-sm font-medium text-white">
                            Email
                        </label>
                        <Input
                            id="contact_email"
                            name="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={handleChange}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} variant="premium">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Lead
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
