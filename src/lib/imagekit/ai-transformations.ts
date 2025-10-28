import type { Transformation } from "@imagekit/javascript/dist/interfaces/Transformation";

type PromptEncoding = "auto" | "base64Url";

type BaseDescriptor = {
  enabled?: boolean;
};

export type AiTransformationDescriptor =
  | ({
      kind: "removeBackground";
      strategy?: "bgremove" | "removedotbg";
    } & BaseDescriptor)
  | ({
      kind: "changeBackground";
      prompt: string;
      encoding?: PromptEncoding;
    } & BaseDescriptor)
  | ({
      kind: "dropShadow";
      azimuth?: number;
      elevation?: number;
      saturation?: number;
    } & BaseDescriptor)
  | ({
      kind: "retouch";
    } & BaseDescriptor)
  | ({
      kind: "upscale";
    } & BaseDescriptor)
  | ({
      kind: "smartCrop";
    } & BaseDescriptor)
  | ({
      kind: "objectCrop";
      object: string;
      aspectRatio?: string;
    } & BaseDescriptor)
  | ({
      kind: "faceCrop";
      zoom?: number;
    } & BaseDescriptor)
  | ({
      kind: "generativeFill";
      width: number;
      height: number;
      cropMode?: "pad_resize" | "pad_extract";
      prompt?: string;
      encoding?: PromptEncoding;
    } & BaseDescriptor)
  | ({
      kind: "edit";
      prompt: string;
      encoding?: PromptEncoding;
    } & BaseDescriptor)
  | ({
      kind: "generateVariation";
    } & BaseDescriptor)
  | ({
      kind: "raw";
      value: string;
    } & BaseDescriptor);

export const buildAiTransformationChain = (
  descriptors: AiTransformationDescriptor[],
): Transformation[] => {
  const chain: Transformation[] = [];

  descriptors.forEach((descriptor) => {
    if (descriptor.enabled === false) {
      return;
    }
    switch (descriptor.kind) {
      case "removeBackground": {
        chain.push(
          descriptor.strategy === "removedotbg"
            ? { aiRemoveBackgroundExternal: true }
            : { aiRemoveBackground: true },
        );
        break;
      }

      case "changeBackground": {
        if (!descriptor.prompt?.trim()) {
          break;
        }

        const value = buildPromptToken(
          "changeBackground",
          descriptor.prompt,
          descriptor.encoding,
        );
        chain.push({ aiChangeBackground: value });
        break;
      }

      case "dropShadow": {
        const { azimuth, elevation, saturation } = descriptor;
        const tokens: string[] = [];

        if (isFiniteNumber(azimuth)) {
          tokens.push(`az-${clamp(azimuth, 0, 360)}`);
        }
        if (isFiniteNumber(elevation)) {
          tokens.push(`_el-${clamp(elevation, 0, 90)}`);
        }
        if (isFiniteNumber(saturation)) {
          tokens.push(`_st-${clamp(saturation, 0, 100)}`);
        }

        chain.push({
          aiDropShadow: tokens.length > 0 ? tokens.join(":") : true,
        });
        break;
      }

      case "retouch": {
        chain.push({ aiRetouch: true });
        break;
      }

      case "upscale": {
        chain.push({ aiUpscale: true });
        break;
      }

      case "smartCrop": {
        chain.push({ focus: "auto" });
        break;
      }

      case "objectCrop": {
        const object = descriptor.object
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase();
        if (!object) break;

        const ratio = formatAspectRatio(descriptor.aspectRatio);
        const parts = [`fo-${object}`];
        if (ratio) {
          parts.push(`ar-${ratio}`);
        }

        chain.push({ raw: parts.join(",") });
        break;
      }

      case "faceCrop": {
        const transform: Transformation = { focus: "face" };
        if (isFiniteNumber(descriptor.zoom)) {
          transform.zoom = descriptor.zoom;
        }
        chain.push(transform);
        break;
      }

      case "generativeFill": {
        const transform: Transformation = {
          width: descriptor.width,
          height: descriptor.height,
          cropMode: descriptor.cropMode ?? "pad_resize",
        };

        transform.background = buildPromptToken(
          "generativeFill",
          descriptor.prompt,
          descriptor.encoding,
        );

        chain.push(transform);
        break;
      }

      case "edit": {
        if (!descriptor.prompt?.trim()) {
          break;
        }

        const token = buildPromptToken(
          "edit",
          descriptor.prompt,
          descriptor.encoding,
        );
        chain.push({ raw: `e-edit-${token}` });
        break;
      }

      case "generateVariation": {
        chain.push({ aiVariation: true });
        break;
      }

      case "raw": {
        if (descriptor.value.trim()) {
          chain.push({ raw: descriptor.value.trim() });
        }
        break;
      }
    }
  });

  return chain;
};

const buildPromptToken = (
  kind: "changeBackground" | "generativeFill" | "edit",
  prompt?: string,
  encoding: PromptEncoding = "auto",
): string => {
  if (!prompt?.trim()) {
    return kind === "generativeFill" ? "genfill" : "";
  }

  const trimmed = prompt.trim();

  if (encoding === "base64Url") {
    const encoded = encodeURIComponent(toBase64Url(trimmed));
    if (kind === "generativeFill") {
      return `genfill-prompte-${encoded}`;
    }
    return `prompte-${encoded}`;
  }

  const encoded = encodeURIComponent(trimmed);

  if (kind === "generativeFill") {
    return `genfill-prompt-${encoded}`;
  }
  return `prompt-${encoded}`;
};

const formatAspectRatio = (value?: string): string | undefined => {
  if (!value) return undefined;
  const sanitized = value.trim();
  if (!sanitized) return undefined;
  return sanitized.replace(/[\s:_]+/g, "-");
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toBase64Url = (value: string): string => {
  const globalScope = globalThis as unknown as {
    btoa?: (data: string) => string;
    Buffer?: {
      from: (
        input: string,
        encoding?: string,
      ) => { toString: (encoding?: string) => string };
    };
  };

  const bufferResult = globalScope.Buffer?.from?.(value, "utf-8")?.toString(
    "base64",
  );
  if (bufferResult !== undefined) {
    return bufferResult;
  }

  const binary = stringToBinary(value);

  const globalEncoded = globalScope.btoa?.(binary);
  if (globalEncoded !== undefined) {
    return globalEncoded;
  }

  // Final fallback using manual encoding
  let output = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let i = 0;
  while (i < binary.length) {
    const c1 = binary.charCodeAt(i++);
    const c2 = binary.charCodeAt(i++);
    const c3 = binary.charCodeAt(i++);

    const c2Valid = !Number.isNaN(c2);
    const c3Valid = !Number.isNaN(c3);

    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2Valid ? c2 >> 4 : 0);
    const e3 = c2Valid ? ((c2 & 15) << 2) | (c3Valid ? c3 >> 6 : 0) : 64;
    const e4 = c3Valid ? c3 & 63 : 64;

    output +=
      chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }

  return output;
};

const stringToBinary = (value: string): string => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return binary;
};
