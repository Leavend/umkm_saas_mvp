import Image from "next/image";

interface PromptContentProps {
  imageUrl: string;
  title: string;
  text: string;
}

export function PromptContent({ imageUrl, title, text }: PromptContentProps) {
  return (
    <>
      {/* Image */}
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-slate-100 sm:mb-6 sm:h-64 md:h-80">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc(100vw - 3rem), (max-width: 1024px) calc(100vw - 3rem), 896px"
        />
      </div>

      {/* Description */}
      <div className="mb-4 sm:mb-6">
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          Description
        </h3>
        <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
          {text}
        </p>
      </div>
    </>
  );
}
