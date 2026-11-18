"use client";

import { useRef, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, ChevronDown, Code, ImagePlus, Italic, List, Maximize2, Minimize2, Strikethrough, Underline, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VIDEO_HOST_PATTERN, videoPlatform } from "@/lib/video";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** A video link placed in the story. It plays on the published story page. */
const VideoLink = Node.create({
  name: "videoLink",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { url: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-video-link]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-video-link": "" })];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.className = "my-6 flex items-center justify-between gap-4 border border-white/15 bg-surface p-4 text-sm";
      const label = document.createElement("span");
      label.className = "text-reading/80";
      label.textContent = `Video on ${videoPlatform(String(node.attrs.url))}: ${node.attrs.url}`;
      dom.appendChild(label);
      return { dom };
    };
  },
});

const toolbarButton = "inline-flex size-9 items-center justify-center border border-transparent text-reading/70 transition-colors duration-200 hover:border-white/20 hover:text-reading data-[active=true]:border-gold data-[active=true]:text-gold";

/**
 * A story editor with the same tools as the Studio: paragraphs, headings, quotes, bold, italic,
 * images and video links. The value is the Tiptap document as JSON.
 */
export function StoryEditor({ value, onChange, invalid }: { value: string; onChange: (value: string) => void; invalid?: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, force] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2] } }), Image.configure({ allowBase64: true }), VideoLink],
    content: parseValue(value),
    editorProps: {
      attributes: {
        class: cn("story-editor-content min-h-[18rem] px-4 py-3 text-[1.0625rem] leading-[1.8] text-reading focus:outline-none", invalid && "bg-danger/5"),
        "aria-label": "Your story",
      },
      // Paste an image straight into the text, as well as using the Image button.
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) =>
          readImage(file, (src) => {
            const node = view.state.schema.nodes.image?.create({ src, alt: file.name });
            if (node) view.dispatch(view.state.tr.replaceSelectionWith(node));
          }),
        );
        return true;
      },
      // Drag an image into the text.
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) =>
          readImage(file, (src) => {
            const node = view.state.schema.nodes.image?.create({ src, alt: file.name });
            if (node) view.dispatch(view.state.tr.replaceSelectionWith(node));
          }),
        );
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(JSON.stringify(e.getJSON()));
      force((n) => n + 1);
    },
  });

  if (!editor) return <div className="h-72 animate-pulse bg-surface" aria-hidden="true" />;

  const addVideo = () => {
    const url = videoUrl.trim();
    if (!VIDEO_HOST_PATTERN.test(url)) {
      setVideoError("Use a YouTube, Vimeo or Instagram link.");
      return;
    }
    editor.chain().focus().insertContent({ type: "videoLink", attrs: { url } }).run();
    setVideoUrl("");
    setVideoError(null);
    setVideoOpen(false);
  };

  /** Reads an image file and passes it on. Unsupported or oversized files are explained, not ignored. */
  const readImage = (file: File, onSrc: (src: string) => void) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setImageError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Keep the image under 3 MB.");
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => onSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const addImage = (file: File | undefined) => {
    if (!file) return;
    readImage(file, (src) => {
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    });
  };

  return (
    <div className={cn("border bg-[#131316]", invalid ? "border-[#ee8585]" : "border-white/20", expanded && "fixed inset-0 z-50 flex flex-col overflow-auto border-0 bg-background p-6 sm:p-10")}>
      <div role="toolbar" aria-label="Story formatting" className="flex flex-wrap items-center gap-1 border-b border-white/15 px-3 py-2">
        <div className="relative">
        <select
          aria-label="Text style"
          className="h-9 appearance-none border border-white/20 bg-transparent py-0 pl-3 pr-9 text-sm text-reading focus:border-gold focus:outline-none"
          value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("blockquote") ? "quote" : "normal"}
          onChange={(e) => {
            const chain = editor.chain().focus();
            if (e.target.value === "h2") chain.setHeading({ level: 2 }).run();
            else if (e.target.value === "quote") chain.setBlockquote().run();
            else chain.setParagraph().run();
          }}
        >
          <option value="normal">Normal</option>
          <option value="h2">Heading</option>
          <option value="quote">Quote</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-reading/60" aria-hidden="true" />
        </div>
        <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
        <button type="button" className={toolbarButton} data-active={editor.isActive("bold")} aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={toolbarButton} data-active={editor.isActive("italic")} aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={toolbarButton} data-active={editor.isActive("code")} aria-label="Code" onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={toolbarButton} data-active={editor.isActive("underline")} aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className="size-4" aria-hidden="true" />
        </button>
        <button type="button" className={toolbarButton} data-active={editor.isActive("strike")} aria-label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" aria-hidden="true" />
        </button>
        <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
        <button type="button" className={toolbarButton} data-active={editor.isActive("bulletList")} aria-label="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" aria-hidden="true" />
        </button>
        <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />
        <button type="button" className="inline-flex h-9 items-center gap-2 border border-transparent px-2 text-sm text-reading/80 hover:border-white/20 hover:text-reading" aria-label="Insert image" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="size-4" aria-hidden="true" /> Image
        </button>
        <button type="button" className="inline-flex h-9 items-center gap-2 border border-transparent px-2 text-sm text-reading/80 hover:border-white/20 hover:text-reading" aria-label="Insert video link" data-active={videoOpen} onClick={() => setVideoOpen((v) => !v)}>
          <Video className="size-4" aria-hidden="true" /> Video link
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
        <button type="button" className={cn(toolbarButton, "ml-auto")} aria-label={expanded ? "Minimise editor" : "Expand editor"} onClick={() => setExpanded((v) => !v)}>
          {expanded ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
        </button>
      </div>

      {videoOpen && (
        <div className="flex flex-col gap-2 border-b border-white/15 p-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <input
              aria-label="Video link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube, Vimeo or Instagram link"
              className="h-10 w-full border border-white/20 bg-transparent px-3 text-sm text-reading placeholder:text-white/35 focus:border-gold focus:outline-none"
            />
            {videoError && <p className="mt-1.5 text-xs text-[#ee8585]">{videoError}</p>}
          </div>
          <Button type="button" variant="gold" size="sm" onClick={addVideo}>Add video</Button>
        </div>
      )}

      <div className={cn(expanded && "mx-auto w-full max-w-3xl flex-1")}>
        <EditorContent editor={editor} />
        {imageError && <p role="alert" className="border-t border-white/15 px-4 py-2 text-sm text-[#ee8585]">{imageError}</p>}
      </div>
    </div>
  );
}

function parseValue(value: string) {
  if (!value) return { type: "doc", content: [{ type: "paragraph" }] };
  try {
    return JSON.parse(value);
  } catch {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] };
  }
}

export type { Editor };
