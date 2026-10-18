import React, { useState, useEffect } from 'react';
import { convertMetafileToSvg } from 'emf-converter';

/**
 * Chemistry Formula and Text Rendering Engine for "HỌC HÓA CÙNG THẦY THIỆN"
 * Guarantees preservation of:
 * - Subscripts (H₂O, CO₂, Na₂SO₄)
 * - Superscripts & Ion Charges (SO₄²⁻, NH₄⁺, Fe³⁺, Al³⁺, OH⁻)
 * - Double & Triple Bonds (CH₂=CH₂, CH≡CH)
 * - Reaction Arrows (→, ⇄, ⇌, ⎯⎯→)
 * - Tables and Experiment grids with visible borders and responsive scroll
 * - Illustrations, reaction schemas, and apparatus diagrams
 */

/**
 * Formats chemistry formulas in plain text if needed
 */
export function formatChemistryText(rawText: string): string {
  if (!rawText) return '';

  if (/<(sub|sup|b|i|u|span|img|table)[^>]*>/i.test(rawText)) {
    return rawText;
  }

  return rawText
    .replace(/<->/g, '⇄')
    .replace(/<=>/g, '⇌')
    .replace(/->/g, '→')
    .replace(/===/g, '≡');
}

/**
 * Helper component that renders an image source, auto-converting WMF if encountered
 */
const SafeImage: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt = '', className = '' }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);

  useEffect(() => {
    if (src.includes('wmf') || src.includes('emf')) {
      try {
        const base64 = src.replace(/^data:image\/[^;]+;base64,/, '');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        convertMetafileToSvg(bytes.buffer).then(svg => {
          if (svg && typeof svg === 'string') {
            setResolvedSrc(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
          }
        }).catch(err => console.warn('Could not render WMF image', err));
      } catch (e) {
        console.warn('WMF decode error', e);
      }
    } else {
      setResolvedSrc(src);
    }
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

/**
 * React Component to render rich chemistry question text safely.
 * Preserves bold, italic, underline, subscripts, superscripts, tables, line breaks, and chemical equations.
 */
export const ChemistryRenderer: React.FC<{
  content: string;
  className?: string;
  images?: string[];
}> = ({ content, className = '', images = [] }) => {
  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  // Avoid duplicate rendering: if an image is already in HTML content, don't show it twice
  const attachedImages = (images || []).filter(imgSrc => {
    if (!imgSrc) return false;
    const sample = imgSrc.slice(0, 60);
    return !content.includes(sample);
  });

  return (
    <div className={`chemistry-content ${className} leading-relaxed text-slate-800`}>
      {isHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose-slate max-w-none overflow-x-auto
            [&_sub]:text-[0.75em] [&_sub]:bottom-[-0.2em] 
            [&_sup]:text-[0.75em] [&_sup]:top-[-0.35em] 
            [&_u]:underline [&_u]:decoration-teal-600 [&_u]:decoration-2 
            [&_table]:w-full [&_table]:my-3.5 [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_table]:rounded-xl [&_table]:shadow-2xs
            [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100/90 [&_th]:p-2.5 [&_th]:text-xs sm:[&_th]:text-sm [&_th]:font-bold [&_th]:text-slate-900 [&_th]:text-center
            [&_td]:border [&_td]:border-slate-300 [&_td]:p-2.5 [&_td]:text-xs sm:[&_td]:text-sm [&_td]:text-slate-800
            [&_tr:hover]:bg-slate-50/70
            [&_img]:max-h-80 [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_img]:my-3 [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:bg-white [&_img]:p-1.5 [&_img]:shadow-xs"
        />
      ) : (
        <span className="whitespace-pre-line">{content}</span>
      )}

      {/* Render attached illustrations only if not already in content */}
      {attachedImages.length > 0 && (
        <div className="mt-3.5 grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl">
          {attachedImages.map((imgSrc, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xs"
            >
              <SafeImage
                src={imgSrc}
                alt="Hình minh họa câu hỏi"
                className="max-h-72 w-full object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
