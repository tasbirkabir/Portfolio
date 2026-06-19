"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = [
  { id: "personal", title: "About You" },
  { id: "professional", title: "Background" },
  { id: "goals", title: "Project Goals" },
  { id: "design", title: "Design" },
  { id: "budget", title: "Budget" },
  { id: "requirements", title: "Details" },
];

interface FormData {
  name: string;
  email: string;
  company: string;
  profession: string;
  experience: string;
  industry: string;
  primaryGoal: string;
  targetAudience: string;
  contentTypes: string[];
  colorPreference: string;
  stylePreference: string;
  inspirations: string;
  budget: string;
  timeline: string;
  features: string[];
  additionalInfo: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export function OnboardingForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    profession: "",
    experience: "",
    industry: "",
    primaryGoal: "",
    targetAudience: "",
    contentTypes: [],
    colorPreference: "",
    stylePreference: "",
    inspirations: "",
    budget: "",
    timeline: "",
    features: [],
    additionalInfo: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter((f) => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Compile all form data into a single message for the contact API
      const message = [
        `Profession: ${formData.profession}`,
        `Industry: ${formData.industry}`,
        `Primary goal: ${formData.primaryGoal}`,
        `Target audience: ${formData.targetAudience}`,
        `Style preference: ${formData.stylePreference}`,
        `Inspirations: ${formData.inspirations}`,
        `Budget: ${formData.budget}`,
        `Timeline: ${formData.timeline}`,
        `Features: ${formData.features.join(", ") || "none"}`,
        `Additional info: ${formData.additionalInfo || "none"}`,
      ].join("\n");

      let submitted = false;
      try {
        const r = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            topic: "Project Inquiry",
            message,
          }),
        });
        if (r.ok) submitted = true;
      } catch {
        // Static mode — no server. Fall back to a mailto link.
      }

      if (!submitted) {
        // Fallback: open the user's email client with the compiled brief.
        const subject = encodeURIComponent(`Project Inquiry from ${formData.name}`);
        const body = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\n\n${message}`
        );
        window.location.href = `mailto:tasbirrkabir@gmail.com?subject=${subject}&body=${body}`;
      }
      toast({
        title: "Project brief submitted!",
        description: "I'll review your requirements and reply within 1–2 business days.",
      });
      // Reset
      setCurrentStep(0);
      setFormData({
        name: "", email: "", company: "", profession: "", experience: "", industry: "",
        primaryGoal: "", targetAudience: "", contentTypes: [], colorPreference: "",
        stylePreference: "", inspirations: "", budget: "", timeline: "", features: [],
        additionalInfo: "",
      });
    } catch (e: any) {
      toast({
        title: "Submission failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.email.trim() !== "";
      case 1:
        return formData.profession.trim() !== "" && formData.industry !== "";
      case 2:
        return formData.primaryGoal !== "";
      case 3:
        return formData.stylePreference !== "";
      case 4:
        return formData.budget !== "" && formData.timeline !== "";
      default:
        return true;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className={cn(
                  "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                  index < currentStep
                    ? "bg-clay"
                    : index === currentStep
                      ? "bg-clay ring-4 ring-clay/20"
                      : "bg-muted",
                )}
                onClick={() => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className={cn(
                  "text-[10px] mt-1.5 hidden sm:block",
                  index === currentStep
                    ? "text-clay font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-clay"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border border-border/60 shadow-premium rounded-3xl overflow-hidden bg-card">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Tell us about yourself</CardTitle>
                      <CardDescription>Let&apos;s start with some basic information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => updateFormData("name", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="company">Company/Organization (Optional)</Label>
                        <Input
                          id="company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={(e) => updateFormData("company", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2: Professional Background */}
                {currentStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Professional Background</CardTitle>
                      <CardDescription>Tell us about your professional experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="profession">What&apos;s your profession?</Label>
                        <Input
                          id="profession"
                          placeholder="e.g. Designer, Developer, Marketer"
                          value={formData.profession}
                          onChange={(e) => updateFormData("profession", e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="industry">What industry do you work in?</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => updateFormData("industry", value)}
                        >
                          <SelectTrigger
                            id="industry"
                            className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                          >
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="creative">Creative Arts</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 3: Project Goals */}
                {currentStep === 2 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Project Goals</CardTitle>
                      <CardDescription>What are you trying to achieve?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>What&apos;s the primary goal of your project?</Label>
                        <RadioGroup
                          value={formData.primaryGoal}
                          onValueChange={(value) => updateFormData("primaryGoal", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "showcase", label: "Showcase portfolio/work" },
                            { value: "sell", label: "Sell products/services" },
                            { value: "generate-leads", label: "Generate leads/inquiries" },
                            { value: "provide-info", label: "Provide information" },
                            { value: "blog", label: "Blog/content publishing" },
                            { value: "automation", label: "AI agents / automation" },
                          ].map((goal, index) => (
                            <motion.div
                              key={goal.value}
                              className="flex items-center space-x-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: { delay: 0.1 * index, duration: 0.3 },
                              }}
                            >
                              <RadioGroupItem value={goal.value} id={`goal-${index + 1}`} />
                              <Label htmlFor={`goal-${index + 1}`} className="cursor-pointer w-full">
                                {goal.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="targetAudience">Who is your target audience?</Label>
                        <Textarea
                          id="targetAudience"
                          placeholder="Describe your ideal visitors/customers"
                          value={formData.targetAudience}
                          onChange={(e) => updateFormData("targetAudience", e.target.value)}
                          className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 4: Design Preferences */}
                {currentStep === 3 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Design Preferences</CardTitle>
                      <CardDescription>Tell us about your aesthetic preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>What style do you prefer?</Label>
                        <RadioGroup
                          value={formData.stylePreference}
                          onValueChange={(value) => updateFormData("stylePreference", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "modern", label: "Modern & Sleek" },
                            { value: "minimalist", label: "Minimalist" },
                            { value: "bold", label: "Bold & Creative" },
                            { value: "corporate", label: "Corporate & Professional" },
                            { value: "editorial", label: "Editorial / Premium" },
                          ].map((style, index) => (
                            <motion.div
                              key={style.value}
                              className="flex items-center space-x-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.1 * index, duration: 0.3 },
                              }}
                            >
                              <RadioGroupItem value={style.value} id={`style-${index + 1}`} />
                              <Label htmlFor={`style-${index + 1}`} className="cursor-pointer w-full">
                                {style.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="inspirations">Any websites you like for inspiration?</Label>
                        <Textarea
                          id="inspirations"
                          placeholder="List websites you admire or want to emulate"
                          value={formData.inspirations}
                          onChange={(e) => updateFormData("inspirations", e.target.value)}
                          className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 5: Budget & Timeline */}
                {currentStep === 4 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Budget & Timeline</CardTitle>
                      <CardDescription>Let&apos;s talk about your investment and timeline</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="budget">What&apos;s your budget range? (USD)</Label>
                        <Select
                          value={formData.budget}
                          onValueChange={(value) => updateFormData("budget", value)}
                        >
                          <SelectTrigger
                            id="budget"
                            className="transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                          >
                            <SelectValue placeholder="Select your budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-1000">Under $1,000</SelectItem>
                            <SelectItem value="1000-3000">$1,000 - $3,000</SelectItem>
                            <SelectItem value="3000-5000">$3,000 - $5,000</SelectItem>
                            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                            <SelectItem value="over-10000">Over $10,000</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>What&apos;s your expected timeline?</Label>
                        <RadioGroup
                          value={formData.timeline}
                          onValueChange={(value) => updateFormData("timeline", value)}
                          className="space-y-2"
                        >
                          {[
                            { value: "asap", label: "ASAP" },
                            { value: "1-month", label: "Within 1 month" },
                            { value: "3-months", label: "1-3 months" },
                            { value: "flexible", label: "Flexible" },
                          ].map((time, index) => (
                            <motion.div
                              key={time.value}
                              className="flex items-center space-x-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: { delay: 0.1 * index, duration: 0.3 },
                              }}
                            >
                              <RadioGroupItem value={time.value} id={`time-${index + 1}`} />
                              <Label htmlFor={`time-${index + 1}`} className="cursor-pointer w-full">
                                {time.label}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 6: Additional Requirements */}
                {currentStep === 5 && (
                  <>
                    <CardHeader>
                      <CardTitle className="font-display tracking-tight">Additional Requirements</CardTitle>
                      <CardDescription>Any other specific needs?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>Which features do you need?</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Contact Form",
                            "Blog/News",
                            "E-commerce",
                            "User Accounts",
                            "Search Functionality",
                            "Social Media Integration",
                            "Newsletter Signup",
                            "Analytics",
                            "AI Agents",
                            "Automation",
                          ].map((feature, index) => (
                            <motion.div
                              key={feature}
                              className="flex items-center space-x-2 rounded-md border border-border p-3 cursor-pointer hover:bg-accent transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.05 * index, duration: 0.3 },
                              }}
                              onClick={() => toggleFeature(feature.toLowerCase())}
                            >
                              <Checkbox
                                id={`feature-${feature}`}
                                checked={formData.features.includes(feature.toLowerCase())}
                                onCheckedChange={() => toggleFeature(feature.toLowerCase())}
                              />
                              <Label htmlFor={`feature-${feature}`} className="cursor-pointer w-full">
                                {feature}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="additionalInfo">Anything else we should know?</Label>
                        <Textarea
                          id="additionalInfo"
                          placeholder="Any additional requirements or information"
                          value={formData.additionalInfo}
                          onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                          className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-clay/20 focus:border-clay"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <CardFooter className="flex justify-between pt-6 pb-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-1 transition-all duration-300 rounded-2xl bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Submit" : "Next"}
                      {currentStep === steps.length - 1 ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="mt-4 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </motion.div>
    </div>
  );
}
