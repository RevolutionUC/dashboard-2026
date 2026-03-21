"use client";

import { useState, useEffect } from "react";
import { emailTemplates } from "@/lib/templates";
import { render } from "@react-email/render";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailPreviewPage() {
    const [selectedTemplateId, setSelectedTemplateId] = useState(
        emailTemplates[0]?.id || "custom"
    );
    const [renderedHtml, setRenderedHtml] = useState("");

    const selectedTemplate = emailTemplates.find(
        (t) => t.id === selectedTemplateId
    );

    const EmailComponent = selectedTemplate?.component;

    useEffect(() => {
        if (EmailComponent) {
            const renderEmail = async () => {
                const html = await render(
                    <EmailComponent
                        firstName="Hacker"
                        name="John Hacker"
                        subject="Welcome to RevolutionUC!"
                        body="We're excited to have you join us. RevolutionUC 2026 is going to be amazing!\n\nLooking forward to seeing you there."
                        verificationUrl="https://example.com/verify"
                        yesConfirmationUrl="https://example.com/confirm-yes"
                        noConfirmationUrl="https://example.com/confirm-no"
                        resetToken="abc123"
                    />,
                    { pretty: true }
                );
                setRenderedHtml(html);
            };
            renderEmail();
        }
    }, [EmailComponent]);

    return (
        <main className="p-6 sm:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Email Template Preview</h1>
                <p className="text-sm text-muted-foreground">
                    Preview email templates
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Sidebar - Template Selection */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                            {emailTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplateId(template.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedTemplateId === template.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    <div className="font-medium">{template.name}</div>
                                    <div className={`text-xs ${selectedTemplateId === template.id
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                        }`}>
                                        {template.description}
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Preview Area */}
                <div className="lg:col-span-3">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            {EmailComponent ? (
                                <div
                                    className="bg-white p-6 overflow-y-auto"
                                    style={{ maxHeight: "calc(100vh - 200px)" }}
                                >
                                    <div
                                        className="mx-auto"
                                        style={{ maxWidth: "650px" }}
                                        dangerouslySetInnerHTML={{
                                            __html: renderedHtml,
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No template selected</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
