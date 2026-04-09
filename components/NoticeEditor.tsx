"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./notice-editor.module.css";

type NoticeEditorProps = {
  name: string;
  initialValue: string;
};

type ToastEditorInstance = {
  destroy: () => void;
  getHTML: () => string;
};

type ToastEditorConstructor = new (options: {
  el: HTMLElement;
  height: string;
  initialEditType: "wysiwyg";
  previewStyle: "vertical";
  initialValue: string;
  hideModeSwitch: boolean;
  events: {
    change: () => void;
  };
  hooks: {
    addImageBlobHook: (
      blob: Blob | File,
      callback: (url: string, altText?: string) => void,
    ) => Promise<void>;
  };
}) => ToastEditorInstance;

async function uploadImage(file: Blob | File) {
  const formData = new FormData();
  const imageFile =
    file instanceof File ? file : new File([file], "notice-image.png");

  formData.append("file", imageFile);

  const response = await fetch("/api/notice-images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    throw new Error(result.error || "이미지 업로드에 실패했습니다.");
  }

  const result = (await response.json()) as { url?: string };

  if (!result.url) {
    throw new Error("이미지 업로드 경로를 확인하지 못했습니다.");
  }

  return result.url;
}

export default function NoticeEditor({
  name,
  initialValue,
}: NoticeEditorProps) {
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<ToastEditorInstance | null>(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    let mounted = true;

    async function mountEditor() {
      if (!editorRootRef.current) {
        return;
      }

      editorRootRef.current.innerHTML = "";

      const editorModule = (await import("@toast-ui/editor")) as {
        default: ToastEditorConstructor;
      };

      if (!mounted || !editorRootRef.current) {
        return;
      }

      const Editor = editorModule.default;

      editorInstanceRef.current = new Editor({
        el: editorRootRef.current,
        height: "480px",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        initialValue,
        hideModeSwitch: true,
        events: {
          change: () => {
            setValue(editorInstanceRef.current?.getHTML() ?? "");
          },
        },
        hooks: {
          addImageBlobHook: async (blob, callback) => {
            try {
              const url = await uploadImage(blob);
              callback(
                url,
                blob instanceof File ? blob.name : "notice uploaded image",
              );
              setValue(editorInstanceRef.current?.getHTML() ?? "");
            } catch (error) {
              if (error instanceof Error) {
                window.alert(error.message);
              }
            }
          },
        },
      });

      setValue(editorInstanceRef.current.getHTML());
    }

    void mountEditor();

    return () => {
      mounted = false;
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, [initialValue]);

  return (
    <div className={styles.editorWrap}>
      <div ref={editorRootRef} />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
