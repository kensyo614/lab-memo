"use client";
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import type { Tag } from "@/generated/prisma/client";

const RESOURCE_TYPES = [
  { value: "PDF", label: "PDF", isFile: true },
  { value: "WEB", label: "Webページ", isFile: false },
  { value: "VIDEO", label: "動画", isFile: false },
  { value: "GITHUB", label: "GitHub", isFile: false },
  { value: "OTHER", label: "その他", isFile: true },
];

type DefaultValues = {
  resourceId: string;
  resourceType: string;
  title: string;
  url: string;
  memo: string;
  filePath: string | null;
  tagIds: string[];
};

type Props = {
  tags: Tag[];
  userId: string;
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: DefaultValues;
};

export function ResourceForm({ tags, userId, action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  const [resourceType, setResourceType] = useState(
    defaultValues?.resourceType ?? "PDF",
  );

  const isFileType =
    RESOURCE_TYPES.find((item) => item.value === resourceType)?.isFile ?? false;
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    defaultValues?.tagIds ?? [],
  );

  const [fileName, setFileName] = useState<string | null>(
    defaultValues?.filePath ? "登録済みのファイル" : null,
  );
  const [filePath, setFilePath] = useState<string | null>(
    defaultValues?.filePath ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setFilePath(null);

    if (file.size > MAX_FILE_SIZE) {
      setFileError("50MBを超えるファイルはアップロードできません。");
      setFileName(null);
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const supabase = createClient();

      const extension = file.name.split(".").pop() ?? "pdf";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from("resources")
        .upload(path, file, {
          contentType: file.type || "application/pdf",
          upsert: false,
        });

      if (error) {
        setFileError(`アップロードに失敗しました: ${error.message}`);
        setFileName(null);
        return;
      }

      setFilePath(path);
    } finally {
      setIsUploading(false);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  return (
    <form
      id="resource-form"
      action={formAction}
      style={{
        width: 720,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {state?.error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            backgroundColor: "#FDF3EF",
            border: "1px solid #F0D9D0",
            borderRadius: 6,
            padding: "10px 12px",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#B14B2C",
              color: "#FFFFFF",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
              marginTop: 1,
            }}
          >
            !
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.7, color: "#8F3D24" }}>
            {state.error}
          </span>
        </div>
      )}

      {isPending && (
        <p style={{ fontSize: 12.5, color: "#6E6E6E" }}>保存中...</p>
      )}


      {defaultValues && (
        <input
          type="hidden"
          name="resource_id"
          value={defaultValues.resourceId}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <label style={{ fontSize: 12.5, fontWeight: 500 }}>
          種類 <span style={{ color: "#B14B2C" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {RESOURCE_TYPES.map((item) => {
            const isSelected = resourceType === item.value

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setResourceType(item.value)}
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 18px",
                  borderRadius: 6,
                  border: isSelected
                    ? "1.5px solid #1A66C4"
                    : "1px solid #DDDDDD",
                  backgroundColor: isSelected ? "#F2F7FD" : "#FFFFFF",
                  color: isSelected ? "#1A66C4" : "#444444",
                  fontSize: 13,
                  fontWeight: isSelected ? 500 : 400,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="resource_type" value={resourceType} />
      </div>

      {isFileType ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          <label style={{ fontSize: 12.5, fontWeight: 500 }}>
            ファイル <span style={{ color: "#B14B2C" }}>*</span>
          </label>
          <label
            htmlFor="file"
            style={{
              border: "1.5px dashed #DDDDDD",
              borderRadius: 6,
              backgroundColor: "#FAFAFA",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 13.5 }}>
              ここにPDFをドロップ、または
              <span style={{ color: "#1A66C4" }}> ファイルを選択</span>
            </span>
            <span style={{ fontSize: 11.5, color: "#6E6E6E" }}>
              PDF / 最大 50 MB
            </span>
          </label>
          <input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {fileName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: "1px solid #E5E5E5",
                borderRadius: 6,
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#B14B2C",
                  backgroundColor: "#FDF3EF",
                  padding: "3px 8px",
                  borderRadius: 4,
                }}
              >
                PDF
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: isUploading ? "#6E6E6E" : "#2F6B4F",
                    marginTop: 4,
                  }}
                >
                  {isUploading ? "アップロード中..." : "アップロード済み"}
                </div>
              </div>
            </div>
          )}

          {fileError && (
            <p style={{ fontSize: 12, color: "#B14B2C", margin: 0 }}>
              {fileError}
            </p>
          )}

          <input type="hidden" name="file_path" value={filePath ?? ""} />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
          }}
        >
          <label htmlFor="url" style={{ fontSize: 12.5, fontWeight: 500 }}>
            URL <span style={{ color: "#B14B2C" }}>*</span>
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://example.com"
            style={{
              height: 38,
              border: "1px solid #DDDDDD",
              borderRadius: 6,
              padding: "0 12px",
              fontSize: 13.5,
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <label htmlFor="title" style={{ fontSize: 12.5, fontWeight: 500 }}>
          タイトル <span style={{ color: "#B14B2C" }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          style={{
            height: 38,
            border: "1px solid #DDDDDD",
            borderRadius: 6,
            padding: "0 12px",
            fontSize: 13.5,
          }}
        />
      </div>


      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <label style={{ fontSize: 12.5, fontWeight: 500 }}>タグ</label>
          <span style={{ fontSize: 11.5, color: "#6E6E6E" }}>任意</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.tag_id);

            return (
              <button
                key={tag.tag_id}
                type="button"
                onClick={() => toggleTag(tag.tag_id)}
                style={{
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  borderRadius: 6,
                  border: isSelected
                    ? "1.5px solid #1A66C4"
                    : "1px solid #DDDDDD",
                  backgroundColor: isSelected ? "#F2F7FD" : "#FFFFFF",
                  color: isSelected ? "#1A66C4" : "#444444",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {tag.name}
              </button>
            );
          })}
          {tags.length === 0 && (
            <span style={{ fontSize: 12.5, color: "#6E6E6E" }}>
              まだタグがありません。
            </span>
          )}
        </div>
        {selectedTagIds.map((tagId) => (
          <input key={tagId} type="hidden" name="tag_ids" value={tagId} />
        ))}

        <input
          name="new_tags"
          placeholder="新しいタグを空白区切りで入力（例：長文脈 評価指標）"
          style={{
            height: 38,
            border: "1px solid #DDDDDD",
            borderRadius: 6,
            padding: "0 12px",
            fontSize: 13.5,
          }}
        />
        <span style={{ fontSize: 11.5, color: "#6E6E6E" }}>
          既にある名前を入力した場合は、そのタグが使われます。
        </span>
      </div>


      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <label htmlFor="memo" style={{ fontSize: 12.5, fontWeight: 500 }}>
            メモ
          </label>
          <span style={{ fontSize: 11.5, color: "#6E6E6E" }}>任意</span>
        </div>
        <textarea
          id="memo"
          name="memo"
          defaultValue={defaultValues?.memo ?? ""}
          style={{
            height: 150,
            border: "1px solid #DDDDDD",
            borderRadius: 6,
            padding: "12px 14px",
            fontSize: 14,
            lineHeight: 1.9,
            resize: "vertical",
          }}
        />
      </div>
    </form>
  );
}
