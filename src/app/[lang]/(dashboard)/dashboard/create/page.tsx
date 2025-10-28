// src/app/[lang]/(dashboard)/dashboard/create/page.tsx

"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Scissors,
  Download,
  Expand,
  Target,
  RotateCcw,
  Minus,
  Eraser,
  Palette,
  SunMedium,
  Sparkles,
  Shuffle,
  Crop,
  Smile,
  Wand2,
  Frame,
  Info,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { env } from "~/env";
import { upload, Image as ImageKitImage } from "@imagekit/next";
import {
  buildAiTransformationChain,
  type AiTransformationDescriptor,
} from "~/lib/imagekit/ai-transformations";
import {
  createProject,
  getUserProjects,
  deductCredits,
} from "~/actions/projects";
import { useTranslations, useLanguage } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";

function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={label}
      id={id}
      onClick={() => {
        if (disabled) return;
        onCheckedChange(!checked);
      }}
      className={`relative inline-flex h-5 w-10 items-center rounded-full border transition duration-200 ${
        checked ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-gray-200"
      } ${disabled ? "cursor-not-allowed opacity-40" : "hover:opacity-90"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

interface UploadedImage {
  fileId: string;
  url: string;
  name: string;
  filePath: string;
}

interface Project {
  id: string;
  name: string | null;
  imageUrl: string;
  imageKitId: string;
  filePath: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadAuthResponse {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
}

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null,
  );
  const [transformations, setTransformations] = useState<
    AiTransformationDescriptor[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [objectInput, setObjectInput] = useState("");
  const [objectAspectRatio, setObjectAspectRatio] = useState("1:1");
  const [changeBackgroundPrompt, setChangeBackgroundPrompt] = useState("");
  const [dropShadowAzimuth, setDropShadowAzimuth] = useState("215");
  const [dropShadowElevation, setDropShadowElevation] = useState("45");
  const [dropShadowSaturation, setDropShadowSaturation] = useState("60");
  const [faceCropZoom, setFaceCropZoom] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [generativeWidth, setGenerativeWidth] = useState("1200");
  const [generativeHeight, setGenerativeHeight] = useState("900");
  const [generativeCropMode, setGenerativeCropMode] = useState<
    "pad_resize" | "pad_extract"
  >("pad_resize");
  const [generativePrompt, setGenerativePrompt] = useState("");
  type SectionId = "background" | "enhancements" | "crop" | "editing";
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    background: true,
    enhancements: true,
    crop: false,
    editing: false,
  });
  const [focusedEffectKind, setFocusedEffectKind] = useState<
    AiTransformationDescriptor["kind"] | null
  >(null);
  const [isControlSheetOpen, setIsControlSheetOpen] = useState(false);
  const [compareValue, setCompareValue] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const translations = useTranslations();
  const { lang } = useLanguage();
  const { create: createCopy, common, projects: projectsCopy } = translations;
  const uploadCopy = createCopy.uploadCard;
  const effectsCopy = createCopy.effects;
  const recentsCopy = createCopy.recents;

  // Lebih toleran terhadap variasi teks error dari server
  const resolveCreditError = (error?: string | null) => {
    if (!error) return createCopy.toasts.paymentFailed;
    const e = error.toLowerCase();
    if (e.includes("invalid credit amount"))
      return createCopy.toasts.invalidCredits;
    if (e.includes("insufficient credits"))
      return createCopy.toasts.insufficientCredits;
    if (e.includes("unauthorized")) return createCopy.toasts.paymentFailed;
    return error;
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await authClient.getSession();
        const projectsResult = await getUserProjects();
        if (projectsResult.success && projectsResult.projects) {
          setUserProjects(projectsResult.projects);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingProjects(false);
      }
    };

    void initializeData();
  }, []);

  useEffect(() => {
    if (!focusedEffectKind) return;
    const timeout = window.setTimeout(() => setFocusedEffectKind(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [focusedEffectKind]);

  const getUploadAuth = async (): Promise<UploadAuthResponse> => {
    const response = await fetch("/api/upload-auth");
    if (!response.ok) throw new Error("Auth failed");
    return response.json() as Promise<UploadAuthResponse>;
  };

  const selectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
    setUploadedImage(null);
    setTransformations([]);
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const authParams = await getUploadAuth();
      const result = await upload({
        file,
        fileName: file.name,
        folder: "/ai-image-editor",
        ...authParams,
      });

      const uploadedData: UploadedImage = {
        fileId: result.fileId ?? "",
        url: result.url ?? "",
        name: result.name ?? file.name,
        filePath: result.filePath ?? "",
      };

      setUploadedImage(uploadedData);

      try {
        const projectResult = await createProject({
          imageUrl: uploadedData.url,
          imageKitId: uploadedData.fileId,
          filePath: uploadedData.filePath,
          name: uploadedData.name,
        });

        if (projectResult.success) {
          const updatedProjects = await getUserProjects();
          if (updatedProjects.success && updatedProjects.projects) {
            setUserProjects(updatedProjects.projects);
          }
        } else {
          console.error(
            "Failed to save project to database:",
            projectResult.error,
          );
        }
      } catch (dbError) {
        console.error("Database save error:", dbError);
      }

      toast.success(createCopy.toasts.uploadSuccess);
    } catch (error) {
      toast.error(createCopy.toasts.uploadFailed);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const liveTransformations = useMemo(
    (): ReturnType<typeof buildAiTransformationChain> =>
      buildAiTransformationChain(transformations),
    [transformations],
  );

  const matchesDescriptor = (
    target: AiTransformationDescriptor,
    descriptor: AiTransformationDescriptor,
    predicate?: (transform: AiTransformationDescriptor) => boolean,
  ) =>
    target.kind === descriptor.kind && (predicate ? predicate(target) : true);

  const findTransformationIndex = (
    list: AiTransformationDescriptor[],
    matcher: (transform: AiTransformationDescriptor) => boolean,
  ) => list.findIndex(matcher);

  const hasTransformationKind = (
    kind: AiTransformationDescriptor["kind"],
    predicate?: (transform: AiTransformationDescriptor) => boolean,
  ) =>
    transformations.some(
      (transform) =>
        transform.kind === kind &&
        transform.enabled !== false &&
        (predicate ? predicate(transform) : true),
    );

  const upsertTransformation = (
    descriptor: AiTransformationDescriptor,
    predicate?: (transform: AiTransformationDescriptor) => boolean,
  ) => {
    setTransformations((prev) => {
      const matcher = predicate
        ? (item: AiTransformationDescriptor) =>
            matchesDescriptor(item, descriptor, predicate)
        : (item: AiTransformationDescriptor) => item.kind === descriptor.kind;

      const index = findTransformationIndex(prev, matcher);

      if (index !== -1) {
        return prev.map((item, currentIndex) =>
          currentIndex === index
            ? { ...item, ...descriptor, enabled: descriptor.enabled ?? true }
            : item,
        );
      }

      return [...prev, { ...descriptor, enabled: descriptor.enabled ?? true }];
    });
  };

  const getTransformationIndex = (
    kind: AiTransformationDescriptor["kind"],
    predicate?: (transform: AiTransformationDescriptor) => boolean,
  ) =>
    findTransformationIndex(
      transformations,
      (transform) =>
        transform.kind === kind && (predicate ? predicate(transform) : true),
    );

  const clampNumber = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const getRemovalToast = (descriptor: AiTransformationDescriptor) => {
    switch (descriptor.kind) {
      case "removeBackground":
        return descriptor.strategy === "removedotbg"
          ? effectsCopy.removeBackgroundHd.toastRemoved
          : effectsCopy.removeBackground.toastRemoved;
      case "upscale":
        return effectsCopy.upscale.toastRemoved;
      case "retouch":
        return effectsCopy.retouch.toastRemoved;
      case "generateVariation":
        return effectsCopy.variation.toastRemoved;
      case "smartCrop":
        return effectsCopy.smartCrop.toastRemoved;
      case "objectCrop":
        return effectsCopy.objectCrop.toastRemoved;
      case "faceCrop":
        return effectsCopy.faceCrop.toastRemoved;
      case "changeBackground":
        return effectsCopy.changeBackground.toastRemoved;
      case "dropShadow":
        return effectsCopy.dropShadow.toastRemoved;
      case "edit":
        return effectsCopy.edit.toastRemoved;
      case "generativeFill":
        return effectsCopy.generativeFill.toastRemoved;
      default:
        return createCopy.toasts.transformationsCleared;
    }
  };

  const effectSectionByKind: Record<
    AiTransformationDescriptor["kind"],
    SectionId
  > = {
    removeBackground: "background",
    changeBackground: "background",
    dropShadow: "background",
    retouch: "enhancements",
    upscale: "enhancements",
    smartCrop: "crop",
    objectCrop: "crop",
    faceCrop: "crop",
    generateVariation: "enhancements",
    edit: "editing",
    generativeFill: "editing",
    raw: "enhancements",
  };

  const sectionConfig: Record<
    SectionId,
    { icon: LucideIcon; title: string; subtitle: string }
  > = {
    background: {
      icon: SunMedium,
      title: effectsCopy.sections.background.title,
      subtitle: effectsCopy.sections.background.subtitle,
    },
    enhancements: {
      icon: Sparkles,
      title: effectsCopy.sections.enhancements.title,
      subtitle: effectsCopy.sections.enhancements.subtitle,
    },
    crop: {
      icon: Crop,
      title: effectsCopy.sections.crop.title,
      subtitle: effectsCopy.sections.crop.subtitle,
    },
    editing: {
      icon: Wand2,
      title: effectsCopy.sections.editing.title,
      subtitle: effectsCopy.sections.editing.subtitle,
    },
  };

  const removeTransformationAt = (index: number) => {
    if (isProcessing) return;
    const target = transformations[index];
    if (!target) return;
    setTransformations((prev) => prev.filter((_, idx) => idx !== index));
    toast.success(getRemovalToast(target));
  };

  const removeTransformationByKind = (
    kind: AiTransformationDescriptor["kind"],
    predicate?: (transform: AiTransformationDescriptor) => boolean,
  ) => {
    if (isProcessing) return;
    const index = transformations.findIndex(
      (transform) =>
        transform.kind === kind && (predicate ? predicate(transform) : true),
    );
    if (index === -1) return;
    removeTransformationAt(index);
  };

  const handleToggleTransformation = (index: number, nextEnabled: boolean) => {
    if (isProcessing) return;
    const target = transformations[index];
    if (!target) return;

    if (nextEnabled) {
      setTransformations((prev) =>
        prev.map((item, currentIndex) =>
          currentIndex === index ? { ...item, enabled: true } : item,
        ),
      );
      router.refresh();
    } else {
      setTransformations((prev) =>
        prev.map((item, currentIndex) =>
          currentIndex === index ? { ...item, enabled: false } : item,
        ),
      );
      toast.success(getRemovalToast(target));
      router.refresh();
    }
  };

  const handleEditTransformation = (index: number) => {
    const target = transformations[index];
    if (!target) return;
    const section = effectSectionByKind[target.kind] ?? "background";
    setOpenSections((prev) => ({ ...prev, [section]: true }));
    setFocusedEffectKind(target.kind);
    setIsControlSheetOpen(true);
  };

  const isEffectFocused = (kind: AiTransformationDescriptor["kind"]) =>
    focusedEffectKind === kind;

  const CREDIT_COSTS = {
    removeBackground: 2,
    removeBackgroundHd: 3,
    changeBackground: 3,
    dropShadow: 1,
    retouch: 1,
    upscale: 1,
    variation: 2,
    edit: 3,
    generativeFill: 4,
  } as const;

  const CREDIT_REASONS: Record<keyof typeof CREDIT_COSTS, string> = {
    removeBackground: "background removal",
    removeBackgroundHd: "background removal hd",
    changeBackground: "background change",
    dropShadow: "ai drop shadow",
    retouch: "retouch",
    upscale: "upscaling",
    variation: "variation",
    edit: "edit image",
    generativeFill: "generative fill",
  };

  const applyWithCredits = async ({
    descriptor,
    costKey,
    alreadyMessage,
    successMessage,
    errorMessage,
    predicate,
  }: {
    descriptor: AiTransformationDescriptor;
    costKey: keyof typeof CREDIT_COSTS;
    alreadyMessage: string;
    successMessage: string;
    errorMessage: string;
    predicate?: (transform: AiTransformationDescriptor) => boolean;
  }) => {
    if (!uploadedImage) return;
    const matcher = predicate
      ? (transform: AiTransformationDescriptor) =>
          matchesDescriptor(transform, descriptor, predicate)
      : (transform: AiTransformationDescriptor) =>
          transform.kind === descriptor.kind;

    const existingIndex = findTransformationIndex(transformations, matcher);
    const existingDescriptor =
      existingIndex !== -1 ? transformations[existingIndex] : undefined;

    if (existingDescriptor && existingDescriptor.enabled !== false) {
      toast.error(alreadyMessage);
      return;
    }

    if (existingDescriptor && existingDescriptor.enabled === false) {
      setTransformations((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? { ...item, ...descriptor, enabled: true }
            : item,
        ),
      );
      router.refresh();
      return;
    }

    setIsProcessing(true);
    try {
      const creditResult = await deductCredits(
        CREDIT_COSTS[costKey],
        CREDIT_REASONS[costKey],
      );
      if (!creditResult.success) {
        toast.error(resolveCreditError(creditResult.error));
        setIsProcessing(false);
        return;
      }

      upsertTransformation(descriptor, predicate);
      const remaining = creditResult.remainingCredits ?? 0;

      setTimeout(() => {
        setIsProcessing(false);
        toast.success(formatTranslation(successMessage, { remaining }));
        router.refresh();
      }, 3000);
    } catch (error) {
      console.error("AI transformation error:", error);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const applyLocalTransformation = ({
    descriptor,
    alreadyMessage,
    successMessage,
    errorMessage,
    predicate,
    delay = 1500,
    onSuccess,
  }: {
    descriptor: AiTransformationDescriptor;
    alreadyMessage: string;
    successMessage: string;
    errorMessage: string;
    predicate?: (transform: AiTransformationDescriptor) => boolean;
    delay?: number;
    onSuccess?: () => void;
  }) => {
    if (!uploadedImage) return;
    const matcher = predicate
      ? (transform: AiTransformationDescriptor) =>
          matchesDescriptor(transform, descriptor, predicate)
      : (transform: AiTransformationDescriptor) =>
          transform.kind === descriptor.kind;

    const existingIndex = findTransformationIndex(transformations, matcher);
    const existingDescriptor =
      existingIndex !== -1 ? transformations[existingIndex] : undefined;

    if (existingDescriptor && existingDescriptor.enabled !== false) {
      toast.error(alreadyMessage);
      return;
    }

    if (existingDescriptor && existingDescriptor.enabled === false) {
      setTransformations((prev) =>
        prev.map((item, index) =>
          index === existingIndex
            ? { ...item, ...descriptor, enabled: true }
            : item,
        ),
      );
      router.refresh();
      onSuccess?.();
      return;
    }

    setIsProcessing(true);
    try {
      upsertTransformation(descriptor, predicate);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsProcessing(false);
        toast.success(successMessage);
      }, delay);
    } catch (error) {
      console.error("AI transformation error:", error);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const applyRemoveBackground = (strategy: "bgremove" | "removedotbg") => {
    const isHd = strategy === "removedotbg";
    return applyWithCredits({
      descriptor: { kind: "removeBackground", strategy },
      costKey: isHd ? "removeBackgroundHd" : "removeBackground",
      alreadyMessage: isHd
        ? effectsCopy.removeBackgroundHd.toastAlready
        : effectsCopy.removeBackground.toastAlready,
      successMessage: isHd
        ? effectsCopy.removeBackgroundHd.toastApplied
        : effectsCopy.removeBackground.toastApplied,
      errorMessage: isHd
        ? effectsCopy.removeBackgroundHd.toastError
        : effectsCopy.removeBackground.toastError,
      predicate: (transform) => transform.kind === "removeBackground",
    });
  };

  const applyUpscale = () =>
    applyWithCredits({
      descriptor: { kind: "upscale" },
      costKey: "upscale",
      alreadyMessage: effectsCopy.upscale.toastAlready,
      successMessage: effectsCopy.upscale.toastApplied,
      errorMessage: effectsCopy.upscale.toastError,
    });

  const applyRetouch = () =>
    applyWithCredits({
      descriptor: { kind: "retouch" },
      costKey: "retouch",
      alreadyMessage: effectsCopy.retouch.toastAlready,
      successMessage: effectsCopy.retouch.toastApplied,
      errorMessage: effectsCopy.retouch.toastError,
    });

  const applyVariation = () =>
    applyWithCredits({
      descriptor: { kind: "generateVariation" },
      costKey: "variation",
      alreadyMessage: effectsCopy.variation.toastAlready,
      successMessage: effectsCopy.variation.toastApplied,
      errorMessage: effectsCopy.variation.toastError,
    });

  const applySmartCrop = () =>
    applyLocalTransformation({
      descriptor: { kind: "smartCrop" },
      alreadyMessage: effectsCopy.smartCrop.toastAlready,
      successMessage: effectsCopy.smartCrop.toastApplied,
      errorMessage: effectsCopy.smartCrop.toastError,
    });

  const applyFaceCrop = () => {
    const zoomValue = parseNumber(faceCropZoom);
    const descriptor: AiTransformationDescriptor = {
      kind: "faceCrop",
      ...(zoomValue !== undefined
        ? { zoom: clampNumber(zoomValue, 0, 100) }
        : {}),
    };

    applyLocalTransformation({
      descriptor,
      alreadyMessage: effectsCopy.faceCrop.toastAlready,
      successMessage: effectsCopy.faceCrop.toastApplied,
      errorMessage: effectsCopy.faceCrop.toastError,
    });
  };

  const applyObjectCrop = () => {
    if (!objectInput.trim()) {
      toast.error(effectsCopy.objectCrop.toastMissing);
      return;
    }

    const cleanInput = objectInput.trim().toLowerCase();
    const ratio = objectAspectRatio.trim();
    const descriptor: AiTransformationDescriptor = {
      kind: "objectCrop",
      object: cleanInput,
      ...(ratio ? { aspectRatio: ratio } : {}),
    };

    applyLocalTransformation({
      descriptor,
      alreadyMessage: effectsCopy.objectCrop.toastAlready,
      successMessage: formatTranslation(effectsCopy.objectCrop.toastApplied, {
        object: objectInput,
      }),
      errorMessage: effectsCopy.objectCrop.toastError,
    });
  };

  const applyChangeBackground = () => {
    if (!changeBackgroundPrompt.trim()) {
      toast.error(effectsCopy.changeBackground.toastMissing);
      return;
    }

    return applyWithCredits({
      descriptor: {
        kind: "changeBackground",
        prompt: changeBackgroundPrompt.trim(),
      },
      costKey: "changeBackground",
      alreadyMessage: effectsCopy.changeBackground.toastAlready,
      successMessage: effectsCopy.changeBackground.toastApplied,
      errorMessage: effectsCopy.changeBackground.toastError,
    });
  };

  const applyDropShadow = () => {
    const azimuthValue = parseNumber(dropShadowAzimuth);
    const elevationValue = parseNumber(dropShadowElevation);
    const saturationValue = parseNumber(dropShadowSaturation);

    const descriptor: AiTransformationDescriptor = {
      kind: "dropShadow",
      ...(azimuthValue !== undefined
        ? { azimuth: clampNumber(azimuthValue, 0, 360) }
        : {}),
      ...(elevationValue !== undefined
        ? { elevation: clampNumber(elevationValue, 0, 90) }
        : {}),
      ...(saturationValue !== undefined
        ? { saturation: clampNumber(saturationValue, 0, 100) }
        : {}),
    };

    return applyWithCredits({
      descriptor,
      costKey: "dropShadow",
      alreadyMessage: effectsCopy.dropShadow.toastAlready,
      successMessage: effectsCopy.dropShadow.toastApplied,
      errorMessage: effectsCopy.dropShadow.toastError,
      predicate: (transform) => transform.kind === "dropShadow",
    });
  };

  const applyEdit = () => {
    if (!editPrompt.trim()) {
      toast.error(effectsCopy.edit.toastMissing);
      return;
    }

    return applyWithCredits({
      descriptor: { kind: "edit", prompt: editPrompt.trim() },
      costKey: "edit",
      alreadyMessage: effectsCopy.edit.toastAlready,
      successMessage: effectsCopy.edit.toastApplied,
      errorMessage: effectsCopy.edit.toastError,
    });
  };

  const applyGenerativeFill = () => {
    const widthValue = Number(generativeWidth);
    const heightValue = Number(generativeHeight);

    if (
      !Number.isFinite(widthValue) ||
      widthValue <= 0 ||
      !Number.isFinite(heightValue) ||
      heightValue <= 0
    ) {
      toast.error(effectsCopy.generativeFill.toastMissingDimensions);
      return;
    }

    const descriptor: AiTransformationDescriptor = {
      kind: "generativeFill",
      width: Math.round(widthValue),
      height: Math.round(heightValue),
      cropMode: generativeCropMode,
      ...(generativePrompt.trim() ? { prompt: generativePrompt.trim() } : {}),
    };

    return applyWithCredits({
      descriptor,
      costKey: "generativeFill",
      alreadyMessage: effectsCopy.generativeFill.toastAlready,
      successMessage: effectsCopy.generativeFill.toastApplied,
      errorMessage: effectsCopy.generativeFill.toastError,
    });
  };

  const truncate = (value: string, length = 40) =>
    value.length > length ? `${value.slice(0, length)}…` : value;

  const computeEffectLabel = (
    states: { idle: string; done: string; processing: string },
    isActive: boolean,
  ) =>
    isProcessing ? states.processing : isActive ? states.done : states.idle;

  const getTransformationMeta = (transform: AiTransformationDescriptor) => {
    switch (transform.kind) {
      case "removeBackground":
        return {
          label:
            transform.strategy === "removedotbg"
              ? effectsCopy.labels.removeBackgroundHd
              : effectsCopy.labels.removeBackground,
        };
      case "upscale":
        return { label: effectsCopy.labels.upscale };
      case "retouch":
        return { label: effectsCopy.labels.retouch };
      case "generateVariation":
        return { label: effectsCopy.labels.variation };
      case "smartCrop":
        return { label: effectsCopy.labels.smartCrop };
      case "objectCrop":
        return {
          label: effectsCopy.labels.objectCrop,
          detail: transform.aspectRatio
            ? `${transform.object} • ${transform.aspectRatio}`
            : transform.object,
        };
      case "faceCrop":
        return {
          label: effectsCopy.labels.faceCrop,
          detail:
            transform.zoom !== undefined ? `zoom ${transform.zoom}` : undefined,
        };
      case "changeBackground":
        return {
          label: effectsCopy.labels.changeBackground,
          detail: truncate(transform.prompt, 40),
        };
      case "dropShadow": {
        const parts = [
          transform.azimuth !== undefined ? `az ${transform.azimuth}` : null,
          transform.elevation !== undefined
            ? `el ${transform.elevation}`
            : null,
          transform.saturation !== undefined
            ? `int ${transform.saturation}`
            : null,
        ].filter(Boolean);
        return {
          label: effectsCopy.labels.dropShadow,
          detail: parts.length > 0 ? parts.join(" • ") : undefined,
        };
      }
      case "edit":
        return {
          label: effectsCopy.labels.edit,
          detail: truncate(transform.prompt, 40),
        };
      case "generativeFill":
        return {
          label: effectsCopy.labels.generativeFill,
          detail: `${transform.width}×${transform.height}`,
        };
      default:
        return { label: effectsCopy.labels.removeBackground };
    }
  };

  const appliedTransformations = transformations.map((transform, index) => ({
    descriptor: transform,
    index,
    enabled: transform.enabled !== false,
    meta: getTransformationMeta(transform),
  }));

  const activeTransformations = appliedTransformations;

  const activeTransformationCount = appliedTransformations.filter(
    ({ enabled }) => enabled,
  ).length;

  const isRemoveBackgroundBasicActive = hasTransformationKind(
    "removeBackground",
    (transform) =>
      transform.kind === "removeBackground" &&
      (transform.strategy ?? "bgremove") === "bgremove",
  );
  const isRemoveBackgroundHdActive = hasTransformationKind(
    "removeBackground",
    (transform) =>
      transform.kind === "removeBackground" &&
      transform.strategy === "removedotbg",
  );
  const isUpscaleActive = hasTransformationKind("upscale");
  const isRetouchActive = hasTransformationKind("retouch");
  const isVariationActive = hasTransformationKind("generateVariation");
  const isSmartCropActive = hasTransformationKind("smartCrop");
  const isFaceCropActive = hasTransformationKind("faceCrop");
  const isObjectCropActive = hasTransformationKind("objectCrop");
  const isChangeBackgroundActive = hasTransformationKind("changeBackground");
  const isDropShadowActive = hasTransformationKind("dropShadow");
  const isEditActive = hasTransformationKind("edit");
  const isGenerativeFillActive = hasTransformationKind("generativeFill");

  const removeBackgroundBasicIndex = getTransformationIndex(
    "removeBackground",
    (transform) =>
      transform.kind === "removeBackground" &&
      (transform.strategy ?? "bgremove") === "bgremove",
  );
  const removeBackgroundHdIndex = getTransformationIndex(
    "removeBackground",
    (transform) =>
      transform.kind === "removeBackground" &&
      transform.strategy === "removedotbg",
  );
  const dropShadowIndex = getTransformationIndex("dropShadow");
  const changeBackgroundIndex = getTransformationIndex("changeBackground");
  const retouchIndex = getTransformationIndex("retouch");
  const upscaleIndex = getTransformationIndex("upscale");
  const variationIndex = getTransformationIndex("generateVariation");
  const smartCropIndex = getTransformationIndex("smartCrop");
  const faceCropIndex = getTransformationIndex("faceCrop");
  const objectCropIndex = getTransformationIndex("objectCrop");
  const editIndex = getTransformationIndex("edit");
  const generativeFillIndex = getTransformationIndex("generativeFill");
  const changeBackgroundDescriptor =
    changeBackgroundIndex !== -1
      ? transformations[changeBackgroundIndex]
      : null;
  const dropShadowDescriptor =
    dropShadowIndex !== -1 ? transformations[dropShadowIndex] : null;
  const faceCropDescriptor =
    faceCropIndex !== -1 ? transformations[faceCropIndex] : null;
  const objectCropDescriptor =
    objectCropIndex !== -1 ? transformations[objectCropIndex] : null;
  const editDescriptor = editIndex !== -1 ? transformations[editIndex] : null;
  const generativeFillDescriptor =
    generativeFillIndex !== -1 ? transformations[generativeFillIndex] : null;

  useEffect(() => {
    if (
      changeBackgroundDescriptor &&
      changeBackgroundDescriptor.kind === "changeBackground" &&
      changeBackgroundDescriptor.prompt
    ) {
      setChangeBackgroundPrompt(changeBackgroundDescriptor.prompt);
    }

    if (dropShadowDescriptor && dropShadowDescriptor.kind === "dropShadow") {
      if (dropShadowDescriptor.azimuth !== undefined) {
        const value = String(dropShadowDescriptor.azimuth);
        setDropShadowAzimuth((prev) => (prev === value ? prev : value));
      }
      if (dropShadowDescriptor.elevation !== undefined) {
        const value = String(dropShadowDescriptor.elevation);
        setDropShadowElevation((prev) => (prev === value ? prev : value));
      }
      if (dropShadowDescriptor.saturation !== undefined) {
        const value = String(dropShadowDescriptor.saturation);
        setDropShadowSaturation((prev) => (prev === value ? prev : value));
      }
    }

    if (faceCropDescriptor && faceCropDescriptor.kind === "faceCrop") {
      if (faceCropDescriptor.zoom !== undefined) {
        const value = String(faceCropDescriptor.zoom);
        setFaceCropZoom((prev) => (prev === value ? prev : value));
      }
    }

    if (objectCropDescriptor && objectCropDescriptor.kind === "objectCrop") {
      if (objectCropDescriptor.object) {
        setObjectInput((prev) =>
          prev === objectCropDescriptor.object
            ? prev
            : objectCropDescriptor.object,
        );
      }
      setObjectAspectRatio((prev) => {
        const next = objectCropDescriptor.aspectRatio ?? prev;
        return prev === next ? prev : next;
      });
    }

    if (editDescriptor && editDescriptor.kind === "edit") {
      if (editDescriptor.prompt) {
        setEditPrompt((prev) =>
          prev === editDescriptor.prompt ? prev : editDescriptor.prompt,
        );
      }
    }

    if (
      generativeFillDescriptor &&
      generativeFillDescriptor.kind === "generativeFill"
    ) {
      const widthValue = String(generativeFillDescriptor.width);
      const heightValue = String(generativeFillDescriptor.height);
      setGenerativeWidth((prev) => (prev === widthValue ? prev : widthValue));
      setGenerativeHeight((prev) =>
        prev === heightValue ? prev : heightValue,
      );
      if (generativeFillDescriptor.cropMode) {
        setGenerativeCropMode(generativeFillDescriptor.cropMode);
      }
      setGenerativePrompt((prev) => {
        const next = generativeFillDescriptor.prompt ?? prev;
        return prev === next ? prev : next;
      });
    }
  }, [
    changeBackgroundDescriptor,
    dropShadowDescriptor,
    faceCropDescriptor,
    objectCropDescriptor,
    editDescriptor,
    generativeFillDescriptor,
  ]);

  const clearTransformations = () => {
    setTransformations([]);
    toast.success(createCopy.toasts.transformationsCleared);
  };

  const downloadImage = () => {
    if (!uploadedImage) return;

    // Ambil URL img yang sedang dirender (dengan transformasi)
    const mainImage = document.querySelector('img[width="800"][height="600"]');
    const url =
      (mainImage as HTMLImageElement | null)?.src ??
      `${env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${uploadedImage.filePath}`;

    window.open(url, "_blank");
    toast.success(createCopy.toasts.downloadStarted);
  };

  const renderSection = (sectionId: SectionId, content: ReactNode) => {
    const section = sectionConfig[sectionId];
    const isOpen = openSections[sectionId];

    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() =>
            setOpenSections((prev) => ({
              ...prev,
              [sectionId]: !prev[sectionId],
            }))
          }
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-md p-2">
              <section.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{section.title}</p>
              <p className="text-muted-foreground text-xs">
                {section.subtitle}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen ? <Separator className="mx-3" /> : null}
        {isOpen ? (
          <div className="space-y-3 px-3 pt-2 pb-3">{content}</div>
        ) : null}
      </div>
    );
  };

  const renderCreditBadge = (label?: string) =>
    label ? (
      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 uppercase">
        {label}
      </span>
    ) : null;

  const renderFreeBadge = (label?: string) =>
    label ? (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        {label}
      </span>
    ) : null;

  const panelEffectClass = (kind: AiTransformationDescriptor["kind"]) =>
    `rounded-lg border p-3 transition ${
      isEffectFocused(kind)
        ? "border-blue-400 ring-2 ring-blue-100"
        : "border-gray-200"
    }`;

  const backgroundSectionContent = (
    <div className="space-y-3">
      <div className={panelEffectClass("removeBackground")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Scissors className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {effectsCopy.labels.removeBackground}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground"
                      aria-label={effectsCopy.removeBackground.tooltip}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {effectsCopy.removeBackground.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-xs">
                {computeEffectLabel(
                  effectsCopy.removeBackground,
                  isRemoveBackgroundBasicActive,
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.removeBackground.cost)}
            <ToggleSwitch
              checked={isRemoveBackgroundBasicActive}
              disabled={
                isProcessing || isRemoveBackgroundHdActive || !uploadedImage
              }
              onCheckedChange={(value) => {
                if (value) {
                  void applyRemoveBackground("bgremove");
                } else if (removeBackgroundBasicIndex !== -1) {
                  handleToggleTransformation(removeBackgroundBasicIndex, false);
                }
              }}
              label={effectsCopy.labels.removeBackground}
            />
          </div>
        </div>
      </div>
      <div className={panelEffectClass("removeBackground")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-orange-50 p-2 text-orange-600">
              <Eraser className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {effectsCopy.labels.removeBackgroundHd}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground"
                      aria-label={effectsCopy.removeBackgroundHd.tooltip}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {effectsCopy.removeBackgroundHd.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-xs">
                {computeEffectLabel(
                  effectsCopy.removeBackgroundHd,
                  isRemoveBackgroundHdActive,
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.removeBackgroundHd.cost)}
            <ToggleSwitch
              checked={isRemoveBackgroundHdActive}
              disabled={
                isProcessing || isRemoveBackgroundBasicActive || !uploadedImage
              }
              onCheckedChange={(value) => {
                if (value) {
                  void applyRemoveBackground("removedotbg");
                } else if (removeBackgroundHdIndex !== -1) {
                  handleToggleTransformation(removeBackgroundHdIndex, false);
                }
              }}
              label={effectsCopy.labels.removeBackgroundHd}
            />
          </div>
        </div>
      </div>
      <div className={panelEffectClass("changeBackground")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-purple-50 p-2 text-purple-600">
              <Palette className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {effectsCopy.labels.changeBackground}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground"
                      aria-label={effectsCopy.changeBackground.helper}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {effectsCopy.changeBackground.helper}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.changeBackground.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.changeBackground.cost)}
            <ToggleSwitch
              checked={isChangeBackgroundActive}
              disabled={isProcessing || changeBackgroundIndex === -1}
              onCheckedChange={(value) => {
                if (changeBackgroundIndex === -1) {
                  if (value) void applyChangeBackground();
                  return;
                }
                handleToggleTransformation(changeBackgroundIndex, value);
              }}
              label={effectsCopy.labels.changeBackground}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <Input
            value={changeBackgroundPrompt}
            onChange={(event) => setChangeBackgroundPrompt(event.target.value)}
            placeholder={effectsCopy.changeBackground.placeholder}
            disabled={isProcessing}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={applyChangeBackground}
              size="sm"
              disabled={isProcessing || !changeBackgroundPrompt.trim()}
              className="gap-1 px-2 text-xs"
            >
              <Palette className="h-3 w-3" />
              {effectsCopy.changeBackground.apply}
            </Button>
            {changeBackgroundIndex !== -1 ? (
              <Button
                onClick={() => removeTransformationByKind("changeBackground")}
                size="sm"
                variant="outline"
                disabled={isProcessing}
                className="text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Minus className="h-3 w-3" />
                {effectsCopy.chipRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className={panelEffectClass("dropShadow")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-amber-50 p-2 text-amber-600">
              <SunMedium className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {effectsCopy.labels.dropShadow}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground"
                      aria-label={effectsCopy.dropShadow.helper}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {effectsCopy.dropShadow.helper}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.dropShadow.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.dropShadow.cost)}
            <ToggleSwitch
              checked={isDropShadowActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applyDropShadow();
                } else if (dropShadowIndex !== -1) {
                  handleToggleTransformation(dropShadowIndex, false);
                }
              }}
              label={effectsCopy.labels.dropShadow}
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Input
            type="number"
            value={dropShadowAzimuth}
            onChange={(event) => setDropShadowAzimuth(event.target.value)}
            min={0}
            max={360}
            placeholder={effectsCopy.dropShadow.azimuthLabel}
            disabled={isProcessing}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            value={dropShadowElevation}
            onChange={(event) => setDropShadowElevation(event.target.value)}
            min={0}
            max={90}
            placeholder={effectsCopy.dropShadow.elevationLabel}
            disabled={isProcessing}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            value={dropShadowSaturation}
            onChange={(event) => setDropShadowSaturation(event.target.value)}
            min={0}
            max={100}
            placeholder={effectsCopy.dropShadow.saturationLabel}
            disabled={isProcessing}
            className="h-8 text-xs"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            onClick={applyDropShadow}
            size="sm"
            disabled={isProcessing}
            className="gap-1 px-2 text-xs"
          >
            <SunMedium className="h-3 w-3" />
            {computeEffectLabel(effectsCopy.dropShadow, isDropShadowActive)}
          </Button>
          {dropShadowIndex !== -1 ? (
            <Button
              onClick={() => removeTransformationByKind("dropShadow")}
              size="sm"
              variant="outline"
              disabled={isProcessing}
              className="text-destructive h-7 gap-1 px-2 text-xs"
            >
              <Minus className="h-3 w-3" />
              {effectsCopy.chipRemove}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );

  const enhancementsSectionContent = (
    <div className="space-y-3">
      <div className={panelEffectClass("retouch")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-pink-50 p-2 text-pink-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.retouch}
              </p>
              <p className="text-muted-foreground text-xs">
                {computeEffectLabel(effectsCopy.retouch, isRetouchActive)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.retouch.cost)}
            <ToggleSwitch
              checked={isRetouchActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applyRetouch();
                } else if (retouchIndex !== -1) {
                  handleToggleTransformation(retouchIndex, false);
                }
              }}
              label={effectsCopy.labels.retouch}
            />
          </div>
        </div>
      </div>
      <div className={panelEffectClass("upscale")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-blue-50 p-2 text-blue-600">
              <Expand className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.upscale}
              </p>
              <p className="text-muted-foreground text-xs">
                {computeEffectLabel(effectsCopy.upscale, isUpscaleActive)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.upscale.cost)}
            <ToggleSwitch
              checked={isUpscaleActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applyUpscale();
                } else if (upscaleIndex !== -1) {
                  handleToggleTransformation(upscaleIndex, false);
                }
              }}
              label={effectsCopy.labels.upscale}
            />
          </div>
        </div>
      </div>
      <div className={panelEffectClass("generateVariation")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
              <Shuffle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.variation}
              </p>
              <p className="text-muted-foreground text-xs">
                {computeEffectLabel(effectsCopy.variation, isVariationActive)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.variation.cost)}
            <ToggleSwitch
              checked={isVariationActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applyVariation();
                } else if (variationIndex !== -1) {
                  handleToggleTransformation(variationIndex, false);
                }
              }}
              label={effectsCopy.labels.variation}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const cropSectionContent = (
    <div className="space-y-3">
      <div className={panelEffectClass("smartCrop")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
              <Crop className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.smartCrop}
              </p>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.smartCrop.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderFreeBadge(effectsCopy.smartCrop.badge)}
            <ToggleSwitch
              checked={isSmartCropActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applySmartCrop();
                } else if (smartCropIndex !== -1) {
                  handleToggleTransformation(smartCropIndex, false);
                }
              }}
              label={effectsCopy.labels.smartCrop}
            />
          </div>
        </div>
      </div>
      <div className={panelEffectClass("faceCrop")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-rose-50 p-2 text-rose-600">
              <Smile className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.faceCrop}
              </p>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.faceCrop.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderFreeBadge(effectsCopy.faceCrop.badge)}
            <ToggleSwitch
              checked={isFaceCropActive}
              disabled={isProcessing || !uploadedImage}
              onCheckedChange={(value) => {
                if (value) {
                  void applyFaceCrop();
                } else if (faceCropIndex !== -1) {
                  handleToggleTransformation(faceCropIndex, false);
                }
              }}
              label={effectsCopy.labels.faceCrop}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <Input
            value={faceCropZoom}
            onChange={(event) => setFaceCropZoom(event.target.value)}
            placeholder={effectsCopy.faceCrop.zoomLabel}
            disabled={isProcessing}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={applyFaceCrop}
              size="sm"
              disabled={isProcessing}
              className="gap-1 px-2 text-xs"
            >
              <Smile className="h-3 w-3" />
              {computeEffectLabel(effectsCopy.faceCrop, isFaceCropActive)}
            </Button>
            {faceCropIndex !== -1 ? (
              <Button
                onClick={() => removeTransformationByKind("faceCrop")}
                size="sm"
                variant="outline"
                disabled={isProcessing}
                className="text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Minus className="h-3 w-3" />
                {effectsCopy.chipRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className={panelEffectClass("objectCrop")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-sky-50 p-2 text-sky-600">
              <Target className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.objectCrop.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.objectCrop.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderFreeBadge(effectsCopy.objectCrop.badge)}
            <ToggleSwitch
              checked={isObjectCropActive}
              disabled={
                isProcessing || !uploadedImage || objectCropIndex === -1
              }
              onCheckedChange={(value) => {
                if (objectCropIndex === -1) {
                  if (value) void applyObjectCrop();
                  return;
                }
                handleToggleTransformation(objectCropIndex, value);
              }}
              label={effectsCopy.labels.objectCrop}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <Input
            value={objectInput}
            onChange={(event) => setObjectInput(event.target.value)}
            placeholder={effectsCopy.objectCrop.placeholder}
            disabled={isProcessing}
            className="text-xs"
          />
          <Input
            value={objectAspectRatio}
            onChange={(event) => setObjectAspectRatio(event.target.value)}
            placeholder={effectsCopy.objectCrop.aspectPlaceholder}
            disabled={isProcessing}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={applyObjectCrop}
              size="sm"
              disabled={isProcessing || !objectInput.trim()}
              className="gap-1 px-2 text-xs"
            >
              <Target className="h-3 w-3" />
              {computeEffectLabel(effectsCopy.objectCrop, isObjectCropActive)}
            </Button>
            {objectCropIndex !== -1 ? (
              <Button
                onClick={() => removeTransformationByKind("objectCrop")}
                size="sm"
                variant="outline"
                disabled={isProcessing}
                className="text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Minus className="h-3 w-3" />
                {effectsCopy.chipRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const editingSectionContent = (
    <div className="space-y-3">
      <div className={panelEffectClass("edit")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-violet-50 p-2 text-violet-600">
              <Wand2 className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{effectsCopy.labels.edit}</p>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.edit.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.edit.cost)}
            <ToggleSwitch
              checked={isEditActive}
              disabled={isProcessing || editIndex === -1}
              onCheckedChange={(value) => {
                if (editIndex === -1) {
                  if (value) void applyEdit();
                  return;
                }
                handleToggleTransformation(editIndex, value);
              }}
              label={effectsCopy.labels.edit}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <Input
            value={editPrompt}
            onChange={(event) => setEditPrompt(event.target.value)}
            placeholder={effectsCopy.edit.placeholder}
            disabled={isProcessing}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={applyEdit}
              size="sm"
              disabled={isProcessing || !editPrompt.trim()}
              className="gap-1 px-2 text-xs"
            >
              <Wand2 className="h-3 w-3" />
              {effectsCopy.edit.apply}
            </Button>
            {editIndex !== -1 ? (
              <Button
                onClick={() => removeTransformationByKind("edit")}
                size="sm"
                variant="outline"
                disabled={isProcessing}
                className="text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Minus className="h-3 w-3" />
                {effectsCopy.chipRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className={panelEffectClass("generativeFill")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-slate-50 p-2 text-slate-600">
              <Frame className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {effectsCopy.labels.generativeFill}
              </p>
              <p className="text-muted-foreground text-xs">
                {effectsCopy.generativeFill.helper}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderCreditBadge(effectsCopy.generativeFill.cost)}
            <ToggleSwitch
              checked={isGenerativeFillActive}
              disabled={isProcessing || generativeFillIndex === -1}
              onCheckedChange={(value) => {
                if (generativeFillIndex === -1) {
                  if (value) void applyGenerativeFill();
                  return;
                }
                handleToggleTransformation(generativeFillIndex, value);
              }}
              label={effectsCopy.labels.generativeFill}
            />
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={generativeWidth}
              onChange={(event) => setGenerativeWidth(event.target.value)}
              placeholder={effectsCopy.generativeFill.widthLabel}
              disabled={isProcessing}
              className="h-8 text-xs"
            />
            <Input
              type="number"
              value={generativeHeight}
              onChange={(event) => setGenerativeHeight(event.target.value)}
              placeholder={effectsCopy.generativeFill.heightLabel}
              disabled={isProcessing}
              className="h-8 text-xs"
            />
            <select
              value={generativeCropMode}
              onChange={(event) =>
                setGenerativeCropMode(
                  event.target.value as "pad_resize" | "pad_extract",
                )
              }
              disabled={isProcessing}
              className="border-input focus:ring-primary h-8 rounded-md border bg-white px-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="pad_resize">
                {effectsCopy.generativeFill.cropModeOptions.padResize}
              </option>
              <option value="pad_extract">
                {effectsCopy.generativeFill.cropModeOptions.padExtract}
              </option>
            </select>
          </div>
          <Input
            value={generativePrompt}
            onChange={(event) => setGenerativePrompt(event.target.value)}
            placeholder={effectsCopy.generativeFill.promptPlaceholder}
            disabled={isProcessing}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={applyGenerativeFill}
              size="sm"
              disabled={
                isProcessing ||
                Number(generativeWidth) <= 0 ||
                Number(generativeHeight) <= 0
              }
              className="gap-1 px-2 text-xs"
            >
              <Frame className="h-3 w-3" />
              {effectsCopy.generativeFill.apply}
            </Button>
            {generativeFillIndex !== -1 ? (
              <Button
                onClick={() => removeTransformationByKind("generativeFill")}
                size="sm"
                variant="outline"
                disabled={isProcessing}
                className="text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Minus className="h-3 w-3" />
                {effectsCopy.chipRemove}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const hasActiveTransformations = activeTransformationCount > 0;
  const hasAnyTransformations = transformations.length > 0;

  const adjustZoom = (delta: number) => {
    setZoomLevel((prev) =>
      clampNumber(Number((prev + delta).toFixed(2)), 1, 3),
    );
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const adjustPan = (direction: "up" | "down" | "left" | "right") => {
    const delta = 40;
    setPanOffset((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: clampNumber(prev.y - delta, -300, 300) };
        case "down":
          return { ...prev, y: clampNumber(prev.y + delta, -300, 300) };
        case "left":
          return { ...prev, x: clampNumber(prev.x - delta, -300, 300) };
        case "right":
          return { ...prev, x: clampNumber(prev.x + delta, -300, 300) };
        default:
          return prev;
      }
    });
  };

  const panelLayout = (variant: "desktop" | "mobile") => (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
            {effectsCopy.title}
          </h3>
          <p className="text-muted-foreground text-xs">
            {effectsCopy.subtitle}
          </p>
        </div>
        {variant === "mobile" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsControlSheetOpen(false)}
            className="h-7 w-7"
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      <div className="bg-muted/30 rounded-xl border border-dashed border-gray-300 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {effectsCopy.activeList.title}
            </p>
            {!hasActiveTransformations ? (
              <p className="text-muted-foreground text-xs">
                {effectsCopy.activeList.empty}
              </p>
            ) : null}
          </div>
          <span className="text-muted-foreground text-[11px] font-semibold uppercase">
            {formatTranslation(effectsCopy.activeLabel, {
              count: activeTransformationCount,
            })}
          </span>
        </div>

        {appliedTransformations.length > 0 ? (
          <div className="mt-3 space-y-2">
            {appliedTransformations.map(
              ({ descriptor, index, enabled, meta }) => (
                <div
                  key={`${descriptor.kind}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    enabled
                      ? "border-blue-200 bg-white"
                      : "border-gray-200 bg-gray-100"
                  } ${isEffectFocused(descriptor.kind) ? "ring-2 ring-blue-200" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {meta.label}
                    </p>
                    {meta.detail ? (
                      <p className="text-muted-foreground truncate text-xs">
                        {meta.detail}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ToggleSwitch
                      checked={enabled}
                      disabled={isProcessing}
                      onCheckedChange={(value) =>
                        handleToggleTransformation(index, value)
                      }
                      label={meta.label}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleEditTransformation(index)}
                      disabled={isProcessing}
                      aria-label="Edit transformation"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive h-7 w-7"
                      onClick={() => removeTransformationAt(index)}
                      disabled={isProcessing}
                      aria-label="Remove transformation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : null}
      </div>

      {renderSection("background", backgroundSectionContent)}
      {renderSection("enhancements", enhancementsSectionContent)}
      {renderSection("crop", cropSectionContent)}
      {renderSection("editing", editingSectionContent)}

      <div className="space-y-2 border-t pt-3">
        {hasAnyTransformations ? (
          <Button
            onClick={clearTransformations}
            disabled={isProcessing}
            variant="destructive"
            size="sm"
            className="w-full gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            {effectsCopy.clearAll}
          </Button>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={selectFile}
            size="sm"
            disabled={isProcessing}
            className="gap-1"
          >
            <Upload className="h-3 w-3" />
            {common.actions.upload}
          </Button>
          <Button
            onClick={downloadImage}
            size="sm"
            disabled={!hasActiveTransformations}
            className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-3 w-3" />
            {common.actions.download}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderControlPanel = (variant: "desktop" | "mobile") => {
    const content = panelLayout(variant);
    if (variant === "desktop") {
      return (
        <Card className="shadow-lg">
          <CardContent className="p-3 sm:p-4">{content}</CardContent>
        </Card>
      );
    }

    return <div className="space-y-4 p-2">{content}</div>;
  };

  const imageTransformStyle = useMemo(
    () => ({
      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
      transformOrigin: "center center",
    }),
    [panOffset, zoomLevel],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            {common.states.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="min-h-screen">
          {/* Top Navbar - Ultra Compact */}
          <div className="border-b border-gray-200 bg-white py-2">
            <div className="mx-auto max-w-7xl text-center">
              <h1 className="from-primary to-primary/70 mb-1 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                {createCopy.title}
              </h1>
              <p className="text-muted-foreground mx-auto max-w-xl text-xs">
                {createCopy.subtitle}
              </p>
            </div>
          </div>

          {/* Main Content Area - Effects and Preview */}
          <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6">
            {!uploadedImage ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="w-full max-w-2xl">
                  {isUploading ? (
                    <div className="border-border from-muted/50 via-background to-muted/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-center shadow-xl sm:p-12">
                      <div className="from-primary/5 to-primary/10 absolute inset-0 bg-gradient-to-br"></div>
                      <div className="relative z-10">
                        <div className="relative mb-6">
                          <div className="border-muted border-t-primary mx-auto h-16 w-16 animate-spin rounded-full border-4"></div>
                          <div
                            className="border-r-primary/70 absolute inset-0 mx-auto h-16 w-16 animate-spin rounded-full border-4 border-transparent"
                            style={{
                              animationDelay: "0.5s",
                              animationDirection: "reverse",
                            }}
                          />
                        </div>
                        <h3 className="text-foreground mb-2 text-lg font-bold">
                          {common.states.uploadingImage}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {common.states.uploadingDescription}
                        </p>
                        <div className="bg-muted mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full">
                          <div className="bg-primary h-full animate-pulse rounded-full" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group border-border from-muted/30 via-background to-muted/50 hover:border-primary/50 hover:bg-muted/40 relative overflow-hidden rounded-2xl border-2 border-dashed bg-gradient-to-br p-6 text-center transition-all duration-300 hover:shadow-xl sm:p-12">
                      <div className="from-primary/5 to-primary/10 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute top-4 right-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                        <ImageIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                        <Upload className="h-6 w-6 text-purple-400" />
                      </div>

                      <div className="relative z-10">
                        <div className="bg-primary mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                          <ImageIcon className="text-primary-foreground h-12 w-12" />
                        </div>
                        <h3 className="text-foreground mb-3 text-xl font-bold">
                          {uploadCopy.title}
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-600">
                          {uploadCopy.description}
                        </p>
                        <div className="mb-6">
                          <p className="mb-2 text-xs text-gray-500">
                            {uploadCopy.supportedFormats}
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            {uploadCopy.formats.map((format) => (
                              <span
                                key={format}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                              >
                                {format}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={selectFile}
                          size="default"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground transform gap-2 px-6 py-2 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                        >
                          <Upload className="h-4 w-4" />
                          {uploadCopy.chooseImage}
                        </Button>
                        <p className="mt-3 text-xs text-gray-500">
                          {uploadCopy.helperText}
                        </p>
                      </div>
                      <div className="bg-primary/10 absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={uploadFile}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-3">
                {/* Left */}
                <div className="order-2 space-y-2 sm:space-y-3 lg:order-1 lg:col-span-1">
                  <div className="lg:hidden">
                    <Sheet
                      open={isControlSheetOpen}
                      onOpenChange={setIsControlSheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex w-full items-center justify-between gap-2"
                        >
                          <span className="text-sm font-medium">
                            {effectsCopy.title}
                          </span>
                          <span className="text-muted-foreground text-xs uppercase">
                            {formatTranslation(effectsCopy.activeLabel, {
                              count: activeTransformationCount,
                            })}
                          </span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="bottom"
                        className="h-[85vh] overflow-y-auto p-0"
                      >
                        <SheetHeader className="border-b px-4 py-3">
                          <SheetTitle className="text-base font-semibold">
                            {effectsCopy.title}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="max-h-full overflow-y-auto p-4">
                          {panelLayout("mobile")}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="hidden lg:block">
                    {renderControlPanel("desktop")}
                  </div>
                  <div className="hidden">
                    <Card className="shadow-lg">
                      <CardContent className="p-2 sm:p-3">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="mb-0.5 text-sm font-bold">
                              {effectsCopy.title}
                            </h3>
                            <p className="text-muted-foreground text-xs">
                              {effectsCopy.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-muted/20 rounded-md border border-dashed border-gray-200 p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-muted-foreground text-xs font-semibold">
                                {effectsCopy.activeList.title}
                              </p>
                              <span className="text-muted-foreground text-[10px] font-medium uppercase">
                                {formatTranslation(effectsCopy.activeLabel, {
                                  count: transformations.length,
                                })}
                              </span>
                            </div>
                            {activeTransformations.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {activeTransformations.map(
                                  ({ meta, index }) => {
                                    const { label, detail } = meta;
                                    return (
                                      <button
                                        key={`${label}-${index}`}
                                        onClick={() =>
                                          removeTransformationAt(index)
                                        }
                                        disabled={isProcessing}
                                        className="flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-60"
                                      >
                                        <span>{label}</span>
                                        {detail ? (
                                          <span className="text-blue-500/70">
                                            • {detail}
                                          </span>
                                        ) : null}
                                        <X className="h-3 w-3" />
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {effectsCopy.activeList.empty}
                              </p>
                            )}
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3">
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold">
                                {effectsCopy.sections.background.title}
                              </h4>
                              <p className="text-muted-foreground text-xs">
                                {effectsCopy.sections.background.subtitle}
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="group relative">
                                  <Button
                                    onClick={() =>
                                      applyRemoveBackground("bgremove")
                                    }
                                    disabled={
                                      isProcessing ||
                                      isRemoveBackgroundBasicActive ||
                                      isRemoveBackgroundHdActive
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full gap-1 px-2 text-xs hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <Scissors className="h-3 w-3" />
                                    <span className="text-xs">
                                      {computeEffectLabel(
                                        effectsCopy.removeBackground,
                                        isRemoveBackgroundBasicActive,
                                      )}
                                    </span>
                                    {!isRemoveBackgroundBasicActive &&
                                      !isRemoveBackgroundHdActive &&
                                      effectsCopy.removeBackground.cost && (
                                        <span className="text-muted-foreground ml-1 text-[10px]">
                                          {effectsCopy.removeBackground.cost}
                                        </span>
                                      )}
                                  </Button>
                                  {isRemoveBackgroundBasicActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind(
                                          "removeBackground",
                                          (transform) =>
                                            transform.kind ===
                                              "removeBackground" &&
                                            (transform.strategy ??
                                              "bgremove") === "bgremove",
                                        )
                                      }
                                      disabled={isProcessing}
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                      <Minus className="h-2 w-2" />
                                    </Button>
                                  )}
                                </div>
                                <div className="group relative">
                                  <Button
                                    onClick={() =>
                                      applyRemoveBackground("removedotbg")
                                    }
                                    disabled={
                                      isProcessing ||
                                      isRemoveBackgroundHdActive ||
                                      isRemoveBackgroundBasicActive
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full gap-1 px-2 text-xs hover:border-orange-200 hover:bg-orange-50 disabled:opacity-50"
                                  >
                                    <Eraser className="h-3 w-3" />
                                    <span className="text-xs">
                                      {computeEffectLabel(
                                        effectsCopy.removeBackgroundHd,
                                        isRemoveBackgroundHdActive,
                                      )}
                                    </span>
                                    {!isRemoveBackgroundHdActive &&
                                      !isRemoveBackgroundBasicActive &&
                                      effectsCopy.removeBackgroundHd.cost && (
                                        <span className="text-muted-foreground ml-1 text-[10px]">
                                          {effectsCopy.removeBackgroundHd.cost}
                                        </span>
                                      )}
                                  </Button>
                                  {isRemoveBackgroundHdActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind(
                                          "removeBackground",
                                          (transform) =>
                                            transform.kind ===
                                              "removeBackground" &&
                                            transform.strategy ===
                                              "removedotbg",
                                        )
                                      }
                                      disabled={isProcessing}
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                      <Minus className="h-2 w-2" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <Palette className="h-3 w-3" />
                                    <span>
                                      {effectsCopy.labels.changeBackground}
                                    </span>
                                  </div>
                                  {effectsCopy.changeBackground.cost && (
                                    <span className="text-muted-foreground text-[10px] uppercase">
                                      {effectsCopy.changeBackground.cost}
                                    </span>
                                  )}
                                </div>
                                <Input
                                  value={changeBackgroundPrompt}
                                  onChange={(event) =>
                                    setChangeBackgroundPrompt(
                                      event.target.value,
                                    )
                                  }
                                  placeholder={
                                    effectsCopy.changeBackground.placeholder
                                  }
                                  disabled={isProcessing}
                                  className="h-8 text-xs"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    onClick={applyChangeBackground}
                                    size="sm"
                                    disabled={
                                      isProcessing || isChangeBackgroundActive
                                    }
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <Palette className="h-3 w-3" />
                                    <span>
                                      {effectsCopy.changeBackground.apply}
                                    </span>
                                  </Button>
                                  {isChangeBackgroundActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind(
                                          "changeBackground",
                                        )
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {effectsCopy.changeBackground.helper}
                                </p>
                              </div>

                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <SunMedium className="h-3 w-3" />
                                    <span>{effectsCopy.labels.dropShadow}</span>
                                  </div>
                                  {effectsCopy.dropShadow.cost && (
                                    <span className="text-muted-foreground text-[10px] uppercase">
                                      {effectsCopy.dropShadow.cost}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {effectsCopy.dropShadow.helper}
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  <Input
                                    type="number"
                                    value={dropShadowAzimuth}
                                    onChange={(event) =>
                                      setDropShadowAzimuth(event.target.value)
                                    }
                                    min={0}
                                    max={360}
                                    placeholder={
                                      effectsCopy.dropShadow.azimuthLabel
                                    }
                                    aria-label={
                                      effectsCopy.dropShadow.azimuthLabel
                                    }
                                    disabled={isProcessing}
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={dropShadowElevation}
                                    onChange={(event) =>
                                      setDropShadowElevation(event.target.value)
                                    }
                                    min={0}
                                    max={90}
                                    placeholder={
                                      effectsCopy.dropShadow.elevationLabel
                                    }
                                    aria-label={
                                      effectsCopy.dropShadow.elevationLabel
                                    }
                                    disabled={isProcessing}
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={dropShadowSaturation}
                                    onChange={(event) =>
                                      setDropShadowSaturation(
                                        event.target.value,
                                      )
                                    }
                                    min={0}
                                    max={100}
                                    placeholder={
                                      effectsCopy.dropShadow.saturationLabel
                                    }
                                    aria-label={
                                      effectsCopy.dropShadow.saturationLabel
                                    }
                                    disabled={isProcessing}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    onClick={applyDropShadow}
                                    size="sm"
                                    disabled={
                                      isProcessing || isDropShadowActive
                                    }
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <SunMedium className="h-3 w-3" />
                                    <span>
                                      {computeEffectLabel(
                                        effectsCopy.dropShadow,
                                        isDropShadowActive,
                                      )}
                                    </span>
                                  </Button>
                                  {isDropShadowActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind("dropShadow")
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3">
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold">
                                {effectsCopy.sections.enhancements.title}
                              </h4>
                              <p className="text-muted-foreground text-xs">
                                {effectsCopy.sections.enhancements.subtitle}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <div className="group relative">
                                <Button
                                  onClick={applyRetouch}
                                  disabled={isProcessing || isRetouchActive}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-full gap-1 px-2 text-xs hover:border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  <span className="text-xs">
                                    {computeEffectLabel(
                                      effectsCopy.retouch,
                                      isRetouchActive,
                                    )}
                                  </span>
                                  {!isRetouchActive &&
                                    effectsCopy.retouch.cost && (
                                      <span className="text-muted-foreground ml-1 text-[10px]">
                                        {effectsCopy.retouch.cost}
                                      </span>
                                    )}
                                </Button>
                                {isRetouchActive && (
                                  <Button
                                    onClick={() =>
                                      removeTransformationByKind("retouch")
                                    }
                                    disabled={isProcessing}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Minus className="h-2 w-2" />
                                  </Button>
                                )}
                              </div>
                              <div className="group relative">
                                <Button
                                  onClick={applyUpscale}
                                  disabled={isProcessing || isUpscaleActive}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-full gap-1 px-2 text-xs hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                                >
                                  <Expand className="h-3 w-3" />
                                  <span className="text-xs">
                                    {computeEffectLabel(
                                      effectsCopy.upscale,
                                      isUpscaleActive,
                                    )}
                                  </span>
                                  {!isUpscaleActive &&
                                    effectsCopy.upscale.cost && (
                                      <span className="text-muted-foreground ml-1 text-[10px]">
                                        {effectsCopy.upscale.cost}
                                      </span>
                                    )}
                                </Button>
                                {isUpscaleActive && (
                                  <Button
                                    onClick={() =>
                                      removeTransformationByKind("upscale")
                                    }
                                    disabled={isProcessing}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Minus className="h-2 w-2" />
                                  </Button>
                                )}
                              </div>
                              <div className="group relative">
                                <Button
                                  onClick={applyVariation}
                                  disabled={isProcessing || isVariationActive}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-full gap-1 px-2 text-xs hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                                >
                                  <Shuffle className="h-3 w-3" />
                                  <span className="text-xs">
                                    {computeEffectLabel(
                                      effectsCopy.variation,
                                      isVariationActive,
                                    )}
                                  </span>
                                  {!isVariationActive &&
                                    effectsCopy.variation.cost && (
                                      <span className="text-muted-foreground ml-1 text-[10px]">
                                        {effectsCopy.variation.cost}
                                      </span>
                                    )}
                                </Button>
                                {isVariationActive && (
                                  <Button
                                    onClick={() =>
                                      removeTransformationByKind(
                                        "generateVariation",
                                      )
                                    }
                                    disabled={isProcessing}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Minus className="h-2 w-2" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3">
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold">
                                {effectsCopy.sections.crop.title}
                              </h4>
                              <p className="text-muted-foreground text-xs">
                                {effectsCopy.sections.crop.subtitle}
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="group relative">
                                <Button
                                  onClick={applySmartCrop}
                                  disabled={isProcessing || isSmartCropActive}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-full gap-1 px-2 text-xs hover:border-green-200 hover:bg-green-50 disabled:opacity-50"
                                >
                                  <Crop className="h-3 w-3" />
                                  <span className="text-xs">
                                    {computeEffectLabel(
                                      effectsCopy.smartCrop,
                                      isSmartCropActive,
                                    )}
                                  </span>
                                  {!isSmartCropActive && (
                                    <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                                      {effectsCopy.smartCrop.badge}
                                    </span>
                                  )}
                                </Button>
                                {isSmartCropActive && (
                                  <Button
                                    onClick={() =>
                                      removeTransformationByKind("smartCrop")
                                    }
                                    disabled={isProcessing}
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full border-red-200 p-0 text-red-600 opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Minus className="h-2 w-2" />
                                  </Button>
                                )}
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {effectsCopy.smartCrop.helper}
                                </p>
                              </div>

                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                  <Smile className="h-3 w-3" />
                                  <span>{effectsCopy.labels.faceCrop}</span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {effectsCopy.faceCrop.helper}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Input
                                    value={faceCropZoom}
                                    onChange={(event) =>
                                      setFaceCropZoom(event.target.value)
                                    }
                                    placeholder={effectsCopy.faceCrop.zoomLabel}
                                    aria-label={effectsCopy.faceCrop.zoomLabel}
                                    disabled={isProcessing || isFaceCropActive}
                                    className="h-8 text-xs"
                                  />
                                  <Button
                                    onClick={applyFaceCrop}
                                    size="sm"
                                    disabled={isProcessing || isFaceCropActive}
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <Smile className="h-3 w-3" />
                                    <span>
                                      {computeEffectLabel(
                                        effectsCopy.faceCrop,
                                        isFaceCropActive,
                                      )}
                                    </span>
                                  </Button>
                                  {isFaceCropActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind("faceCrop")
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {effectsCopy.faceCrop.zoomHelper}
                                </p>
                              </div>

                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <Target className="h-3 w-3" />
                                    <span>{effectsCopy.objectCrop.title}</span>
                                  </div>
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    {effectsCopy.objectCrop.badge}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {effectsCopy.objectCrop.helper}
                                </p>
                                <Input
                                  value={objectInput}
                                  onChange={(event) =>
                                    setObjectInput(event.target.value)
                                  }
                                  placeholder={
                                    effectsCopy.objectCrop.placeholder
                                  }
                                  disabled={isProcessing || isObjectCropActive}
                                  className="mt-2 h-8 text-xs"
                                />
                                <Input
                                  value={objectAspectRatio}
                                  onChange={(event) =>
                                    setObjectAspectRatio(event.target.value)
                                  }
                                  placeholder={
                                    effectsCopy.objectCrop.aspectPlaceholder
                                  }
                                  disabled={isProcessing || isObjectCropActive}
                                  className="mt-2 h-8 text-xs"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    onClick={applyObjectCrop}
                                    size="sm"
                                    disabled={
                                      isProcessing ||
                                      isObjectCropActive ||
                                      !objectInput.trim()
                                    }
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <Target className="h-3 w-3" />
                                    <span>
                                      {computeEffectLabel(
                                        effectsCopy.objectCrop,
                                        isObjectCropActive,
                                      )}
                                    </span>
                                  </Button>
                                  {isObjectCropActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind("objectCrop")
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-md border border-gray-200 bg-white p-2 sm:p-3">
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold">
                                {effectsCopy.sections.editing.title}
                              </h4>
                              <p className="text-muted-foreground text-xs">
                                {effectsCopy.sections.editing.subtitle}
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <Wand2 className="h-3 w-3" />
                                    <span>{effectsCopy.labels.edit}</span>
                                  </div>
                                  {effectsCopy.edit.cost && (
                                    <span className="text-muted-foreground text-[10px] uppercase">
                                      {effectsCopy.edit.cost}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {effectsCopy.edit.helper}
                                </p>
                                <Input
                                  value={editPrompt}
                                  onChange={(event) =>
                                    setEditPrompt(event.target.value)
                                  }
                                  placeholder={effectsCopy.edit.placeholder}
                                  disabled={isProcessing || isEditActive}
                                  className="mt-2 h-8 text-xs"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    onClick={applyEdit}
                                    size="sm"
                                    disabled={isProcessing || isEditActive}
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <Wand2 className="h-3 w-3" />
                                    <span>{effectsCopy.edit.apply}</span>
                                  </Button>
                                  {isEditActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind("edit")
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-md border border-dashed border-gray-200 px-2 py-2">
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <Frame className="h-3 w-3" />
                                    <span>
                                      {effectsCopy.labels.generativeFill}
                                    </span>
                                  </div>
                                  {effectsCopy.generativeFill.cost && (
                                    <span className="text-muted-foreground text-[10px] uppercase">
                                      {effectsCopy.generativeFill.cost}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                  {effectsCopy.generativeFill.helper}
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  <Input
                                    type="number"
                                    value={generativeWidth}
                                    onChange={(event) =>
                                      setGenerativeWidth(event.target.value)
                                    }
                                    placeholder={
                                      effectsCopy.generativeFill.widthLabel
                                    }
                                    aria-label={
                                      effectsCopy.generativeFill.widthLabel
                                    }
                                    min={1}
                                    disabled={
                                      isProcessing || isGenerativeFillActive
                                    }
                                    className="h-8 text-xs"
                                  />
                                  <Input
                                    type="number"
                                    value={generativeHeight}
                                    onChange={(event) =>
                                      setGenerativeHeight(event.target.value)
                                    }
                                    placeholder={
                                      effectsCopy.generativeFill.heightLabel
                                    }
                                    aria-label={
                                      effectsCopy.generativeFill.heightLabel
                                    }
                                    min={1}
                                    disabled={
                                      isProcessing || isGenerativeFillActive
                                    }
                                    className="h-8 text-xs"
                                  />
                                  <select
                                    value={generativeCropMode}
                                    onChange={(event) =>
                                      setGenerativeCropMode(
                                        event.target.value as
                                          | "pad_resize"
                                          | "pad_extract",
                                      )
                                    }
                                    disabled={
                                      isProcessing || isGenerativeFillActive
                                    }
                                    className="border-input focus:ring-primary h-8 rounded-md border bg-white px-2 text-xs focus:ring-2 focus:outline-none"
                                  >
                                    <option value="pad_resize">
                                      {
                                        effectsCopy.generativeFill
                                          .cropModeOptions.padResize
                                      }
                                    </option>
                                    <option value="pad_extract">
                                      {
                                        effectsCopy.generativeFill
                                          .cropModeOptions.padExtract
                                      }
                                    </option>
                                  </select>
                                </div>
                                <Input
                                  value={generativePrompt}
                                  onChange={(event) =>
                                    setGenerativePrompt(event.target.value)
                                  }
                                  placeholder={
                                    effectsCopy.generativeFill.promptPlaceholder
                                  }
                                  disabled={
                                    isProcessing || isGenerativeFillActive
                                  }
                                  className="mt-2 h-8 text-xs"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                  <Button
                                    onClick={applyGenerativeFill}
                                    size="sm"
                                    disabled={
                                      isProcessing || isGenerativeFillActive
                                    }
                                    className="h-7 gap-1 px-2 text-xs"
                                  >
                                    <Frame className="h-3 w-3" />
                                    <span>
                                      {effectsCopy.generativeFill.apply}
                                    </span>
                                  </Button>
                                  {isGenerativeFillActive && (
                                    <Button
                                      onClick={() =>
                                        removeTransformationByKind(
                                          "generativeFill",
                                        )
                                      }
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {transformations.length > 0 && (
                            <Button
                              onClick={clearTransformations}
                              disabled={isProcessing}
                              variant="destructive"
                              size="sm"
                              className="h-7 w-full gap-1 px-2"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span className="text-xs">
                                {effectsCopy.clearAll}
                              </span>
                            </Button>
                          )}

                          <div className="grid gap-2 border-t pt-2 sm:grid-cols-2">
                            <Button
                              variant="outline"
                              onClick={selectFile}
                              size="sm"
                              className="h-7 gap-1 px-2"
                            >
                              <Upload className="h-3 w-3" />
                              <span className="text-xs">
                                {common.actions.upload}
                              </span>
                            </Button>
                            {transformations.length > 0 && (
                              <Button
                                onClick={downloadImage}
                                size="sm"
                                className="h-7 gap-1 bg-gradient-to-r from-blue-600 to-purple-600 px-2 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Download className="h-3 w-3" />
                                <span className="text-xs">
                                  {common.actions.download}
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Right - Preview */}
                <div className="order-1 space-y-2 sm:space-y-3 lg:order-2 lg:col-span-2">
                  <Card className="shadow-lg">
                    <CardContent className="space-y-4 p-2 sm:p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-foreground mb-0.5 text-sm font-bold">
                            {createCopy.preview.title}
                          </h3>
                          <p className="text-muted-foreground truncate text-xs">
                            {uploadedImage.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedImage(null)}
                          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 rounded-full p-0"
                          aria-label={createCopy.preview.removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="bg-muted relative overflow-hidden rounded-lg border">
                        <div className="relative aspect-[4/3] w-full">
                          <div className="absolute inset-0">
                            <ImageKitImage
                              urlEndpoint={
                                env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                              }
                              src={uploadedImage.filePath}
                              alt={uploadedImage.name}
                              width={800}
                              height={600}
                              className="h-full w-full object-contain"
                              style={imageTransformStyle}
                              transformation={liveTransformations}
                            />
                          </div>

                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${compareValue}%` }}
                          >
                            <ImageKitImage
                              urlEndpoint={
                                env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                              }
                              src={uploadedImage.filePath}
                              alt={`${uploadedImage.name} original`}
                              width={800}
                              height={600}
                              className="h-full w-full object-contain"
                              style={imageTransformStyle}
                              transformation={[]}
                            />
                          </div>

                          <div
                            className="absolute inset-y-0"
                            style={{ left: `${compareValue}%` }}
                          >
                            <div className="flex h-full w-0.5 -translate-x-1/2 items-center justify-center bg-white/60">
                              <div className="rounded-full bg-white p-1 shadow">
                                <GripVertical className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                          </div>

                          {isProcessing && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                              <div className="text-center text-white">
                                <div className="relative mb-2">
                                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                </div>
                                <p className="text-sm font-semibold">
                                  {createCopy.preview.processing}
                                </p>
                                <p className="mt-1 text-xs text-white/80">
                                  {createCopy.preview.pleaseWait}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                          <span className="text-muted-foreground text-xs font-medium">
                            Before
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={compareValue}
                            onChange={(event) =>
                              setCompareValue(Number(event.target.value))
                            }
                            className="flex-1"
                            aria-label="Before and after slider"
                          />
                          <span className="text-muted-foreground text-xs font-medium">
                            After
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustZoom(-0.2)}
                            disabled={zoomLevel <= 1.01}
                            aria-label="Zoom out"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustZoom(0.2)}
                            disabled={zoomLevel >= 2.99}
                            aria-label="Zoom in"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetView}
                            className="text-xs"
                          >
                            Reset
                          </Button>
                          <span className="text-muted-foreground text-xs">
                            {zoomLevel.toFixed(1)}×
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustPan("up")}
                            aria-label="Pan up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustPan("left")}
                            aria-label="Pan left"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={resetView}
                            aria-label="Reset view"
                          >
                            <Target className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustPan("right")}
                            aria-label="Pan right"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustPan("down")}
                            aria-label="Pan down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Recents */}
          <div className="border-t border-gray-200 bg-white px-2 py-3 sm:px-4 sm:py-4">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 text-center">
                <div className="mb-2 inline-flex items-center gap-2">
                  <div className="h-6 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
                  <h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
                    {recentsCopy.title}
                  </h2>
                  <div className="h-6 w-0.5 rounded-full bg-gradient-to-b from-purple-600 to-blue-500" />
                </div>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  {recentsCopy.subtitle}
                </p>
              </div>
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <div className="animate-reverse absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-r-purple-600" />
              </div>
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold text-gray-900">
                  {recentsCopy.loadingTitle}
                </p>
                <p className="text-muted-foreground text-sm">
                  {recentsCopy.loadingSubtitle}
                </p>
              </div>
            </div>
          ) : userProjects.length > 0 ? (
            <div className="mb-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {userProjects.slice(0, 12).map((project) => (
                  <div
                    key={project.id}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      setUploadedImage({
                        fileId: project.imageKitId,
                        url: project.imageUrl,
                        name: project.name ?? projectsCopy.card.untitled,
                        filePath: project.filePath,
                      });
                      setTransformations([]);
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 transition-all duration-500 group-hover:from-blue-500/20 group-hover:to-purple-600/20" />
                      <div className="relative h-full w-full overflow-hidden">
                        <ImageKitImage
                          urlEndpoint={env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                          src={project.filePath}
                          alt={project.name ?? projectsCopy.card.untitled}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          transformation={[
                            {
                              width: 300,
                              height: 300,
                              crop: "maintain_ratio",
                              quality: 90,
                            },
                          ]}
                        />
                        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-transform duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 transform bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                        <div className="space-y-1">
                          <h3 className="truncate text-sm font-bold text-white drop-shadow-lg">
                            {project.name ?? projectsCopy.card.untitled}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/90 drop-shadow-md">
                              {new Intl.DateTimeFormat(lang, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(project.createdAt))}
                            </p>
                            <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <div className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
                                <span className="text-xs font-medium text-white">
                                  {recentsCopy.editLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 h-0 w-0 border-t-[20px] border-l-[20px] border-t-blue-500 border-l-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>

              {userProjects.length > 12 && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-700">
                      {formatTranslation(recentsCopy.showingCount, {
                        count: Math.min(12, userProjects.length),
                        total: userProjects.length,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="relative mx-auto mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-blue-100 to-purple-100" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-blue-200 to-purple-200"
                    style={{ animationDelay: "1s" }}
                  />
                </div>
                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white shadow-lg">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {recentsCopy.emptyTitle}
                </h3>
                <p className="text-muted-foreground mx-auto max-w-md text-lg leading-relaxed">
                  {recentsCopy.emptyDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}
