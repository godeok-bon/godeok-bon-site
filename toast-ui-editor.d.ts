declare module "@toast-ui/editor" {
  export type EditorConstructor = new (options: {
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
  }) => {
    destroy: () => void;
    getHTML: () => string;
  };

  const Editor: EditorConstructor;
  export default Editor;
}
