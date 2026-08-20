"use client";
import { useState } from "react";
import { deleteResource } from "@/lib/actions";
type Props = {
  resourceId: string;
  title: string;
};

export function DeleteResourceDialog({ resourceId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
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
              この情報を削除しますか？
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#444444" }}>
              「{title}
              」と、この情報に書いたメモが削除されます。削除した情報は元に戻せません。
            </p>

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

              <form action={deleteResource}>
                <input type="hidden" name="resource_id" value={resourceId} />
                <button
                  type="submit"
                  style={{
                    height: 38,
                    padding: "0 18px",
                    border: "none",
                    backgroundColor: "#B14B2C",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  削除する
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
