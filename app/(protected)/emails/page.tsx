"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Send } from "lucide-react";
import { emailTemplates } from "@/lib/templates";
import { render } from "@react-email/render";
import { PARTICIPANT_STATUSES } from "@/lib/participant-status";

type RecipientType = "all" | "status" | "specific";

function EmailPreviewTab() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    emailTemplates[0]?.id || ""
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedTemplateId === template.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="font-medium">{template.name}</div>
                <div
                  className={`text-xs ${
                    selectedTemplateId === template.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {template.description}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {EmailComponent ? (
              <div
                className="bg-white p-6 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 240px)" }}
              >
                <div
                  className="mx-auto"
                  style={{ maxWidth: "650px" }}
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
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
  );
}

function SendEmailsTab() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [specificEmails, setSpecificEmails] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSendEmails = async () => {
    if (!selectedTemplateId) {
      setStatusMessage({ type: "error", text: "Please select a template." });
      return;
    }

    if (recipientType === "status" && !selectedStatus) {
      setStatusMessage({
        type: "error",
        text: "Please select a participant status.",
      });
      return;
    }

    if (recipientType === "specific" && !specificEmails.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter at least one email address.",
      });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          recipientType,
          status: recipientType === "status" ? selectedStatus : undefined,
          specificEmails:
            recipientType === "specific"
              ? specificEmails
                  .split(",")
                  .map((e) => e.trim())
                  .filter(Boolean)
              : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage({
          type: "success",
          text: data.message || "Emails sent successfully!",
        });
        if (recipientType === "specific") {
          setSpecificEmails("");
        }
      } else {
        const data = await response.json();
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to send emails.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "An error occurred while sending emails.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-3">
        <Label htmlFor="template">Template</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={setSelectedTemplateId}
        >
          <SelectTrigger id="template">
            <SelectValue placeholder="Choose a template to send" />
          </SelectTrigger>
          <SelectContent>
            {emailTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Choose recipients</Label>
        <RadioGroup
          value={recipientType}
          onValueChange={(value: string) =>
            setRecipientType(value as RecipientType)
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="font-normal cursor-pointer">
              All participants
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="status" id="status" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="status" className="font-normal cursor-pointer">
                Participants with status
              </Label>
              {recipientType === "status" && (
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPANT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) +
                          status.slice(1).toLowerCase().replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="specific" id="specific" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="specific" className="font-normal cursor-pointer">
                Specific emails
              </Label>
              {recipientType === "specific" && (
                <Input
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                  value={specificEmails}
                  onChange={(e) => setSpecificEmails(e.target.value)}
                  className="w-full"
                />
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-lg ${
            statusMessage.type === "success"
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <Button
        onClick={handleSendEmails}
        disabled={isSending || !selectedTemplateId}
        className="w-full"
        size="lg"
      >
        {isSending ? "Sending..." : "Send emails"}
      </Button>
    </div>
  );
}

export default function EmailsPage() {
  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Email Center</h1>
          <p className="text-muted-foreground">
            Manage and send emails to your participants.
          </p>
        </div>

        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="size-4" />
              Send
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <EmailPreviewTab />
          </TabsContent>
          <TabsContent value="send" className="mt-4">
            <SendEmailsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
