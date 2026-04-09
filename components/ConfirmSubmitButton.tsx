"use client";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  message?: string;
};

export default function ConfirmSubmitButton({
  children,
  className,
  message = "삭제하시겠습니까?",
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
