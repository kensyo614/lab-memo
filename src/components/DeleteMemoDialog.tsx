"use client";
import { useActionState, useState } from "react";
import { deleteMemo } from "@/lib/actions";

type Props = {
  memoId: string;
  title: string;
};

export function DeleteMemoDialog({ memoId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteMemo, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          height: 38,
          padding: "0 14px",
          border: "1px solid #DDDDDD",
          backgroundColor: "#FFFFFF",
          borderRadius: 6,
          fontSize: 13,
          color: "#B14B2C",
          cursor: "pointer",
        }}
      >
        削除
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440,
              backgroundColor: "#FFFFFF",
              borderRadius: 6,
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.2)",
              padding: "26px 26px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              color: "#111111",
            }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>
              このメモを削除しますか？
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#444444" }}>
              「{title}」が削除されます。削除したメモは元に戻せません。
            </p>

            {state?.error && (
              <p style={{ fontSize: 12.5, color: "#B14B2C" }}>{state.error}</p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 6,
              }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => setIsOpen(false)}
                style={{
                  height: 38,
                  padding: "0 18px",
                  border: "1px solid #111111",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>

              <form action={formAction}>
                <input type="hidden" name="memo_id" value={memoId} />
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    height: 38,
                    padding: "0 18px",
                    border: "none",
                    backgroundColor: "#B14B2C",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#FFFFFF",
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? "削除中..." : "削除する"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
